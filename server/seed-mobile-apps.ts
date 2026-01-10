/**
 * Seed Data for Mobile Apps System
 * بيانات أولية لنظام تطبيقات الجوال
 */

import { getDb } from "./db";
import {
  mobileApps,
  mobileAppScreens,
  mobileAppFeatures,
  mobileAppPermissions,
} from "../drizzle/schemas/mobile-apps";

export async function seedMobileApps(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // ============================================
  // 1. إنشاء التطبيقات
  // ============================================

  // تطبيق العميل
  const [customerApp] = await db
    .insert(mobileApps)
    .values({
      businessId,
      appType: "customer",
      appName: "تطبيق العميل",
      appVersion: "1.0.0",
      isActive: true,
      config: JSON.stringify({
        primaryColor: "#3b82f6",
        logo: "/logos/customer-app.png",
      }),
    });

  const customerAppId = customerApp.insertId;

  // تطبيق الموظف
  const [employeeApp] = await db
    .insert(mobileApps)
    .values({
      businessId,
      appType: "employee",
      appName: "تطبيق الموظف",
      appVersion: "1.0.0",
      isActive: true,
      config: JSON.stringify({
        primaryColor: "#10b981",
        logo: "/logos/employee-app.png",
      }),
    });

  const employeeAppId = employeeApp.insertId;

  // ============================================
  // 2. صلاحيات تطبيق العميل
  // ============================================

  const customerPermissions = [
    { code: "customer:view_dashboard", nameAr: "عرض لوحة التحكم", nameEn: "View Dashboard" },
    { code: "customer:view_invoices", nameAr: "عرض الفواتير", nameEn: "View Invoices" },
    { code: "customer:view_payments", nameAr: "عرض المدفوعات", nameEn: "View Payments" },
    { code: "customer:view_meters", nameAr: "عرض العدادات", nameEn: "View Meters" },
    { code: "customer:view_readings", nameAr: "عرض القراءات", nameEn: "View Readings" },
    { code: "customer:view_wallet", nameAr: "عرض المحفظة", nameEn: "View Wallet" },
    { code: "customer:charge_wallet", nameAr: "شحن المحفظة", nameEn: "Charge Wallet" },
    { code: "customer:pay_invoice", nameAr: "دفع الفاتورة", nameEn: "Pay Invoice" },
    { code: "customer:create_complaint", nameAr: "تقديم شكوى", nameEn: "Create Complaint" },
    { code: "customer:view_complaints", nameAr: "عرض الشكاوى", nameEn: "View Complaints" },
    { code: "customer:update_profile", nameAr: "تحديث الملف الشخصي", nameEn: "Update Profile" },
  ];

  for (const perm of customerPermissions) {
    await db.insert(mobileAppPermissions).values({
      appId: customerAppId,
      permissionCode: perm.code,
      permissionNameAr: perm.nameAr,
      permissionNameEn: perm.nameEn,
      isActive: true,
    });
  }

  // ============================================
  // 3. صلاحيات تطبيق الموظف
  // ============================================

  const employeePermissions = [
    { code: "worker:view_dashboard", nameAr: "عرض لوحة التحكم", nameEn: "View Dashboard" },
    { code: "worker:view_tasks", nameAr: "عرض المهام", nameEn: "View Tasks" },
    { code: "worker:start_task", nameAr: "بدء مهمة", nameEn: "Start Task" },
    { code: "worker:complete_task", nameAr: "إتمام مهمة", nameEn: "Complete Task" },
    { code: "worker:read_meter", nameAr: "قراءة عداد", nameEn: "Read Meter" },
    { code: "worker:install_meter", nameAr: "تركيب عداد", nameEn: "Install Meter" },
    { code: "worker:replace_meter", nameAr: "استبدال عداد", nameEn: "Replace Meter" },
    { code: "worker:disconnect_meter", nameAr: "فصل عداد", nameEn: "Disconnect Meter" },
    { code: "worker:reconnect_meter", nameAr: "ربط عداد", nameEn: "Reconnect Meter" },
    { code: "worker:maintain_meter", nameAr: "صيانة عداد", nameEn: "Maintain Meter" },
    { code: "worker:inspect_meter", nameAr: "فحص عداد", nameEn: "Inspect Meter" },
    { code: "worker:collect_payment", nameAr: "تحصيل دفعة", nameEn: "Collect Payment" },
    { code: "worker:request_materials", nameAr: "طلب مواد", nameEn: "Request Materials" },
    { code: "worker:receive_materials", nameAr: "استلام مواد", nameEn: "Receive Materials" },
    { code: "worker:update_location", nameAr: "تحديث الموقع", nameEn: "Update Location" },
    { code: "worker:upload_photos", nameAr: "رفع صور", nameEn: "Upload Photos" },
    { code: "worker:update_profile", nameAr: "تحديث الملف الشخصي", nameEn: "Update Profile" },
  ];

  for (const perm of employeePermissions) {
    await db.insert(mobileAppPermissions).values({
      appId: employeeAppId,
      permissionCode: perm.code,
      permissionNameAr: perm.nameAr,
      permissionNameEn: perm.nameEn,
      isActive: true,
    });
  }

  // ============================================
  // 4. شاشات تطبيق العميل
  // ============================================

  const customerScreens = [
    {
      code: "dashboard",
      nameAr: "لوحة التحكم",
      nameEn: "Dashboard",
      type: "dashboard" as const,
      route: "/customer/dashboard",
      icon: "Home",
      order: 1,
      permissions: ["customer:view_dashboard"],
    },
    {
      code: "invoices",
      nameAr: "الفواتير",
      nameEn: "Invoices",
      type: "list" as const,
      route: "/customer/invoices",
      icon: "FileText",
      order: 2,
      permissions: ["customer:view_invoices", "customer:pay_invoice"],
    },
    {
      code: "payments",
      nameAr: "المدفوعات",
      nameEn: "Payments",
      type: "list" as const,
      route: "/customer/payments",
      icon: "CreditCard",
      order: 3,
      permissions: ["customer:view_payments"],
    },
    {
      code: "meters",
      nameAr: "العدادات",
      nameEn: "Meters",
      type: "list" as const,
      route: "/customer/meters",
      icon: "Gauge",
      order: 4,
      permissions: ["customer:view_meters"],
    },
    {
      code: "readings",
      nameAr: "القراءات",
      nameEn: "Readings",
      type: "list" as const,
      route: "/customer/readings",
      icon: "Activity",
      order: 5,
      permissions: ["customer:view_readings"],
    },
    {
      code: "wallet",
      nameAr: "المحفظة",
      nameEn: "Wallet",
      type: "detail" as const,
      route: "/customer/wallet",
      icon: "Wallet",
      order: 6,
      permissions: ["customer:view_wallet", "customer:charge_wallet"],
    },
    {
      code: "complaints",
      nameAr: "الشكاوى",
      nameEn: "Complaints",
      type: "form" as const,
      route: "/customer/complaints",
      icon: "AlertCircle",
      order: 7,
      permissions: ["customer:create_complaint", "customer:view_complaints"],
    },
    {
      code: "profile",
      nameAr: "الملف الشخصي",
      nameEn: "Profile",
      type: "profile" as const,
      route: "/customer/profile",
      icon: "UserCircle",
      order: 8,
      permissions: ["customer:update_profile"],
    },
    {
      code: "notifications",
      nameAr: "الإشعارات",
      nameEn: "Notifications",
      type: "list" as const,
      route: "/customer/notifications",
      icon: "Bell",
      order: 9,
      permissions: ["customer:view_dashboard"],
    },
  ];

  for (const screen of customerScreens) {
    await db.insert(mobileAppScreens).values({
      appId: customerAppId,
      screenCode: screen.code,
      screenNameAr: screen.nameAr,
      screenNameEn: screen.nameEn,
      screenType: screen.type,
      routePath: screen.route,
      icon: screen.icon,
      orderIndex: screen.order,
      permissions: JSON.stringify(screen.permissions),
      isActive: true,
    });
  }

  // ============================================
  // 5. شاشات تطبيق الموظف
  // ============================================

  const employeeScreens = [
    {
      code: "dashboard",
      nameAr: "لوحة التحكم",
      nameEn: "Dashboard",
      type: "dashboard" as const,
      route: "/employee/dashboard",
      icon: "Home",
      order: 1,
      permissions: ["worker:view_dashboard"],
    },
    {
      code: "tasks",
      nameAr: "المهام",
      nameEn: "Tasks",
      type: "list" as const,
      route: "/employee/tasks",
      icon: "ClipboardList",
      order: 2,
      permissions: ["worker:view_tasks", "worker:start_task", "worker:complete_task"],
    },
    {
      code: "readings",
      nameAr: "القراءات",
      nameEn: "Meter Readings",
      type: "form" as const,
      route: "/employee/readings",
      icon: "Gauge",
      order: 3,
      permissions: ["worker:read_meter", "worker:upload_photos", "worker:update_location"],
    },
    {
      code: "installations",
      nameAr: "التركيبات",
      nameEn: "Installations",
      type: "form" as const,
      route: "/employee/installations",
      icon: "Wrench",
      order: 4,
      permissions: ["worker:install_meter", "worker:upload_photos", "worker:update_location"],
    },
    {
      code: "replacements",
      nameAr: "الاستبدالات",
      nameEn: "Replacements",
      type: "form" as const,
      route: "/employee/replacements",
      icon: "Wrench",
      order: 5,
      permissions: ["worker:replace_meter", "worker:upload_photos"],
    },
    {
      code: "disconnections",
      nameAr: "الفصل/الربط",
      nameEn: "Disconnections",
      type: "form" as const,
      route: "/employee/disconnections",
      icon: "Wrench",
      order: 6,
      permissions: ["worker:disconnect_meter", "worker:reconnect_meter", "worker:upload_photos"],
    },
    {
      code: "maintenance",
      nameAr: "الصيانة",
      nameEn: "Maintenance",
      type: "form" as const,
      route: "/employee/maintenance",
      icon: "Wrench",
      order: 7,
      permissions: ["worker:maintain_meter", "worker:upload_photos"],
    },
    {
      code: "inspection",
      nameAr: "الفحص الميداني",
      nameEn: "Field Inspection",
      type: "form" as const,
      route: "/employee/inspection",
      icon: "Camera",
      order: 8,
      permissions: ["worker:inspect_meter", "worker:upload_photos"],
    },
    {
      code: "collection",
      nameAr: "التحصيل",
      nameEn: "Collection",
      type: "form" as const,
      route: "/employee/collection",
      icon: "CreditCard",
      order: 9,
      permissions: ["worker:collect_payment"],
    },
    {
      code: "materials",
      nameAr: "المواد",
      nameEn: "Materials",
      type: "list" as const,
      route: "/employee/materials",
      icon: "Package",
      order: 10,
      permissions: ["worker:request_materials", "worker:receive_materials"],
    },
    {
      code: "location",
      nameAr: "الموقع",
      nameEn: "Location/GPS",
      type: "map" as const,
      route: "/employee/location",
      icon: "MapPin",
      order: 11,
      permissions: ["worker:update_location"],
    },
    {
      code: "profile",
      nameAr: "الملف الشخصي",
      nameEn: "Profile",
      type: "profile" as const,
      route: "/employee/profile",
      icon: "Users",
      order: 12,
      permissions: ["worker:update_profile"],
    },
    {
      code: "notifications",
      nameAr: "الإشعارات",
      nameEn: "Notifications",
      type: "list" as const,
      route: "/employee/notifications",
      icon: "Settings",
      order: 13,
      permissions: ["worker:view_dashboard"],
    },
  ];

  for (const screen of employeeScreens) {
    await db.insert(mobileAppScreens).values({
      appId: employeeAppId,
      screenCode: screen.code,
      screenNameAr: screen.nameAr,
      screenNameEn: screen.nameEn,
      screenType: screen.type,
      routePath: screen.route,
      icon: screen.icon,
      orderIndex: screen.order,
      permissions: JSON.stringify(screen.permissions),
      isActive: true,
    });
  }

  return {
    customerAppId,
    employeeAppId,
    message: "تم إنشاء بيانات تطبيقات الجوال بنجاح",
  };
}

