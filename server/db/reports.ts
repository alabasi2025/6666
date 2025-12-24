/**
 * @fileoverview دوال التقارير
 * @module server/db/reports
 */
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { getDb } from "../db";
import { assets, invoices, users } from "../../drizzle/schema";
import { logger } from "../logger";

interface MonthlyReport {
  totalAssets: number;
  totalInvoices: number;
  totalRevenue: number;
  totalDepreciation: number;
}

interface FinancialSummary {
  totalAssetValue: number;
  totalPaidInvoices: number;
  totalPendingInvoices: number;
  userCount: number;
}

/**
 * تقرير شهري
 */
export async function getMonthlyReport(
  businessId: number,
  year: number,
  month: number
): Promise<MonthlyReport> {
  const db = await getDb();
  logger.info("Generating monthly report", { businessId, year, month });
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  // جلب البيانات بالتوازي
  const [assetCount, invoiceData] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(eq(assets.businessId, businessId)),
    db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(total_amount), 0)`
    })
      .from(invoices)
      .where(
        and(
          eq(invoices.businessId, businessId),
          gte(invoices.createdAt, startDate),
          lte(invoices.createdAt, endDate)
        )
      )
  ]);
  
  return {
    totalAssets: assetCount[0]?.count || 0,
    totalInvoices: invoiceData[0]?.count || 0,
    totalRevenue: Number(invoiceData[0]?.total) || 0,
    totalDepreciation: 0
  };
}

/**
 * ملخص مالي
 */
export async function getFinancialSummary(businessId: number): Promise<FinancialSummary> {
  const db = await getDb();
  logger.info("Generating financial summary", { businessId });
  
  const [assetValue, paidInvoices, pendingInvoices, userCount] = await Promise.all([
    db.select({ total: sql<number>`COALESCE(SUM(current_value), 0)` })
      .from(assets)
      .where(eq(assets.businessId, businessId)),
    db.select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "paid"))),
    db.select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "draft"))),
    db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.businessId, businessId))
  ]);
  
  return {
    totalAssetValue: Number(assetValue[0]?.total) || 0,
    totalPaidInvoices: Number(paidInvoices[0]?.total) || 0,
    totalPendingInvoices: Number(pendingInvoices[0]?.total) || 0,
    userCount: userCount[0]?.count || 0
  };
}

/**
 * تقرير الأصول
 */
export async function getAssetReport(businessId: number) {
  const db = await getDb();
  
  return await db.select({
    id: assets.id,
    nameAr: assets.nameAr,
    categoryId: assets.categoryId,
    purchaseCost: assets.purchaseCost,
    currentValue: assets.currentValue,
    accumulatedDepreciation: assets.accumulatedDepreciation
  }).from(assets).where(eq(assets.businessId, businessId));
}
