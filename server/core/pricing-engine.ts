/**
 * محرك التسعير المرن
 * Flexible Pricing Engine
 * 
 * محرك مرن لحساب أسعار الاشتراكات والعدادات حسب النوع والاستخدام
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { pricingRules } from "../../drizzle/schemas/pricing";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

export interface PricingRule {
  id: number;
  businessId: number;
  meterType: "traditional" | "sts" | "iot";
  usageType: "residential" | "commercial" | "industrial";
  subscriptionFee: number;
  depositAmount: number;
  depositRequired: boolean;
  active: boolean;
}

export interface PricingResult {
  subscriptionFee: number;
  depositAmount: number;
  depositRequired: boolean;
  total: number;
  ruleId?: number;
}

// ============================================
// Pricing Engine Class
// ============================================

export class PricingEngine {
  /**
   * حساب السعر حسب نوع العداد ونوع الاستخدام
   */
  static async calculate(
    businessId: number,
    meterType: "traditional" | "sts" | "iot",
    usageType: "residential" | "commercial" | "industrial"
  ): Promise<PricingResult> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const [rule] = await db
        .select()
        .from(pricingRules)
        .where(
          and(
            eq(pricingRules.businessId, businessId),
            eq(pricingRules.meterType, meterType),
            eq(pricingRules.usageType, usageType),
            eq(pricingRules.active, true)
          )
        )
        .limit(1);

      if (!rule) {
        // القيم الافتراضية إذا لم توجد قاعدة
        logger.warn("No pricing rule found, using defaults", {
          businessId,
          meterType,
          usageType,
        });

        const defaults = this.getDefaultPricing(meterType, usageType);
        return {
          subscriptionFee: defaults.subscriptionFee,
          depositAmount: defaults.depositAmount,
          depositRequired: defaults.depositRequired,
          total: defaults.subscriptionFee + (defaults.depositRequired ? defaults.depositAmount : 0),
        };
      }

      const subscriptionFee = parseFloat(rule.subscriptionFee || "0");
      const depositAmount = parseFloat(rule.depositAmount || "0");
      const depositRequired = rule.depositRequired ?? true;

      // STS لا يحتاج تأمين
      const finalDepositRequired = meterType === "sts" ? false : depositRequired;
      const finalDepositAmount = finalDepositRequired ? depositAmount : 0;

      return {
        subscriptionFee,
        depositAmount: finalDepositAmount,
        depositRequired: finalDepositRequired,
        total: subscriptionFee + finalDepositAmount,
        ruleId: rule.id,
      };
    } catch (error: any) {
      logger.error("Failed to calculate pricing", {
        error: error.message,
        businessId,
        meterType,
        usageType,
      });
      throw error;
    }
  }

  /**
   * القيم الافتراضية للتسعير
   */
  static getDefaultPricing(
    meterType: "traditional" | "sts" | "iot",
    usageType: "residential" | "commercial" | "industrial"
  ): { subscriptionFee: number; depositAmount: number; depositRequired: boolean } {
    const defaults: Record<string, { subscriptionFee: number; depositAmount: number; depositRequired: boolean }> = {
      "traditional_residential": { subscriptionFee: 5000, depositAmount: 35000, depositRequired: true },
      "traditional_commercial": { subscriptionFee: 10000, depositAmount: 50000, depositRequired: true },
      "sts_residential": { subscriptionFee: 7000, depositAmount: 0, depositRequired: false },
      "sts_commercial": { subscriptionFee: 12000, depositAmount: 0, depositRequired: false },
      "iot_residential": { subscriptionFee: 6000, depositAmount: 30000, depositRequired: true },
      "iot_commercial": { subscriptionFee: 11000, depositAmount: 45000, depositRequired: true },
    };

    const key = `${meterType}_${usageType}`;
    return defaults[key] || { subscriptionFee: 5000, depositAmount: 35000, depositRequired: true };
  }

  /**
   * إنشاء قاعدة تسعير جديدة
   */
  static async createRule(data: {
    businessId: number;
    meterType: "traditional" | "sts" | "iot";
    usageType: "residential" | "commercial" | "industrial";
    subscriptionFee: number;
    depositAmount: number;
    depositRequired: boolean;
    notes?: string;
    createdBy: number;
  }): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // تعطيل القواعد القديمة لنفس النوع
      await db
        .update(pricingRules)
        .set({ active: false })
        .where(
          and(
            eq(pricingRules.businessId, data.businessId),
            eq(pricingRules.meterType, data.meterType),
            eq(pricingRules.usageType, data.usageType),
            eq(pricingRules.active, true)
          )
        );

      // إنشاء القاعدة الجديدة
      const [result] = await db.insert(pricingRules).values({
        businessId: data.businessId,
        meterType: data.meterType,
        usageType: data.usageType,
        subscriptionFee: data.subscriptionFee.toFixed(2),
        depositAmount: data.depositAmount.toFixed(2),
        depositRequired: data.depositRequired,
        active: true,
        notes: data.notes,
        createdBy: data.createdBy,
      });

      logger.info("Pricing rule created", {
        id: result.insertId,
        meterType: data.meterType,
        usageType: data.usageType,
      });

      return result.insertId;
    } catch (error: any) {
      logger.error("Failed to create pricing rule", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * تحديث قاعدة تسعير
   */
  static async updateRule(
    id: number,
    data: {
      subscriptionFee?: number;
      depositAmount?: number;
      depositRequired?: boolean;
      active?: boolean;
      notes?: string;
    }
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const updateData: any = {};
      if (data.subscriptionFee !== undefined) updateData.subscriptionFee = data.subscriptionFee.toFixed(2);
      if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount.toFixed(2);
      if (data.depositRequired !== undefined) updateData.depositRequired = data.depositRequired;
      if (data.active !== undefined) updateData.active = data.active;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await db.update(pricingRules).set(updateData).where(eq(pricingRules.id, id));

      logger.info("Pricing rule updated", { id });
    } catch (error: any) {
      logger.error("Failed to update pricing rule", {
        error: error.message,
        id,
        data,
      });
      throw error;
    }
  }

  /**
   * جلب جميع قواعد التسعير
   */
  static async getRules(businessId: number, activeOnly: boolean = true): Promise<PricingRule[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      let conditions = [eq(pricingRules.businessId, businessId)];
      if (activeOnly) {
        conditions.push(eq(pricingRules.active, true));
      }

      const rules = await db.select().from(pricingRules).where(and(...conditions));

      return rules.map((rule) => ({
        id: rule.id,
        businessId: rule.businessId,
        meterType: rule.meterType as "traditional" | "sts" | "iot",
        usageType: rule.usageType as "residential" | "commercial" | "industrial",
        subscriptionFee: parseFloat(rule.subscriptionFee || "0"),
        depositAmount: parseFloat(rule.depositAmount || "0"),
        depositRequired: rule.depositRequired ?? true,
        active: rule.active ?? true,
      }));
    } catch (error: any) {
      logger.error("Failed to get pricing rules", {
        error: error.message,
        businessId,
      });
      return [];
    }
  }
}

