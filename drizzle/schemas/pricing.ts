/**
 * جدول قواعد التسعير
 * Pricing Rules Schema
 */

import { pgTable, varchar, serial, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const pricingRules = pgTable("pricing_rules", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  meterType: varchar("meter_type", { length: 20 }).notNull(), // 'traditional', 'sts', 'iot'
  usageType: varchar("usage_type", { length: 20 }).notNull(), // 'residential', 'commercial', 'industrial'
  subscriptionFee: numeric("subscription_fee", { precision: 18, scale: 2 }).notNull(),
  depositAmount: numeric("deposit_amount", { precision: 18, scale: 2 }).default("0"),
  depositRequired: boolean("deposit_required").default(true),
  active: boolean("active").default(true),
  notes: varchar("notes", { length: 500 }),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

