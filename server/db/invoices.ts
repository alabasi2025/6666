/**
 * @fileoverview دوال CRUD للفواتير
 * @module server/db/invoices
 */
import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "../db";
import { invoices } from "../../drizzle/schema";
import { logger } from "../logger";

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * إنشاء فاتورة جديدة
 */
export async function createInvoice(data: InsertInvoice): Promise<Invoice> {
  const db = await getDb();
  logger.info("Creating new invoice", { invoiceNumber: data.invoiceNumber });
  
  const [result] = await db.insert(invoices).values(data);
  const [newInvoice] = await db.select().from(invoices).where(eq(invoices.id, result.insertId));
  
  return newInvoice;
}

/**
 * جلب جميع الفواتير
 */
export async function getInvoices(businessId?: number): Promise<Invoice[]> {
  const db = await getDb();
  
  if (businessId) {
    return await db.select().from(invoices).where(eq(invoices.businessId, businessId));
  }
  
  return await db.select().from(invoices);
}

/**
 * جلب فاتورة بالمعرف
 */
export async function getInvoiceById(id: number): Promise<Invoice | null> {
  const db = await getDb();
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
  return invoice || null;
}

/**
 * تحديث فاتورة
 */
export async function updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | null> {
  const db = await getDb();
  logger.info("Updating invoice", { id });
  
  await db.update(invoices).set(data).where(eq(invoices.id, id));
  return await getInvoiceById(id);
}

/**
 * حذف فاتورة
 */
export async function deleteInvoice(id: number): Promise<boolean> {
  const db = await getDb();
  logger.info("Deleting invoice", { id });
  
  const result = await db.delete(invoices).where(eq(invoices.id, id));
  return (result as any).rowsAffected > 0;
}

/**
 * جلب الفواتير حسب الفترة
 */
export async function getInvoicesByDateRange(
  businessId: number,
  startDate: Date,
  endDate: Date
): Promise<Invoice[]> {
  const db = await getDb();
  
  return await db.select().from(invoices).where(
    and(
      eq(invoices.businessId, businessId),
      gte(invoices.createdAt, startDate),
      lte(invoices.createdAt, endDate)
    )
  );
}
