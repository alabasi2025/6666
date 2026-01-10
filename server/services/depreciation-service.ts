/**
 * Depreciation Service
 * خدمة حساب الإهلاك الشهري للأصول
 */

import { logger } from '../utils/logger';
import { getDb } from '../db';
import { eq, and } from 'drizzle-orm';
import { assets, depreciationHistory } from '../../drizzle/schema';
import { AutoJournalEngine } from '../core/auto-journal-engine';

interface DepreciationResult {
  success: number;
  failed: number;
  errors: Array<{ assetId: number; error: string }>;
  totalDepreciation: number;
}

class DepreciationService {
  /**
   * حساب الإهلاك الشهري لجميع الأصول
   */
  async calculateMonthlyDepreciation(businessId: number): Promise<DepreciationResult> {
    logger.info(`Starting monthly depreciation calculation for business ${businessId}...`);
    
    const result: DepreciationResult = {
      success: 0,
      failed: 0,
      errors: [],
      totalDepreciation: 0,
    };

    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // جلب جميع الأصول النشطة القابلة للإهلاك
      const assetsList = await db.query.assets.findMany({
        where: and(
          eq(assets.businessId, businessId),
          eq(assets.isActive, true),
          // الأصول التي لها قيمة وطريقة إهلاك
          // depreciationMethod !== null
        ),
      });

      logger.info(`Found ${assetsList.length} assets for depreciation`);

      for (const asset of assetsList) {
        try {
          const depreciation = await this.calculateAssetDepreciation(asset, db);
          if (depreciation > 0) {
            result.totalDepreciation += depreciation;
            result.success++;
          }
        } catch (error: any) {
          logger.error(`Failed to calculate depreciation for asset ${asset.id}`, {
            error: error.message,
          });
          result.failed++;
          result.errors.push({
            assetId: asset.id,
            error: error.message,
          });
        }
      }

      logger.info('Monthly depreciation calculation completed', {
        businessId,
        success: result.success,
        failed: result.failed,
        totalDepreciation: result.totalDepreciation,
      });

      return result;
    } catch (error: any) {
      logger.error('Monthly depreciation calculation failed', {
        businessId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * حساب إهلاك أصل واحد
   */
  private async calculateAssetDepreciation(asset: any, db: any): Promise<number> {
    try {
      // التحقق من وجود طريقة إهلاك
      if (!asset.depreciationMethod || !asset.depreciationRate) {
        logger.debug(`Asset ${asset.id} has no depreciation method`, { assetId: asset.id });
        return 0;
      }

      // جلب القيمة الدفترية الحالية
      const bookValue = parseFloat(asset.currentValue || asset.purchaseCost || '0');
      const purchaseCost = parseFloat(asset.purchaseCost || '0');
      const salvageValue = parseFloat(asset.salvageValue || '0');
      const usefulLifeMonths = (asset.usefulLife || 0) * 12; // usefulLife is in years
      const depreciationRate = 10; // افتراض 10% سنوياً إذا لم يكن محدداً (يمكن جلبها من asset إذا كانت موجودة)

      if (bookValue <= 0) {
        logger.debug(`Asset ${asset.id} has zero or negative book value`, { bookValue });
        return 0;
      }

      let monthlyDepreciation = 0;

      // حساب الإهلاك حسب الطريقة
      if (asset.depreciationMethod === 'straight_line') {
        // القسط الثابت
        if (usefulLifeMonths > 0) {
          monthlyDepreciation = (purchaseCost - salvageValue) / usefulLifeMonths;
        }
      } else if (asset.depreciationMethod === 'declining_balance') {
        // القسط المتناقص
        monthlyDepreciation = bookValue * (depreciationRate / 12 / 100);
        
        // التأكد من عدم تجاوز القيمة القابلة للإهلاك
        const maxDepreciation = bookValue - salvageValue;
        if (monthlyDepreciation > maxDepreciation) {
          monthlyDepreciation = maxDepreciation;
        }
      } else {
        logger.warn(`Unknown depreciation method: ${asset.depreciationMethod}`, {
          assetId: asset.id,
        });
        return 0;
      }

      // التأكد من عدم تجاوز القيمة المتبقية
      if (bookValue - monthlyDepreciation < salvageValue) {
        monthlyDepreciation = bookValue - salvageValue;
      }

      if (monthlyDepreciation <= 0) {
        return 0;
      }

      // تحديث القيمة الدفترية والمجمع
      const newBookValue = bookValue - monthlyDepreciation;
      const newAccumulatedDepreciation = parseFloat(asset.accumulatedDepreciation || '0') + monthlyDepreciation;

      // تحديث الأصل في قاعدة البيانات
      await db.update(assets)
        .set({
          currentValue: newBookValue.toString(), // استخدام currentValue كـ bookValue
          accumulatedDepreciation: newAccumulatedDepreciation.toString(),
          updatedAt: new Date(),
        })
        .where(eq(assets.id, asset.id));

      // تسجيل الإهلاك في جدول depreciation_history
      await db.insert(depreciationHistory).values({
        assetId: asset.id,
        businessId: asset.businessId,
        depreciationDate: new Date(),
        depreciationAmount: monthlyDepreciation.toString(),
        bookValueBefore: bookValue.toString(),
        bookValueAfter: newBookValue.toString(),
        accumulatedDepreciation: newAccumulatedDepreciation.toString(),
        method: asset.depreciationMethod,
        createdAt: new Date(),
      });

      // إنشاء قيد محاسبي للإهلاك
      try {
        await AutoJournalEngine.createJournalEntry({
          businessId: asset.businessId,
          entryNumber: `DEP-${asset.id}-${Date.now()}`,
          entryDate: new Date(),
          description: `إهلاك شهري - ${asset.nameAr || asset.name}`,
          type: 'depreciation',
          lines: [
            {
              accountCode: '5200', // مصروف الإهلاك
              debit: monthlyDepreciation,
              credit: 0,
              description: `إهلاك ${asset.nameAr || asset.name}`,
            },
            {
              accountCode: '1900', // مخصص إهلاك الأصل
              debit: 0,
              credit: monthlyDepreciation,
              description: `مخصص إهلاك ${asset.nameAr || asset.name}`,
            },
          ],
          sourceModule: 'assets',
          sourceId: asset.id,
        });
      } catch (error: any) {
        logger.error('Failed to create depreciation journal entry', {
          assetId: asset.id,
          error: error.message,
        });
        // لا نرمي الخطأ - الإهلاك تم تسجيله في قاعدة البيانات
      }

      logger.info(`Depreciation calculated for asset ${asset.id}`, {
        assetId: asset.id,
        monthlyDepreciation,
        newBookValue,
      });

      return monthlyDepreciation;
    } catch (error: any) {
      logger.error(`Failed to calculate depreciation for asset ${asset.id}`, {
        error: error.message,
      });
      throw error;
    }
  }
}

export default new DepreciationService();
