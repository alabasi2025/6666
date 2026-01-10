# 🔧 خطة إعادة تنظيم نظام العملاء والفوترة
## Billing & Customers Reorganization Plan

**التاريخ:** 2026-01-09  
**السبب:** تكرار كبير وعشوائية في الهيكل  
**الهدف:** توحيد المسارات وحذف التكرارات

---

## ✅ القرار النهائي

**المسار الموحد:** `/dashboard/billing/*`  
**المجلد الموحد:** `client/src/pages/billing/`

---

## 🗑️ الملفات المكررة (سيتم حذفها)

```
client/src/pages/customers/
├── ❌ InvoicesManagement.tsx (مكرر - موجود في billing/invoicing/)
├── ❌ PaymentsManagement.tsx (مكرر - موجود في billing/payments/)
├── ❌ TariffsManagement.tsx (مكرر - موجود في billing/main-data/)
├── ❌ MeterReadings.tsx (مكرر - موجود في billing/invoicing/)
├── ❌ BillingPeriods.tsx (مكرر - موجود في billing/invoicing/)
├── ❌ MetersManagement.tsx (مكرر - موجود في billing/meters/)
└── ❌ Meters.tsx (غير مستخدم)
```

---

## 📦 الملفات الفريدة (سيتم نقلها)

```
client/src/pages/customers/
├── ✅ CustomerDashboard.tsx → billing/customers/
├── ✅ CustomerDetails.tsx → billing/customers/
├── ✅ CustomerWallets.tsx → billing/customers/
├── ✅ ComplaintsManagement.tsx → billing/customers/
├── ✅ SubscriptionRequestsManagement.tsx → billing/customers/
├── ✅ ReceiptsManagement.tsx → billing/customers/
├── ✅ PrepaidCodesManagement.tsx → billing/customers/
├── ✅ FinancialTransfers.tsx → billing/customers/
└── ✅ MeterDetailsExtended.tsx → billing/meters/
```

---

## 🎯 التنفيذ

### المرحلة 1: نقل الملفات الفريدة
### المرحلة 2: حذف الملفات المكررة  
### المرحلة 3: تحديث Dashboard.tsx
### المرحلة 4: حذف مجلد customers/ الفارغ
### المرحلة 5: اختبار شامل

---

**جاري التنفيذ...**
