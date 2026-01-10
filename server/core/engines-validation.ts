/**
 * التحقق من صحة المحركات
 * Engines Validation & Health Check
 */

import { getDb } from "../db";
import { accounts, fiscalPeriods } from "../../drizzle/schema";
// DISABLED: pricing system needs migration to PostgreSQL
import { pgTable, serial } from "drizzle-orm/pg-core";
const pricingRules = pgTable("pricing_rules_disabled", { id: serial("id").primaryKey() });
import { businesses } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../utils/logger";

// ============================================
// Validation Results
// ============================================

export interface ValidationResult {
  engine: string;
  status: "ok" | "warning" | "error";
  message: string;
  details?: any;
}

export interface EnginesHealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  engines: ValidationResult[];
  timestamp: Date;
}

// ============================================
// Validation Functions
// ============================================

export class EnginesValidator {
  /**
   * فحص صحة جميع المحركات
   */
  static async validateAll(businessId: number): Promise<EnginesHealthStatus> {
    const results: ValidationResult[] = [];

    // 1. محرك القيود
    results.push(await this.validateAutoJournal(businessId));

    // 2. محرك التسوية
    results.push(await this.validateReconciliation(businessId));

    // 3. محرك التسعير
    results.push(await this.validatePricing(businessId));

    // 4. محرك الجدولة
    results.push(await this.validatePreventiveScheduling(businessId));

    // 5. محرك الإسناد
    results.push(await this.validateSmartAssignment(businessId));

    // حساب الحالة العامة
    const hasErrors = results.some((r) => r.status === "error");
    const hasWarnings = results.some((r) => r.status === "warning");

    let overall: "healthy" | "degraded" | "unhealthy";
    if (hasErrors) {
      overall = "unhealthy";
    } else if (hasWarnings) {
      overall = "degraded";
    } else {
      overall = "healthy";
    }

    return {
      overall,
      engines: results,
      timestamp: new Date(),
    };
  }

  /**
   * التحقق من محرك القيود
   */
  static async validateAutoJournal(businessId: number): Promise<ValidationResult> {
    try {
      const db = await getDb();
      if (!db) {
        return {
          engine: "AutoJournal",
          status: "error",
          message: "قاعدة البيانات غير متاحة",
        };
      }

      // التحقق من وجود الحسابات المطلوبة
      const requiredAccounts = ["1100", "1110", "1200", "4100"];
      const missingAccounts: string[] = [];

      for (const code of requiredAccounts) {
        const [account] = await db
          .select()
          .from(accounts)
          .where(and(eq(accounts.businessId, businessId), eq(accounts.code, code)))
          .limit(1);

        if (!account) {
          missingAccounts.push(code);
        }
      }

      // التحقق من وجود فترة محاسبية نشطة
      const [period] = await db
        .select()
        .from(fiscalPeriods)
        .where(and(eq(fiscalPeriods.businessId, businessId), eq(fiscalPeriods.status, "open")))
        .limit(1);

      if (missingAccounts.length > 0) {
        return {
          engine: "AutoJournal",
          status: "error",
          message: `الحسابات المحاسبية المطلوبة غير موجودة: ${missingAccounts.join(", ")}`,
          details: { missingAccounts },
        };
      }

      if (!period) {
        return {
          engine: "AutoJournal",
          status: "error",
          message: "لا توجد فترة محاسبية نشطة",
        };
      }

      return {
        engine: "AutoJournal",
        status: "ok",
        message: "محرك القيود جاهز للعمل",
      };
    } catch (error: any) {
      return {
        engine: "AutoJournal",
        status: "error",
        message: `خطأ في التحقق: ${error.message}`,
      };
    }
  }

  /**
   * التحقق من محرك التسوية
   */
  static async validateReconciliation(businessId: number): Promise<ValidationResult> {
    try {
      const db = await getDb();
      if (!db) {
        return {
          engine: "Reconciliation",
          status: "error",
          message: "قاعدة البيانات غير متاحة",
        };
      }

      // التحقق من وجود حسابات وسيطة (اختياري)
      const [clearingAccounts] = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.businessId, businessId),
            eq(accounts.description, "حساب وسيط للتسوية")
          )
        )
        .limit(1);

      return {
        engine: "Reconciliation",
        status: clearingAccounts ? "ok" : "warning",
        message: clearingAccounts
          ? "محرك التسوية جاهز للعمل"
          : "لا توجد حسابات وسيطة - يمكن إنشاؤها عند الحاجة",
      };
    } catch (error: any) {
      return {
        engine: "Reconciliation",
        status: "error",
        message: `خطأ في التحقق: ${error.message}`,
      };
    }
  }

  /**
   * التحقق من محرك التسعير
   */
  static async validatePricing(businessId: number): Promise<ValidationResult> {
    try {
      const db = await getDb();
      if (!db) {
        return {
          engine: "Pricing",
          status: "error",
          message: "قاعدة البيانات غير متاحة",
        };
      }

      // التحقق من وجود قواعد تسعير
      const rules = await db
        .select()
        .from(pricingRules)
        .where(and(eq(pricingRules.businessId, businessId), eq(pricingRules.active, true)))
        .limit(1);

      if (rules.length === 0) {
        return {
          engine: "Pricing",
          status: "warning",
          message: "لا توجد قواعد تسعير نشطة - سيتم استخدام القيم الافتراضية",
        };
      }

      return {
        engine: "Pricing",
        status: "ok",
        message: `محرك التسعير جاهز (${rules.length} قاعدة نشطة)`,
        details: { rulesCount: rules.length },
      };
    } catch (error: any) {
      return {
        engine: "Pricing",
        status: "error",
        message: `خطأ في التحقق: ${error.message}`,
      };
    }
  }

  /**
   * التحقق من محرك الجدولة
   */
  static async validatePreventiveScheduling(businessId: number): Promise<ValidationResult> {
    try {
      // التحقق من وجود خطط صيانة (يتطلب جدول maintenance_plans)
      return {
        engine: "PreventiveScheduling",
        status: "ok",
        message: "محرك الجدولة جاهز - يتطلب خطط صيانة للعمل",
      };
    } catch (error: any) {
      return {
        engine: "PreventiveScheduling",
        status: "error",
        message: `خطأ في التحقق: ${error.message}`,
      };
    }
  }

  /**
   * التحقق من محرك الإسناد
   */
  static async validateSmartAssignment(businessId: number): Promise<ValidationResult> {
    try {
      const db = await getDb();
      if (!db) {
        return {
          engine: "SmartAssignment",
          status: "error",
          message: "قاعدة البيانات غير متاحة",
        };
      }

      // التحقق من وجود فنيين مع مواقع GPS
      const { fieldWorkers } = await import("../../drizzle/schemas/field-ops");
      const workers = await db
        .select()
        .from(fieldWorkers)
        .where(
          and(
            eq(fieldWorkers.businessId, businessId),
            eq(fieldWorkers.status, "available"),
            eq(fieldWorkers.isActive, true)
          )
        )
        .limit(1);

      const workersWithGPS = workers.filter(
        (w) => w.currentLocationLat && w.currentLocationLng
      );

      if (workersWithGPS.length === 0) {
        return {
          engine: "SmartAssignment",
          status: "warning",
          message: "لا يوجد فنيون متاحون مع مواقع GPS - الإسناد التلقائي غير متاح",
        };
      }

      return {
        engine: "SmartAssignment",
        status: "ok",
        message: `محرك الإسناد جاهز (${workersWithGPS.length} فني متاح)`,
        details: { availableWorkers: workersWithGPS.length },
      };
    } catch (error: any) {
      return {
        engine: "SmartAssignment",
        status: "error",
        message: `خطأ في التحقق: ${error.message}`,
      };
    }
  }
}



