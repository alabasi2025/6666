/**
 * محرك الجدولة الوقائية
 * Preventive Maintenance Scheduling Engine
 * 
 * محرك يجدول أعمال الصيانة الوقائية تلقائياً حسب الوقت أو الاستخدام
 */

import { eq, and, gte, lte, sql, inArray, desc } from "drizzle-orm";
import { getDb } from "../db";
import { maintenancePlans, workOrders, assets, metersEnhanced, meterReadingsEnhanced } from "../../drizzle/schema";
import { logger } from "../utils/logger";
import * as db from "../db-modules/maintenance";

// ============================================
// Types
// ============================================

export interface PMPlan {
  id: number;
  businessId: number;
  code: string;
  nameAr: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "semi_annual" | "annual";
  intervalDays?: number;
  basedOn: "calendar" | "meter" | "condition";
  meterType?: string;
  meterInterval?: number;
  assetCategoryId?: number;
  isActive: boolean;
}

export interface ScheduledWorkOrder {
  workOrderId: number;
  planId: number;
  assetId: number;
  scheduledDate: Date;
}

// ============================================
// Preventive Scheduling Engine Class
// ============================================

export class PreventiveSchedulingEngine {
  /**
   * فحص جميع الخطط وإنشاء أوامر العمل المستحقة
   * يتم استدعاؤها من Cron Job يومياً
   */
  static async schedulePreventiveMaintenance(businessId: number, userId: number = 1): Promise<{
    scheduled: number;
    workOrderIds: number[];
  }> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    try {
      // جلب جميع الخطط النشطة
      const plans = await dbInstance
        .select()
        .from(maintenancePlans)
        .where(and(eq(maintenancePlans.businessId, businessId), eq(maintenancePlans.isActive, true)));

      const workOrderIds: number[] = [];
      let scheduled = 0;

      for (const plan of plans) {
        try {
          const result = await this.checkAndSchedulePlan(plan, userId);
          if (result) {
            workOrderIds.push(...result.workOrderIds);
            scheduled += result.count;
          }
        } catch (error: any) {
          logger.error("Failed to schedule plan", {
            error: error.message,
            planId: plan.id,
          });
        }
      }

      logger.info("Preventive maintenance scheduling completed", {
        businessId,
        plansChecked: plans.length,
        scheduled,
        workOrderIds,
      });

      return { scheduled, workOrderIds };
    } catch (error: any) {
      logger.error("Failed to schedule preventive maintenance", {
        error: error.message,
        businessId,
      });
      throw error;
    }
  }

  /**
   * فحص خطة واحدة وإنشاء أوامر العمل إذا استحقت
   */
  static async checkAndSchedulePlan(
    plan: PMPlan,
    userId: number
  ): Promise<{ count: number; workOrderIds: number[] } | null> {
    const dbInstance = await getDb();
    if (!dbInstance) return null;

    try {
      if (plan.basedOn === "calendar") {
        return await this.scheduleByCalendar(plan, userId);
      } else if (plan.basedOn === "meter") {
        return await this.scheduleByMeter(plan, userId);
      } else if (plan.basedOn === "condition") {
        // ✅ تنفيذ الجدولة حسب الحالة
        // التحقق من حالة الأصل وإذا كانت تتطلب صيانة
        try {
          const dbInstance = await getDb();
          if (!dbInstance) return null;

          // جلب جميع الأصول المرتبطة بالخطة
          const assetConditions = [
            eq(assets.businessId, plan.businessId),
            eq(assets.isActive, true),
          ];

          if (plan.assetCategoryId) {
            assetConditions.push(eq(assets.categoryId || (assets as any).assetCategoryId, plan.assetCategoryId));
          }

          const assetsList = await dbInstance
            .select({
              id: assets.id,
              status: assets.status,
              condition: assets.condition,
              lastMaintenanceDate: assets.lastMaintenanceDate,
            })
            .from(assets)
            .where(and(...assetConditions));

          const workOrderIds: number[] = [];

          for (const asset of assetsList) {
            // التحقق من حالة الأصل (إذا كانت الحالة أقل من عتبة معينة، تحتاج صيانة)
            // نستخدم condition field أو status field
            const assetCondition = parseFloat(asset.condition?.toString() || "100");
            const conditionThreshold = parseFloat((plan as any).conditionThreshold || "70");

            if (assetCondition <= conditionThreshold) {
              // إنشاء أمر عمل
              try {
                const result = await db.generateWorkOrdersFromPlan({
                  planId: plan.id,
                  assetIds: [asset.id],
                  scheduledDate: new Date().toISOString(),
                  userId,
                });
                
                if (result && result.orderIds) {
                  workOrderIds.push(...result.orderIds);
                }
              } catch (woError: any) {
                logger.error('Failed to create work order for condition-based PM', {
                  planId: plan.id,
                  assetId: asset.id,
                  error: woError.message,
                });
              }
            }
          }

          return { count: workOrderIds.length, workOrderIds };
        } catch (error: any) {
          logger.error('Failed to schedule by condition', {
            planId: plan.id,
            error: error.message,
          });
          return { count: 0, workOrderIds: [] };
        }
      }

      return null;
    } catch (error: any) {
      logger.error("Failed to check plan", {
        error: error.message,
        planId: plan.id,
      });
      return null;
    }
  }

  /**
   * الجدولة حسب التقويم (الوقت)
   */
  static async scheduleByCalendar(
    plan: PMPlan,
    userId: number
  ): Promise<{ count: number; workOrderIds: number[] }> {
    const dbInstance = await getDb();
    if (!dbInstance) return { count: 0, workOrderIds: [] };

    try {
      // حساب عدد الأيام المطلوبة
      const intervalDays = plan.intervalDays || this.getIntervalDaysFromFrequency(plan.frequency);

      // جلب الأصول المرتبطة بالخطة
      let assetConditions = [eq(assets.businessId, plan.businessId), eq(assets.status, "active")];
      if (plan.assetCategoryId) {
        assetConditions.push(eq(assets.categoryId, plan.assetCategoryId));
      }

      const assetsList = await dbInstance
        .select({
          id: assets.id,
          businessId: assets.businessId,
          branchId: assets.branchId,
          stationId: assets.stationId,
          nameAr: assets.nameAr,
        })
        .from(assets)
        .where(and(...assetConditions));

      const workOrderIds: number[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const asset of assetsList) {
        // جلب آخر أمر عمل وقائي لهذا الأصل
        const [lastWorkOrder] = await dbInstance
          .select({
            scheduledStart: workOrders.scheduledStart,
            actualStart: workOrders.actualStart,
          })
          .from(workOrders)
          .where(
            and(
              eq(workOrders.assetId, asset.id),
              eq(workOrders.type, "preventive"),
              eq(workOrders.status, "completed")
            )
          )
          .orderBy(sql`${workOrders.actualStart} DESC`)
          .limit(1);

        let shouldSchedule = false;
        let scheduledDate = new Date(today);

        if (!lastWorkOrder || !lastWorkOrder.actualStart) {
          // لا يوجد صيانة سابقة - جدول فوراً
          shouldSchedule = true;
        } else {
          // حساب التاريخ المستحق
          const lastDate = new Date(lastWorkOrder.actualStart);
          lastDate.setHours(0, 0, 0, 0);
          const dueDate = new Date(lastDate);
          dueDate.setDate(dueDate.getDate() + intervalDays);

          // إذا استحق، جدول
          if (dueDate <= today) {
            shouldSchedule = true;
            scheduledDate = dueDate;
          }
        }

        if (shouldSchedule) {
          // التحقق من عدم وجود أمر عمل مفتوح لنفس الأصل والخطة
          const [existingOrder] = await dbInstance
            .select({ id: workOrders.id })
            .from(workOrders)
            .where(
              and(
                eq(workOrders.assetId, asset.id),
                eq(workOrders.type, "preventive"),
                sql`${workOrders.status} IN ('pending', 'approved', 'assigned', 'in_progress')`
              )
            )
            .limit(1);

          if (!existingOrder) {
            // إنشاء أمر العمل
            const result = await db.generateWorkOrdersFromPlan({
              planId: plan.id,
              assetIds: [asset.id],
              scheduledDate: scheduledDate.toISOString(),
              userId,
            });

            workOrderIds.push(...result.orderIds);
          }
        }
      }

      return { count: workOrderIds.length, workOrderIds };
    } catch (error: any) {
      logger.error("Failed to schedule by calendar", {
        error: error.message,
        planId: plan.id,
      });
      return { count: 0, workOrderIds: [] };
    }
  }

  /**
   * الجدولة حسب العداد (الاستخدام)
   */
  static async scheduleByMeter(
    plan: PMPlan,
    userId: number
  ): Promise<{ count: number; workOrderIds: number[] }> {
    const dbInstance = await getDb();
    if (!dbInstance) return { count: 0, workOrderIds: [] };

    try {
      if (!plan.meterType || !plan.meterInterval) {
        logger.warn("Plan missing meter configuration", { planId: plan.id });
        return { count: 0, workOrderIds: [] };
      }

      // جلب الأصول المرتبطة بالخطة
      let assetConditions = [eq(assets.businessId, plan.businessId), eq(assets.status, "active")];
      if (plan.assetCategoryId) {
        assetConditions.push(eq(assets.categoryId, plan.assetCategoryId));
      }

      const assetsList = await dbInstance
        .select({
          id: assets.id,
          businessId: assets.businessId,
          branchId: assets.branchId,
          stationId: assets.stationId,
          nameAr: assets.nameAr,
          currentValue: assets.currentValue, // قد يكون ساعات التشغيل
        })
        .from(assets)
        .where(and(...assetConditions));

      const workOrderIds: number[] = [];

      for (const asset of assetsList) {
        // جلب آخر قراءة للعداد
        const lastReading = await this.getLastMeterReading(asset.id, plan.meterType);
        if (!lastReading) continue;

        const currentValue = parseFloat(asset.currentValue || "0");
        const lastPMValue = lastReading.lastPMValue || 0;
        const interval = parseFloat(plan.meterInterval || "0");

        // حساب القيمة المستحقة
        const dueValue = lastPMValue + interval;

        // إذا وصلنا للقيمة المستحقة
        if (currentValue >= dueValue) {
          // التحقق من عدم وجود أمر عمل مفتوح
          const [existingOrder] = await dbInstance
            .select({ id: workOrders.id })
            .from(workOrders)
            .where(
              and(
                eq(workOrders.assetId, asset.id),
                eq(workOrders.type, "preventive"),
                sql`${workOrders.status} IN ('pending', 'approved', 'assigned', 'in_progress')`
              )
            )
            .limit(1);

          if (!existingOrder) {
            // إنشاء أمر العمل
            const result = await db.generateWorkOrdersFromPlan({
              planId: plan.id,
              assetIds: [asset.id],
              scheduledDate: new Date().toISOString(),
              userId,
            });

            workOrderIds.push(...result.orderIds);

            // تحديث آخر قيمة PM
            await this.updateLastPMValue(asset.id, plan.meterType, currentValue);
          }
        }
      }

      return { count: workOrderIds.length, workOrderIds };
    } catch (error: any) {
      logger.error("Failed to schedule by meter", {
        error: error.message,
        planId: plan.id,
      });
      return { count: 0, workOrderIds: [] };
    }
  }

  /**
   * حساب عدد الأيام من التكرار
   */
  static getIntervalDaysFromFrequency(
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "semi_annual" | "annual"
  ): number {
    const intervals: Record<string, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      semi_annual: 180,
      annual: 365,
    };

    return intervals[frequency] || 30;
  }

  /**
   * جلب آخر قراءة للعداد
   */
  static async getLastMeterReading(assetId: number, meterType: string): Promise<{
    value: number;
    lastPMValue: number;
  } | null> {
    // ✅ تنفيذ جلب آخر قراءة من جدول meter_readings أو scada_readings
    try {
      const db = await getDb();
      if (!db) return null;

      // البحث في meter_readings_enhanced أولاً
      if (meterType === 'energy' || meterType === 'consumption') {
        // جلب العداد المرتبط بالأصل
        const [meter] = await db
          .select({ id: metersEnhanced.id })
          .from(metersEnhanced)
          .where(sql`${(metersEnhanced as any).assetId} = ${assetId} OR ${(metersEnhanced as any).relatedAssetId} = ${assetId}`)
          .limit(1);

        if (meter) {
          const [lastReading] = await db
            .select({
              currentReading: meterReadingsEnhanced.currentReading,
              consumption: meterReadingsEnhanced.consumption,
            })
            .from(meterReadingsEnhanced)
            .where(and(
              eq(meterReadingsEnhanced.meterId, meter.id),
              sql`${meterReadingsEnhanced.isApproved} = true`
            ))
            .orderBy(desc(meterReadingsEnhanced.readingDate))
            .limit(1);

          if (lastReading) {
            const value = parseFloat(lastReading.currentReading?.toString() || "0");
            // جلب آخر قيمة PM محفوظة
            const lastPMValue = await this.getSavedLastPMValue(assetId, meterType);
            return { value, lastPMValue };
          }
        }
      }

      // البحث في scada_readings إذا كان متاحاً
      // يمكن إضافة منطق مشابه لـ SCADA readings هنا

      return null;
    } catch (error: any) {
      logger.error('Failed to get last meter reading', {
        assetId,
        meterType,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * جلب آخر قيمة PM محفوظة
   */
  private static async getSavedLastPMValue(assetId: number, meterType: string): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;

      // البحث في جدول assets في حقل lastPMValue أو metadata
      const [asset] = await db
        .select({
          metadata: assets.metadata,
        })
        .from(assets)
        .where(eq(assets.id, assetId))
        .limit(1);

      if (asset?.metadata) {
        const metadata = typeof asset.metadata === 'string' 
          ? JSON.parse(asset.metadata) 
          : asset.metadata;
        return parseFloat(metadata?.lastPMValue?.[meterType] || "0");
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * تحديث آخر قيمة PM
   */
  static async updateLastPMValue(assetId: number, meterType: string, value: number): Promise<void> {
    // ✅ حفظ آخر قيمة PM في metadata الخاص بالأصل
    try {
      const db = await getDb();
      if (!db) return;

      // جلب الأصل الحالي
      const [asset] = await db
        .select({
          id: assets.id,
          metadata: assets.metadata,
        })
        .from(assets)
        .where(eq(assets.id, assetId))
        .limit(1);

      if (!asset) {
        logger.warn('Asset not found for PM value update', { assetId });
        return;
      }

      // تحديث metadata
      const currentMetadata = asset.metadata 
        ? (typeof asset.metadata === 'string' ? JSON.parse(asset.metadata) : asset.metadata)
        : {};
      
      if (!currentMetadata.lastPMValue) {
        currentMetadata.lastPMValue = {};
      }
      currentMetadata.lastPMValue[meterType] = value;
      currentMetadata.lastPMUpdate = new Date().toISOString();

      // تحديث الأصل
      await db
        .update(assets)
        .set({
          metadata: currentMetadata as any,
          updatedAt: sql`NOW()`,
        })
        .where(eq(assets.id, assetId));

      logger.info('PM value updated', { assetId, meterType, value });
    } catch (error: any) {
      logger.error('Failed to update last PM value', {
        assetId,
        meterType,
        value,
        error: error.message,
      });
    }
  }

  /**
   * جلب الخطط المستحقة لأصل محدد
   */
  static async getDuePlansForAsset(assetId: number): Promise<PMPlan[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const [asset] = await dbInstance
        .select({
          businessId: assets.businessId,
          categoryId: assets.categoryId,
        })
        .from(assets)
        .where(eq(assets.id, assetId))
        .limit(1);

      if (!asset) return [];

      let conditions = [
        eq(maintenancePlans.businessId, asset.businessId),
        eq(maintenancePlans.isActive, true),
      ];

      if (asset.categoryId) {
        conditions.push(eq(maintenancePlans.assetCategoryId, asset.categoryId));
      }

      const plans = await dbInstance.select().from(maintenancePlans).where(and(...conditions));

      const duePlans: PMPlan[] = [];

      for (const plan of plans) {
        const result = await this.checkAndSchedulePlan(plan, 1);
        if (result && result.count > 0) {
          duePlans.push(plan as PMPlan);
        }
      }

      return duePlans;
    } catch (error: any) {
      logger.error("Failed to get due plans for asset", {
        error: error.message,
        assetId,
      });
      return [];
    }
  }
}


