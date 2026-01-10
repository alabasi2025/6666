# 📝 Client Side TODOs - التحديثات

**التاريخ:** 2026-01-08  
**الحالة:** قيد التنفيذ

---

## 📊 الإحصائيات:

```
✅ TODOs المكتشفة: 27 TODO
✅ الملفات المتأثرة: 20 ملف
✅ النوع: businessId context updates
```

---

## ✅ المهمة 027: Business Context Provider

### 1. ✅ إنشاء BusinessContext.tsx
**الملف:** `client/src/contexts/BusinessContext.tsx` (جديد)

**الميزات:**
- ✅ Context Provider كامل
- ✅ useBusinessContext hook
- ✅ useBusinessId convenience hook
- ✅ Auto-fetch business data
- ✅ Error handling + fallback

---

### 2. ✅ تحديث App.tsx
**الملف:** `client/src/App.tsx`

**التغييرات:**
- ✅ استيراد BusinessProvider
- ✅ إضافة في هيكل المكونات
- ✅ defaultBusinessId = 1

---

### 3. ⏳ تحديث 15+ ملف

**الملفات المتبقية:**
1. ⏳ mobile-apps/MobileAppsManagement.tsx
2. ⏳ acrel/AcrelMultiTariffSchedule.tsx
3. ⏳ acrel/AcrelPaymentSettings.tsx
4. ⏳ wizards/MeterReplacementWizard.tsx
5. ⏳ inventory/SerialNumbersTracking.tsx
6. ⏳ sts/STSCharging.tsx
7. ⏳ sts/STSPaymentSettings.tsx
8. ⏳ sts/STSManagement.tsx
9. ⏳ sts/STSMultiTariffSchedule.tsx
10. ⏳ acrel/AcrelMeters.tsx
11. ⏳ settings/SMSSettings.tsx
12. ⏳ settings/PaymentGatewaysSettings.tsx
13. ⏳ inventory/InventoryAudit.tsx
14. ⏳ settings/PricingRulesManagement.tsx
15. ⏳ transition-support/TransitionDashboard.tsx
16. ⏳ government-support/GovernmentSupportDashboard.tsx

**التغيير المطلوب في كل ملف:**

```typescript
// القديم:
const businessId = 1; // TODO: Get from context

// الجديد:
import { useBusinessId } from "@/contexts/BusinessContext";
// ...
const businessId = useBusinessId();
```

---

## 📝 ملاحظات:

- جميع الملفات تحتاج نفس التحديث
- بسيط ومباشر
- لا يؤثر على الوظائف
- يحسن قابلية الصيانة

---

## 🎯 الخطوة التالية:

تحديث الملفات المتبقية بشكل دفعي.
