import { pgTable, varchar, integer, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// نظام تطبيقات الجوال - Mobile Apps System
// ============================================

// التطبيقات - Mobile Apps
export const mobileApps = pgTable("mobile_apps", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  appType: varchar("app_type", { length: 20 }).notNull(),
  appName: varchar("app_name", { length: 255 }).notNull(),
  appVersion: varchar("app_version", { length: 50 }),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // إعدادات التطبيق (الألوان، الشعار، إلخ)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الشاشات - App Screens
export const mobileAppScreens = pgTable("mobile_app_screens", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull(),
  screenCode: varchar("screen_code", { length: 100 }).notNull(),
  screenNameAr: varchar("screen_name_ar", { length: 255 }).notNull(),
  screenNameEn: varchar("screen_name_en", { length: 255 }),
  screenType: varchar("screen_type", { length: 20 }).default("list"),
  routePath: varchar("route_path", { length: 255 }),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions"), // ['customer:view_invoices', ...]
  config: jsonb("config"), // إعدادات الشاشة
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الوظائف - App Features
export const mobileAppFeatures = pgTable("mobile_app_features", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull(),
  screenId: integer("screen_id"), // NULL = وظيفة عامة للتطبيق
  featureCode: varchar("feature_code", { length: 100 }).notNull(),
  featureNameAr: varchar("feature_name_ar", { length: 255 }).notNull(),
  featureNameEn: varchar("feature_name_en", { length: 255 }),
  featureType: varchar("feature_type", { length: 20 }).default("action"),
  permissionCode: varchar("permission_code", { length: 100 }),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // إعدادات الوظيفة
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الصلاحيات - App Permissions
export const mobileAppPermissions = pgTable("mobile_app_permissions", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull(),
  permissionCode: varchar("permission_code", { length: 100 }).notNull(),
  permissionNameAr: varchar("permission_name_ar", { length: 255 }).notNull(),
  permissionNameEn: varchar("permission_name_en", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// وصول المستخدمين - User Mobile App Access
export const userMobileAppAccess = pgTable("user_mobile_app_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appId: integer("app_id").notNull(),
  isActive: boolean("is_active").default(true),
  grantedPermissions: jsonb("granted_permissions"), // ['customer:view_invoices', ...]
  deniedPermissions: jsonb("denied_permissions"), // ['customer:pay_invoice', ...]
  lastAccessAt: timestamp("last_access_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const mobileAppsRelations = relations(mobileApps, ({ many }) => ({
  screens: many(mobileAppScreens),
  features: many(mobileAppFeatures),
  permissions: many(mobileAppPermissions),
  userAccess: many(userMobileAppAccess),
}));

export const mobileAppScreensRelations = relations(mobileAppScreens, ({ one, many }) => ({
  app: one(mobileApps, {
    fields: [mobileAppScreens.appId],
    references: [mobileApps.id],
  }),
  features: many(mobileAppFeatures),
}));

export const mobileAppFeaturesRelations = relations(mobileAppFeatures, ({ one }) => ({
  app: one(mobileApps, {
    fields: [mobileAppFeatures.appId],
    references: [mobileApps.id],
  }),
  screen: one(mobileAppScreens, {
    fields: [mobileAppFeatures.screenId],
    references: [mobileAppScreens.id],
  }),
}));

export const mobileAppPermissionsRelations = relations(mobileAppPermissions, ({ one }) => ({
  app: one(mobileApps, {
    fields: [mobileAppPermissions.appId],
    references: [mobileApps.id],
  }),
}));

export const userMobileAppAccessRelations = relations(userMobileAppAccess, ({ one }) => ({
  app: one(mobileApps, {
    fields: [userMobileAppAccess.appId],
    references: [mobileApps.id],
  }),
}));

// Types
export type MobileApp = typeof mobileApps.$inferSelect;
export type InsertMobileApp = typeof mobileApps.$inferInsert;

export type MobileAppScreen = typeof mobileAppScreens.$inferSelect;
export type InsertMobileAppScreen = typeof mobileAppScreens.$inferInsert;

export type MobileAppFeature = typeof mobileAppFeatures.$inferSelect;
export type InsertMobileAppFeature = typeof mobileAppFeatures.$inferInsert;

export type MobileAppPermission = typeof mobileAppPermissions.$inferSelect;
export type InsertMobileAppPermission = typeof mobileAppPermissions.$inferInsert;

export type UserMobileAppAccess = typeof userMobileAppAccess.$inferSelect;
export type InsertUserMobileAppAccess = typeof userMobileAppAccess.$inferInsert;
