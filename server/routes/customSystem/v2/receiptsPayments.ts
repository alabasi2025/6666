/**
 * النظام المخصص v2.2.0 - Receipts & Payments Router
 * إدارة سندات القبض والصرف (مع ربط القيود اليومية)
 */

import { Router } from "express";
import { db } from "../../../db";
import {
  customReceipts,
  customPayments,
  customJournalEntries,
  customJournalEntryLines,
  type InsertCustomReceipt,
  type InsertCustomPayment,
} from "../../../../drizzle/schemas/customSystemV2";
import { eq, and, desc, between } from "drizzle-orm";

const router = Router();

/**
 * ==================== سندات القبض ====================
 */

/**
 * GET /api/custom-system/v2/receipts
 * الحصول على جميع سندات القبض
 */
router.get("/receipts", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { subSystemId, status, startDate, endDate } = req.query;

    let query = db
      .select()
      .from(customReceipts)
      .where(eq(customReceipts.businessId, businessId));

    if (subSystemId) {
      query = query.where(eq(customReceipts.subSystemId, parseInt(String(subSystemId))));
    }

    if (status) {
      query = query.where(eq(customReceipts.status, String(status)));
    }

    if (startDate && endDate) {
      query = query.where(
        between(customReceipts.receiptDate, String(startDate), String(endDate))
      );
    }

    const receipts = await query.orderBy(desc(customReceipts.receiptDate), desc(customReceipts.id));

    res.json(receipts);
  } catch (error) {
    console.error("خطأ في جلب سندات القبض:", error);
    res.status(500).json({ error: "فشل في جلب سندات القبض" });
  }
});

/**
 * GET /api/custom-system/v2/receipts/:id
 * الحصول على سند قبض محدد مع القيد اليومي
 */
router.get("/receipts/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const receiptId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(receiptId)) {
      return res.status(400).json({ error: "معرف السند غير صحيح" });
    }

    // جلب السند
    const [receipt] = await db
      .select()
      .from(customReceipts)
      .where(
        and(
          eq(customReceipts.id, receiptId),
          eq(customReceipts.businessId, businessId)
        )
      )
      .limit(1);

    if (!receipt) {
      return res.status(404).json({ error: "السند غير موجود" });
    }

    // جلب القيد اليومي المرتبط
    let journalEntry = null;
    let journalEntryLines = [];

    if (receipt.journalEntryId) {
      const [entry] = await db
        .select()
        .from(customJournalEntries)
        .where(eq(customJournalEntries.id, receipt.journalEntryId))
        .limit(1);

      if (entry) {
        journalEntry = entry;

        journalEntryLines = await db
          .select()
          .from(customJournalEntryLines)
          .where(eq(customJournalEntryLines.journalEntryId, receipt.journalEntryId))
          .orderBy(customJournalEntryLines.lineOrder);
      }
    }

    res.json({ ...receipt, journalEntry, journalEntryLines });
  } catch (error) {
    console.error("خطأ في جلب سند القبض:", error);
    res.status(500).json({ error: "فشل في جلب سند القبض" });
  }
});

/**
 * PUT /api/custom-system/v2/receipts/:id
 * تحديث سند قبض (فقط إذا كان draft)
 */
router.put("/receipts/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const receiptId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(receiptId)) {
      return res.status(400).json({ error: "معرف السند غير صحيح" });
    }

    // التحقق من وجود السند
    const [existing] = await db
      .select()
      .from(customReceipts)
      .where(
        and(
          eq(customReceipts.id, receiptId),
          eq(customReceipts.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "السند غير موجود" });
    }

    // منع تعديل السندات المعتمدة
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "لا يمكن تعديل سند معتمد" });
    }

    const { description, notes, attachments } = req.body;

    // تحديث بيانات السند
    const updateData: Partial<InsertCustomReceipt> = {};
    if (description !== undefined) updateData.description = description || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (attachments !== undefined) updateData.attachments = attachments || null;

    await db
      .update(customReceipts)
      .set(updateData)
      .where(
        and(
          eq(customReceipts.id, receiptId),
          eq(customReceipts.businessId, businessId)
        )
      );

    // جلب السند المحدث
    const [updated] = await db
      .select()
      .from(customReceipts)
      .where(eq(customReceipts.id, receiptId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تحديث سند القبض:", error);
    res.status(500).json({ error: "فشل في تحديث سند القبض" });
  }
});

/**
 * DELETE /api/custom-system/v2/receipts/:id
 * حذف سند قبض (فقط إذا كان draft)
 */
router.delete("/receipts/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const receiptId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(receiptId)) {
      return res.status(400).json({ error: "معرف السند غير صحيح" });
    }

    // التحقق من وجود السند
    const [existing] = await db
      .select()
      .from(customReceipts)
      .where(
        and(
          eq(customReceipts.id, receiptId),
          eq(customReceipts.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "السند غير موجود" });
    }

    // منع حذف السندات المعتمدة
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "لا يمكن حذف سند معتمد" });
    }

    // حذف السند
    await db
      .delete(customReceipts)
      .where(
        and(
          eq(customReceipts.id, receiptId),
          eq(customReceipts.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف سند القبض بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف سند القبض:", error);
    res.status(500).json({ error: "فشل في حذف سند القبض" });
  }
});

/**
 * ==================== سندات الصرف ====================
 */

/**
 * GET /api/custom-system/v2/payments
 * الحصول على جميع سندات الصرف
 */
router.get("/payments", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    const { subSystemId, status, startDate, endDate } = req.query;

    let query = db
      .select()
      .from(customPayments)
      .where(eq(customPayments.businessId, businessId));

    if (subSystemId) {
      query = query.where(eq(customPayments.subSystemId, parseInt(String(subSystemId))));
    }

    if (status) {
      query = query.where(eq(customPayments.status, String(status)));
    }

    if (startDate && endDate) {
      query = query.where(
        between(customPayments.paymentDate, String(startDate), String(endDate))
      );
    }

    const payments = await query.orderBy(desc(customPayments.paymentDate), desc(customPayments.id));

    res.json(payments);
  } catch (error) {
    console.error("خطأ في جلب سندات الصرف:", error);
    res.status(500).json({ error: "فشل في جلب سندات الصرف" });
  }
});

/**
 * GET /api/custom-system/v2/payments/:id
 * الحصول على سند صرف محدد مع القيد اليومي
 */
router.get("/payments/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const paymentId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "معرف السند غير صحيح" });
    }

    // جلب السند
    const [payment] = await db
      .select()
      .from(customPayments)
      .where(
        and(
          eq(customPayments.id, paymentId),
          eq(customPayments.businessId, businessId)
        )
      )
      .limit(1);

    if (!payment) {
      return res.status(404).json({ error: "السند غير موجود" });
    }

    // جلب القيد اليومي المرتبط
    let journalEntry = null;
    let journalEntryLines = [];

    if (payment.journalEntryId) {
      const [entry] = await db
        .select()
        .from(customJournalEntries)
        .where(eq(customJournalEntries.id, payment.journalEntryId))
        .limit(1);

      if (entry) {
        journalEntry = entry;

        journalEntryLines = await db
          .select()
          .from(customJournalEntryLines)
          .where(eq(customJournalEntryLines.journalEntryId, payment.journalEntryId))
          .orderBy(customJournalEntryLines.lineOrder);
      }
    }

    res.json({ ...payment, journalEntry, journalEntryLines });
  } catch (error) {
    console.error("خطأ في جلب سند الصرف:", error);
    res.status(500).json({ error: "فشل في جلب سند الصرف" });
  }
});

/**
 * PUT /api/custom-system/v2/payments/:id
 * تحديث سند صرف (فقط إذا كان draft)
 */
router.put("/payments/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const paymentId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "معرف السند غير صحيح" });
    }

    // التحقق من وجود السند
    const [existing] = await db
      .select()
      .from(customPayments)
      .where(
        and(
          eq(customPayments.id, paymentId),
          eq(customPayments.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "السند غير موجود" });
    }

    // منع تعديل السندات المعتمدة
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "لا يمكن تعديل سند معتمد" });
    }

    const { description, notes, attachments } = req.body;

    // تحديث بيانات السند
    const updateData: Partial<InsertCustomPayment> = {};
    if (description !== undefined) updateData.description = description || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (attachments !== undefined) updateData.attachments = attachments || null;

    await db
      .update(customPayments)
      .set(updateData)
      .where(
        and(
          eq(customPayments.id, paymentId),
          eq(customPayments.businessId, businessId)
        )
      );

    // جلب السند المحدث
    const [updated] = await db
      .select()
      .from(customPayments)
      .where(eq(customPayments.id, paymentId))
      .limit(1);

    res.json(updated);
  } catch (error) {
    console.error("خطأ في تحديث سند الصرف:", error);
    res.status(500).json({ error: "فشل في تحديث سند الصرف" });
  }
});

/**
 * DELETE /api/custom-system/v2/payments/:id
 * حذف سند صرف (فقط إذا كان draft)
 */
router.delete("/payments/:id", async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    const paymentId = parseInt(req.params.id);

    if (!businessId) {
      return res.status(400).json({ error: "معرف النشاط التجاري مطلوب" });
    }

    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "معرف السند غير صحيح" });
    }

    // التحقق من وجود السند
    const [existing] = await db
      .select()
      .from(customPayments)
      .where(
        and(
          eq(customPayments.id, paymentId),
          eq(customPayments.businessId, businessId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "السند غير موجود" });
    }

    // منع حذف السندات المعتمدة
    if (existing.status !== "draft") {
      return res.status(400).json({ error: "لا يمكن حذف سند معتمد" });
    }

    // حذف السند
    await db
      .delete(customPayments)
      .where(
        and(
          eq(customPayments.id, paymentId),
          eq(customPayments.businessId, businessId)
        )
      );

    res.json({ message: "تم حذف سند الصرف بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف سند الصرف:", error);
    res.status(500).json({ error: "فشل في حذف سند الصرف" });
  }
});

export default router;
