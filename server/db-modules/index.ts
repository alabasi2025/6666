/**
 * @fileoverview ملف التصدير الرئيسي لدوال قاعدة البيانات
 * تم تقسيم الملف الأصلي (6,614 سطر) إلى وحدات أصغر للامتثال للقاعدة 6 و 23
 * @module server/db-modules
 */

// Core functions
export * from "./core";

// User Management
export * from "./users";

// Business, Branch, Station Management
export * from "./business";

// Accounting
export * from "./accounting";
export * from "./accounting-ext-1";
export * from "./accounting-ext-2";

// Assets
export * from "./assets";

// Work Orders
export * from "./work-orders";

// Customers & Invoices
export * from "./customers";

// Equipment & SCADA
export * from "./equipment";
export * from "./scada-sensors";
export * from "./scada-readings";
export * from "./scada-alerts";
export * from "./scada-cameras";

// Projects
export * from "./projects";

// Dashboard & Audit
export * from "./dashboard";

// Inventory
export * from "./inventory";
export * from "./inventory-extended";

// Developer System
export * from "./developer";
export * from "./developer-ai";

// Field Operations
export * from "./field-ops-core";
export * from "./field-ops-teams";
export * from "./field-ops-equipment";
export * from "./field-ops-payments";
export * from "./field-ops-dashboard";

// HR System
export * from "./hr-employees";
export * from "./hr-payroll";
export * from "./hr-leaves";

// Maintenance
export * from "./maintenance";

// Diesel System
export * from "./diesel-1";
export * from "./diesel-receiving";
export * from "./diesel-movements";
export * from "./diesel-reports";
