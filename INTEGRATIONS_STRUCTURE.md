# هيكل التكاملات الخارجية - Integrations Structure

**تاريخ:** 2026-01-06  
**القاعدة:** جميع التكاملات الخارجية (Third-party integrations) يجب أن تكون في **نظام المطور (Developer System)**

---

## 📁 الهيكل الصحيح

```
server/
├── developer/
│   └── integrations/
│       ├── acrel-api-client.ts      ✅ ACREL API Client
│       ├── acrel-service.ts        ✅ ACREL Service
│       ├── payment-gateways.ts      ⚠️ يجب نقله من paymentGatewaysRouter.ts
│       ├── messaging.ts             ⚠️ يجب نقله من messagingRouter.ts
│       └── sts.ts                   ⚠️ يجب نقله من stsRouter.ts
│
├── routers.ts
│   └── developer.integrations.*     ✅ جميع التكاملات هنا
│
└── ❌ لا يجب وجود:
    ├── integrations/               ❌ حذف هذا المجلد
    ├── paymentGatewaysRouter.ts     ❌ يجب دمجه في developer
    ├── messagingRouter.ts           ❌ يجب دمجه في developer
    └── stsRouter.ts                 ❌ يجب دمجه في developer
```

---

## ✅ التكاملات المكتملة

### 1. ACREL IoT Integration
- **الموقع:** `server/developer/integrations/acrel-api-client.ts`
- **الموقع:** `server/developer/integrations/acrel-service.ts`
- **الوصول:** `trpc.developer.integrations.acrel.*` (يجب إضافته)
- **الحالة:** ✅ تم النقل

---

## ⚠️ التكاملات التي تحتاج نقل

### 1. Payment Gateways (بوابات الدفع)
- **الموقع الحالي:** `server/paymentGatewaysRouter.ts`
- **الموقع المطلوب:** `server/developer/integrations/payment-gateways.ts`
- **الوصول الحالي:** `trpc.paymentGateways.*`
- **الوصول المطلوب:** `trpc.developer.integrations.paymentGateways.*`
- **الحالة:** ⚠️ تم ربطه في `developer.integrations` لكن الملف منفصل

### 2. Messaging (SMS/WhatsApp)
- **الموقع الحالي:** `server/messagingRouter.ts`
- **الموقع المطلوب:** `server/developer/integrations/messaging.ts`
- **الوصول الحالي:** `trpc.messaging.*`
- **الوصول المطلوب:** `trpc.developer.integrations.messaging.*`
- **الحالة:** ⚠️ تم ربطه في `developer.integrations` لكن الملف منفصل

### 3. STS (عدادات الدفع المسبق)
- **الموقع الحالي:** `server/stsRouter.ts`
- **الموقع المطلوب:** `server/developer/integrations/sts.ts`
- **الوصول الحالي:** `trpc.sts.*`
- **الوصول المطلوب:** `trpc.developer.integrations.sts.*`
- **الحالة:** ⚠️ تم ربطه في `developer.integrations` لكن الملف منفصل

---

## 🔧 التغييرات المطلوبة

### 1. تحديث `routers.ts`
```typescript
developer: router({
  integrations: router({
    // ... existing integration management
    
    // ✅ تم إضافتها
    paymentGateways: paymentGatewaysRouter,
    messaging: messagingRouter,
    sts: stsRouter,
    
    // ⚠️ يجب إضافتها
    acrel: acrelRouter,  // TODO: إنشاء router لـ ACREL
  }),
}),
```

### 2. تحديث جميع المراجع في Frontend
- ✅ `trpc.paymentGateways.*` → `trpc.developer.integrations.paymentGateways.*`
- ✅ `trpc.messaging.*` → `trpc.developer.integrations.messaging.*`
- ✅ `trpc.sts.*` → `trpc.developer.integrations.sts.*`

### 3. نقل الملفات (اختياري - يمكن تركها كما هي)
يمكن ترك الملفات في مكانها الحالي (`server/paymentGatewaysRouter.ts`, etc.) طالما أنها مرتبطة في `developer.integrations` في `routers.ts`.

---

## 📝 ملاحظات

1. **الموقع الفعلي للملفات:** يمكن أن تبقى الملفات في `server/paymentGatewaysRouter.ts` طالما أنها مرتبطة في `developer.integrations`
2. **الوصول:** يجب أن يكون الوصول دائماً عبر `trpc.developer.integrations.*`
3. **ACREL:** تم نقل ملفات ACREL إلى `server/developer/integrations/` ✅

---

**آخر تحديث:** 2026-01-06

