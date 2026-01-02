import { mysqlTable, varchar, int, text, timestamp, boolean, decimal, json, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// 14. النظام المخصص - Custom System
// ============================================

// حسابات النظام المخصص - Custom Accounts
export const customAccounts = mysqlTable("custom_accounts", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: mysqlEnum("account_type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  parentId: int("parent_id"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// حركات الحسابات المخصصة - Custom Account Transactions
export const customTransactions = mysqlTable("custom_transactions", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  transactionNumber: varchar("transaction_number", { length: 50 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  accountId: int("account_id").notNull(),
  transactionType: mysqlEnum("transaction_type", ["debit", "credit"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  attachments: json("attachments"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// الملاحظات - Notes
export const customNotes = mysqlTable("custom_notes", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  color: varchar("color", { length: 20 }),
  isPinned: boolean("is_pinned").default(false),
  isArchived: boolean("is_archived").default(false),
  tags: json("tags"),
  attachments: json("attachments"),
  reminderDate: timestamp("reminder_date"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// المذكرات - Memos
export const customMemos = mysqlTable("custom_memos", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  memoNumber: varchar("memo_number", { length: 50 }).notNull(),
  memoDate: date("memo_date").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content"),
  memoType: mysqlEnum("memo_type", ["internal", "external", "circular", "directive"]).default("internal"),
  fromDepartment: varchar("from_department", { length: 255 }),
  toDepartment: varchar("to_department", { length: 255 }),
  status: mysqlEnum("status", ["draft", "sent", "received", "archived"]).default("draft"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  attachments: json("attachments"),
  responseRequired: boolean("response_required").default(false),
  responseDeadline: date("response_deadline"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// فئات الملاحظات - Note Categories
export const noteCategories = mysqlTable("note_categories", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
