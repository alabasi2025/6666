# 📋 TODO 2026 - جاهز للتنفيذ (بعد الفحص الشامل)

**تاريخ الإنشاء:** 2026-01-06  
**حالة الفحص:** ✅ تم فحص النظام الموجود  
**الحالة:** جاهز للتنفيذ بدون تكرار

---

## ✅ ما تم التأكد منه

### الموجود والمرتبط بالتبويب الجانبي:
1. ✅ نظام STS - موجود ومرتبط (السطور 428-435، 841-842)
2. ✅ نظام الفوترة - كامل ومرتبط
3. ✅ نظام العدادات - موجود ومرتبط
4. ✅ نظام القراءات - موجود ومرتبط
5. ✅ نظام المطور - كامل ومرتبط
6. ✅ نظام الإعدادات - كامل ومرتبط (Payment Gateways, SMS)

### غير موجود:
1. ❌ ACREL - لا يوجد صفحات ولا router
2. ❌ صفحات إضافية لـ STS (Payment Settings, Multi-Tariff)
3. ❌ تحديثات على صفحات العدادات والقراءات الموجودة

---

## 🎯 المهام المطلوبة (بدون تكرار)

---

### 1️⃣ Backend: إضافة ACREL Router

**الأولوية:** 🔴 عالية جداً  
**الموقع:** `server/routers.ts`  
**السطر:** ~1125 (بعد `messaging: messagingRouter,`)

**المهمة:**
```typescript
// في developer.integrations
acrel: router({
  // إدارة العدادات
  meters: router({
    list: protectedProcedure
      .input(z.object({ 
        businessId: z.number(),
        meterType: z.enum(["ADL200", "ADW300"]).optional(),
        paymentMode: z.enum(["postpaid", "prepaid", "credit"]).optional(),
      }))
      .query(async ({ input }) => {
        // استخدام acrelService.getMeterInfo()
      }),
    
    getReading: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        return await acrelService.getReading(input.meterId);
      }),
    
    disconnect: adminProcedure
      .input(z.object({ meterId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await acrelService.disconnectMeter(input.meterId, input.reason);
      }),
    
    reconnect: adminProcedure
      .input(z.object({ meterId: z.number() }))
      .mutation(async ({ input }) => {
        return await acrelService.reconnectMeter(input.meterId);
      }),
  }),
  
  // محولات التيار (CT)
  ct: router({
    configure: adminProcedure
      .input(z.object({
        meterId: z.number(),
        ct1Size: z.number(),
        ct2Size: z.number(),
        ct3Size: z.number(),
        ct1CoreType: z.enum(["split", "solid"]),
        ct2CoreType: z.enum(["split", "solid"]),
        ct3CoreType: z.enum(["split", "solid"]),
      }))
      .mutation(async ({ input }) => {
        return await acrelService.configureExternalCTs(
          input.meterId,
          input.ct1Size as any,
          input.ct2Size as any,
          input.ct3Size as any,
          input.ct1CoreType,
          input.ct2CoreType,
          input.ct3CoreType
        );
      }),
  }),
  
  // أنظمة الدفع
  payment: router({
    setMode: adminProcedure
      .input(z.object({
        meterId: z.number(),
        mode: z.enum(["postpaid", "prepaid", "credit"]),
      }))
      .mutation(async ({ input }) => {
        if (input.mode === "postpaid") {
          return await acrelService.setPostpaidMode(input.meterId, true);
        } else if (input.mode === "prepaid") {
          return await acrelService.setPrepaidMode(input.meterId, true);
        }
        // للائتمان يحتاج تفعيل postpaid + تعيين حد ائتمان
      }),
    
    recharge: protectedProcedure
      .input(z.object({ meterId: z.number(), amount: z.number() }))
      .mutation(async ({ input }) => {
        return await acrelService.rechargeBalance(input.meterId, input.amount);
      }),
    
    setCreditLimit: adminProcedure
      .input(z.object({ 
        meterId: z.number(), 
        creditLimit: z.number(),
        autoDisconnect: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return await acrelService.setCreditLimit(input.meterId, input.creditLimit, input.autoDisconnect);
      }),
    
    getBalance: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        return await acrelService.getPrepaidBalance(input.meterId);
      }),
    
    getCreditInfo: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        return await acrelService.getCreditInfo(input.meterId);
      }),
  }),
  
  // التعرفات المتعددة
  tariff: router({
    setSchedule: adminProcedure
      .input(z.object({
        meterId: z.number(),
        tariffs: z.array(z.object({
          tariffId: z.string(),
          name: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          pricePerKWH: z.number(),
          isActive: z.boolean(),
        })).max(8),
        effectiveDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await acrelService.setMultiTariffSchedule(input.meterId, {
          meterId: input.meterId.toString(),
          tariffs: input.tariffs,
          effectiveDate: input.effectiveDate,
        });
      }),
    
    getSchedule: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(async ({ input }) => {
        return await acrelService.getMultiTariffSchedule(input.meterId);
      }),
  }),
  
  // المراقبة
  monitoring: router({
    getMetrics: protectedProcedure
      .input(z.object({
        deviceType: z.enum(["generator", "cable", "meter_panel", "solar_panel"]).optional(),
      }))
      .query(async ({ input }) => {
        return await acrelService.getInfrastructureMetrics(input.deviceType);
      }),
  }),
}),
```

---

### 2️⃣ Backend: تحديث STS Router

**الأولوية:** 🟡 متوسطة  
**الموقع:** `server/stsRouter.ts`

**المهام:**
- [ ] إضافة procedures لأنظمة الدفع:
  - `payment.setMode` - تعيين نوع الدفع
  - `payment.setCreditLimit` - إعداد الائتمان
  - `payment.getBalance` - الرصيد (كيلوهات)
  - `payment.getCreditInfo` - معلومات الائتمان

- [ ] إضافة procedures للتعرفات المتعددة:
  - `tariff.setSchedule` - إعداد 8 تعرفات
  - `tariff.getSchedule` - جلب الجدول

---

### 3️⃣ Database: جداول ACREL

**الأولوية:** 🔴 عالية جداً  
**الموقع:** `drizzle/schemas/acrel.ts` (جديد)

**المهام:**
- [ ] إنشاء Schema File: `drizzle/schemas/acrel.ts`
- [ ] إنشاء Migration: `drizzle/migrations/00XX_acrel_integration.sql`

**الجداول المطلوبة:**

```typescript
// 1. acrel_meters
export const acrelMeters = mysqlTable("acrel_meters", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("business_id").notNull(),
  meterId: int("meter_id"), // ربط بـ meters_enhanced
  acrelMeterId: varchar("acrel_meter_id", { length: 100 }).notNull(),
  meterType: mysqlEnum("meter_type", ["ADL200", "ADW300"]).notNull(),
  phaseType: mysqlEnum("phase_type", ["single", "three"]).notNull(),
  connectionType: mysqlEnum("connection_type", ["wifi", "rs485", "mqtt"]).default("wifi"),
  networkId: varchar("network_id", { length: 100 }),
  paymentMode: mysqlEnum("payment_mode", ["postpaid", "prepaid", "credit"]).default("postpaid"),
  creditLimit: decimal("credit_limit", { precision: 18, scale: 2 }),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).default("0"),
  ctType: mysqlEnum("ct_type", ["built_in", "external"]), // للـ ADW300
  ctInfo: json("ct_info"), // معلومات محولات التيار
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// 2. acrel_readings (للحفظ المحلي)
export const acrelReadings = mysqlTable("acrel_readings", {
  id: int("id").autoincrement().primaryKey(),
  acrelMeterId: int("acrel_meter_id").notNull(),
  readingDate: timestamp("reading_date").notNull(),
  // Single Phase (ADL200)
  voltage: decimal("voltage", { precision: 10, scale: 2 }),
  current: decimal("current", { precision: 10, scale: 3 }),
  power: decimal("power", { precision: 15, scale: 3 }),
  energy: decimal("energy", { precision: 18, scale: 3 }),
  // Three Phase (ADW300)
  voltageL1: decimal("voltage_l1", { precision: 10, scale: 2 }),
  voltageL2: decimal("voltage_l2", { precision: 10, scale: 2 }),
  voltageL3: decimal("voltage_l3", { precision: 10, scale: 2 }),
  currentL1: decimal("current_l1", { precision: 10, scale: 3 }),
  currentL2: decimal("current_l2", { precision: 10, scale: 3 }),
  currentL3: decimal("current_l3", { precision: 10, scale: 3 }),
  powerL1: decimal("power_l1", { precision: 15, scale: 3 }),
  powerL2: decimal("power_l2", { precision: 15, scale: 3 }),
  powerL3: decimal("power_l3", { precision: 15, scale: 3 }),
  exportedEnergy: decimal("exported_energy", { precision: 18, scale: 3 }),
  importedEnergy: decimal("imported_energy", { precision: 18, scale: 3 }),
  totalEnergy: decimal("total_energy", { precision: 18, scale: 3 }),
  // حساسات الحرارة
  temperature1: decimal("temperature1", { precision: 5, scale: 2 }),
  temperature2: decimal("temperature2", { precision: 5, scale: 2 }),
  temperature3: decimal("temperature3", { precision: 5, scale: 2 }),
  temperature4: decimal("temperature4", { precision: 5, scale: 2 }),
  // التسرب
  leakageCurrent: decimal("leakage_current", { precision: 10, scale: 3 }),
  // القاطع
  breakerStatus: varchar("breaker_status", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. acrel_command_logs
export const acrelCommandLogs = mysqlTable("acrel_command_logs", {
  id: int("id").autoincrement().primaryKey(),
  acrelMeterId: int("acrel_meter_id").notNull(),
  commandType: varchar("command_type", { length: 50 }).notNull(),
  commandId: varchar("command_id", { length: 100 }),
  status: mysqlEnum("status", ["pending", "executed", "failed"]).default("pending"),
  requestData: json("request_data"),
  responseData: json("response_data"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  executedAt: timestamp("executed_at"),
});

// 4. multi_tariff_schedules (مشترك بين ACREL و STS)
export const multiTariffSchedules = mysqlTable("multi_tariff_schedules", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meter_id").notNull(),
  meterType: mysqlEnum("meter_type", ["acrel", "sts"]).notNull(),
  tariffData: json("tariff_data").notNull(), // array of up to 8 tariffs
  effectiveDate: date("effective_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

---

### 4️⃣ Database: تحديث جداول STS

**الأولوية:** 🟡 متوسطة  
**الموقع:** تحديث `sts_meters` و `sts_charge_requests`

**المهام:**
- [ ] تحديث `sts_meters` (إضافة أعمدة):
  ```sql
  ALTER TABLE sts_meters 
  ADD COLUMN payment_mode ENUM('postpaid', 'prepaid', 'credit') DEFAULT 'prepaid',
  ADD COLUMN credit_limit DECIMAL(18,2),
  ADD COLUMN current_balance DECIMAL(18,2) DEFAULT 0,
  ADD COLUMN remaining_kwh DECIMAL(15,3) DEFAULT 0;
  ```

- [ ] تحديث `sts_charge_requests` (إضافة عمود):
  ```sql
  ALTER TABLE sts_charge_requests 
  ADD COLUMN kwh_generated DECIMAL(15,3) COMMENT 'الكيلوهات المولدة من المبلغ';
  ```

- [ ] إنشاء `sts_command_logs` (إذا غير موجود):
  ```sql
  CREATE TABLE sts_command_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sts_meter_id INT NOT NULL,
    command_type VARCHAR(50) NOT NULL,
    command_id VARCHAR(100),
    status ENUM('pending', 'executed', 'failed') DEFAULT 'pending',
    request_data JSON,
    response_data JSON,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP NULL
  );
  ```

---

### 5️⃣ Database: تحديث meters_enhanced

**الأولوية:** 🔴 عالية  
**الموقع:** `drizzle/schemas/types-3.ts` أو Migration

**المهام:**
- [ ] إضافة أعمدة لربط ACREL:
  ```sql
  ALTER TABLE meters_enhanced
  ADD COLUMN external_integration_type ENUM('none', 'acrel', 'sts') DEFAULT 'none',
  ADD COLUMN acrel_meter_id VARCHAR(100),
  ADD COLUMN acrel_meter_type ENUM('ADL200', 'ADW300'),
  ADD COLUMN sts_meter_id VARCHAR(100),
  ADD COLUMN payment_mode ENUM('postpaid', 'prepaid', 'credit') DEFAULT 'postpaid',
  ADD COLUMN credit_limit DECIMAL(18,2),
  ADD COLUMN ct_info JSON COMMENT 'معلومات محولات التيار للـ ADW300';
  ```

---

### 6️⃣ Frontend: صفحات ACREL (جديدة)

**الأولوية:** 🔴 عالية  
**الموقع:** `client/src/pages/acrel/` (مجلد جديد)

#### أ) `client/src/pages/acrel/AcrelMeters.tsx`
**الوظيفة:** قائمة عدادات ACREL (ADL200 و ADW300)

**المحتوى:**
- قائمة العدادات مع جدول
- أعمدة: رقم العداد، النوع (ADL200/ADW300), نوع الدفع، الحالة، الرصيد/الائتمان
- فلترة حسب النوع (ADL200/ADW300)
- فلترة حسب نوع الدفع (Postpaid/Prepaid/Credit)
- زر إضافة عداد جديد
- زر "تفاصيل" لكل عداد
- زر "إعدادات" لكل عداد

**tRPC Calls:**
```typescript
const { data } = trpc.developer.integrations.acrel.meters.list.useQuery({
  businessId,
  meterType,
  paymentMode,
});
```

---

#### ب) `client/src/pages/acrel/AcrelMeterDetails.tsx`
**الوظيفة:** تفاصيل عداد ACREL

**المحتوى (Tabs):**
- **Tab 1: معلومات العامة**
  - رقم العداد، النوع، نوع الطور
  - نوع الاتصال (WiFi/RS485/MQTT)
  - حالة الاتصال
  
- **Tab 2: القراءات الحية**
  - للـ ADL200: Single Phase (Voltage, Current, Power, Energy)
  - للـ ADW300: Three Phase (L1, L2, L3)
  - الطاقة المصدرة/المستوردة (ADW300)
  - حساسات الحرارة (ADW300)
  - قياس التسرب (ADW300)
  - حالة القاطع (ADW300)

- **Tab 3: محولات التيار** (للـ ADW300 فقط)
  - نوع المحول (Built-in/External)
  - أحجام المحولات (CT1, CT2, CT3)
  - أنواع الأقراص (Split/Solid)

- **Tab 4: نظام الدفع**
  - نوع الدفع الحالي
  - الرصيد (للمسبق الدفع)
  - حد الائتمان (للائتمان)
  - الدين الحالي

**tRPC Calls:**
```typescript
const { data: reading } = trpc.developer.integrations.acrel.meters.getReading.useQuery({ meterId });
const { data: balance } = trpc.developer.integrations.acrel.payment.getBalance.useQuery({ meterId });
const { data: credit } = trpc.developer.integrations.acrel.payment.getCreditInfo.useQuery({ meterId });
```

---

#### ج) `client/src/pages/acrel/AcrelCTConfiguration.tsx`
**الوظيفة:** إعداد محولات التيار (للـ ADW300)

**المحتوى:**
- اختيار نوع المحول (Built-in/External)
- للـ External:
  - اختيار حجم CT1 (100-1000 أمبير)
  - اختيار نوع قرص CT1 (Split/Solid)
  - اختيار حجم CT2
  - اختيار نوع قرص CT2
  - اختيار حجم CT3
  - اختيار نوع قرص CT3
- زر "حفظ التكوين"

**tRPC Calls:**
```typescript
const configureMutation = trpc.developer.integrations.acrel.ct.configure.useMutation({
  onSuccess: () => toast.success("تم إعداد محولات التيار بنجاح"),
});
```

---

#### د) `client/src/pages/acrel/AcrelInfrastructureMonitoring.tsx`
**الوظيفة:** مراقبة البنية التحتية (عدادات ADW300)

**المحتوى:**
- فلترة حسب نوع الجهاز (Generator/Cable/Meter Panel/Solar Panel)
- جدول قراءات عدادات المراقبة
- أعمدة: اسم الجهاز، الطاقة المصدرة، الطاقة المستوردة، الحرارة، التسرب
- رسم بياني: الطاقة المصدرة vs المستوردة

**tRPC Calls:**
```typescript
const { data } = trpc.developer.integrations.acrel.monitoring.getMetrics.useQuery({
  deviceType: selectedDeviceType,
});
```

---

### 7️⃣ Frontend: تحديث صفحات STS الموجودة

**الأولوية:** 🟡 متوسطة

#### أ) تحديث `client/src/pages/sts/STSManagement.tsx`
**لا تعيد إنشاء - حدّث فقط:**
- [ ] إضافة عمود "نوع الدفع" في الجدول
- [ ] إضافة عمود "الرصيد (كيلوهات)" في الجدول
- [ ] إضافة عمود "حد الائتمان" (إذا Credit)
- [ ] إضافة فلتر "نوع الدفع"

#### ب) تحديث `client/src/pages/sts/STSCharging.tsx`
**لا تعيد إنشاء - حدّث فقط:**
- [ ] إضافة حقل "اختيار التعرفة" قبل الشحن
- [ ] عرض حساب: `المبلغ ÷ سعر التعرفة = X كيلو`
- [ ] عرض "الكيلوهات المولدة" بعد الشحن
- [ ] إضافة ملاحظة: "⚠️ STS يولد كيلوهات وليس رصيد نقدي"

#### ج) إنشاء `client/src/pages/sts/STSPaymentSettings.tsx` (جديد)
**الوظيفة:** إعدادات الدفع لعدادات STS

**المحتوى:**
- اختيار العداد
- اختيار نوع الدفع (Postpaid/Prepaid/Credit)
- إعداد حد الائتمان (للـ Credit)
- عرض معلومات الرصيد الحالي (كيلوهات)

---

### 8️⃣ Frontend: صفحة التعرفات المتعددة (مشتركة)

**الأولوية:** 🟡 متوسطة  
**الموقع:** `client/src/pages/settings/MultiTariffSchedule.tsx` (جديد)

**الوظيفة:** إدارة التعرفات المتعددة (8 تعرفات) لـ ACREL و STS

**المحتوى:**
- اختيار العداد (ACREL أو STS)
- جدول التعرفات (حتى 8 تعرفات):
  - الاسم
  - وقت البداية (HH:mm)
  - وقت النهاية (HH:mm)
  - سعر الكيلووات ساعة
  - مفعل/معطل
- Timeline بصري لعرض التعرفات خلال اليوم
- زر "إضافة تعرفة" (حتى 8)
- زر "حفظ الجدول"

**مثال التعرفات:**
```
06:00-10:00 → 0.12 ريال/كيلو (شمسية)
10:00-14:00 → 0.15 ريال/كيلو
14:00-18:00 → 0.18 ريال/كيلو
18:00-22:00 → 0.20 ريال/كيلو
22:00-02:00 → 0.18 ريال/كيلو
02:00-06:00 → 0.16 ريال/كيلو
```

---

### 9️⃣ Frontend: تحديث صفحة العدادات الموجودة

**الأولوية:** 🟡 متوسطة  
**الموقع:** `client/src/pages/billing/meters/MetersManagement.tsx`

**لا تعيد إنشاء - حدّث فقط:**
- [ ] إضافة حقل "التكامل الخارجي" في النموذج:
  - خيارات: Traditional, ACREL-ADL200, ACREL-ADW300, STS
- [ ] إضافة حقل "ACREL Meter ID" (للـ ACREL)
- [ ] إضافة حقل "STS Meter ID" (للـ STS)
- [ ] إضافة حقل "نوع الدفع" (Postpaid/Prepaid/Credit)
- [ ] إضافة حقل "حد الائتمان" (للـ Credit)
- [ ] إضافة عمود "التكامل" في الجدول
- [ ] إضافة زر "إعدادات ACREL" (للعدادات المرتبطة بـ ACREL)
- [ ] إضافة زر "إعدادات STS" (للعدادات المرتبطة بـ STS)

---

### 🔟 Frontend: تحديث صفحة القراءات الموجودة

**الأولوية:** 🟡 متوسطة  
**الموقع:** `client/src/pages/billing/invoicing/MeterReadingsManagement.tsx`

**لا تعيد إنشاء - حدّث فقط:**
- [ ] إضافة زر "سحب من ACREL" لكل عداد ACREL
- [ ] عرض قراءات Three Phase (L1, L2, L3) للـ ADW300
- [ ] عرض الطاقة المصدرة/المستوردة (ADW300)
- [ ] عرض حساسات الحرارة (إذا ADW300)
- [ ] عرض قياس التسرب (إذا ADW300)
- [ ] عرض حالة القاطع (إذا ADW300)

---

### 1️⃣1️⃣ Frontend: تحديث التنقل (Dashboard.tsx)

**الأولوية:** 🔴 عالية  
**الموقع:** `client/src/pages/Dashboard.tsx`

**المهام:**

#### أ) تحديث قسم STS الموجود (السطر 427-435):
```typescript
{
  id: "sts",
  title: "عدادات STS",
  icon: Smartphone,
  children: [
    { id: "sts-meters", title: "إدارة العدادات", icon: Gauge, path: "/dashboard/sts/meters" },
    { id: "sts-charging", title: "شحن الرصيد", icon: CreditCard, path: "/dashboard/sts/charging" },
    // جديد:
    { id: "sts-payment-settings", title: "إعدادات الدفع", icon: Settings, path: "/dashboard/sts/payment-settings" },
  ],
},
```

#### ب) إضافة قسم ACREL بجانب STS:
```typescript
{
  id: "acrel",
  title: "عدادات ACREL",
  icon: Zap, // أو Smartphone
  children: [
    { id: "acrel-meters", title: "إدارة العدادات", icon: Gauge, path: "/dashboard/acrel/meters" },
    { id: "acrel-monitoring", title: "مراقبة البنية التحتية", icon: Activity, path: "/dashboard/acrel/monitoring" },
    { id: "acrel-ct-config", title: "محولات التيار", icon: Settings, path: "/dashboard/acrel/ct-configuration" },
  ],
},
```

#### ج) إضافة في قسم الإعدادات (السطر 590-594):
```typescript
{
  id: "settings",
  // ...
  children: [
    // ... الموجود
    { id: "multi-tariff", title: "التعرفات المتعددة", icon: Clock, path: "/dashboard/settings/multi-tariff" },
  ],
}
```

#### د) إضافة Lazy Imports (بعد السطر 138):
```typescript
// ACREL Pages - Lazy Loaded
const AcrelMeters = lazy(() => import("./acrel/AcrelMeters"));
const AcrelMeterDetails = lazy(() => import("./acrel/AcrelMeterDetails"));
const AcrelCTConfiguration = lazy(() => import("./acrel/AcrelCTConfiguration"));
const AcrelInfrastructureMonitoring = lazy(() => import("./acrel/AcrelInfrastructureMonitoring"));

// STS Additional Pages - Lazy Loaded
const STSPaymentSettings = lazy(() => import("./sts/STSPaymentSettings"));

// Settings - Multi Tariff
const MultiTariffSchedule = lazy(() => import("./settings/MultiTariffSchedule"));
```

#### هـ) إضافة Routes (بعد السطر 842):
```typescript
{/* ACREL System */}
{path === "/dashboard/acrel/meters" && <AcrelMeters />}
{path.match(/^\/dashboard\/acrel\/meters\/\d+$/) && <AcrelMeterDetails />}
{path === "/dashboard/acrel/ct-configuration" && <AcrelCTConfiguration />}
{path === "/dashboard/acrel/monitoring" && <AcrelInfrastructureMonitoring />}

{/* STS Additional Pages */}
{path === "/dashboard/sts/payment-settings" && <STSPaymentSettings />}

{/* Multi Tariff */}
{path === "/dashboard/settings/multi-tariff" && <MultiTariffSchedule />}
```

---

### 1️⃣2️⃣ Backend: Cron Jobs

**الأولوية:** 🟢 منخفضة (بعد اكتمال الأساسيات)  
**الموقع:** `server/core/cron-jobs.ts`

**المهام:**
- [ ] إضافة Cron Job: `acrel-auto-reading` (كل ساعة)
- [ ] إضافة Cron Job: `sts-auto-reading` (كل ساعة)
- [ ] إضافة Cron Job: `check-credit-limits` (كل 6 ساعات)
- [ ] تحديث `charge-subsidies` لاستخدام `acrelService.setTariff()`

---

### 1️⃣3️⃣ Backend: Auto Journal Engine

**الأولوية:** 🟡 متوسطة  
**الموقع:** `server/core/auto-journal-engine.ts`

**المهام:**
- [ ] إضافة `onAcrelRecharge()` - قيد شحن رصيد ACREL
- [ ] إضافة `onCreditLimitReached()` - قيد عند الوصول لحد الائتمان
- [ ] تحديث `onSTSRecharge()` لحفظ الكيلوهات المولدة

---

## 📊 الأولويات

### 🔴 عالية جداً (ابدأ بهذه):
1. إضافة ACREL Router في `server/routers.ts`
2. إنشاء Schema: `drizzle/schemas/acrel.ts`
3. إنشاء Migration للجداول
4. تحديث `meters_enhanced` schema

### 🟡 متوسطة (بعد الأساسيات):
1. إنشاء صفحات ACREL (4 صفحات)
2. تحديث صفحات STS (إضافات فقط)
3. تحديث صفحة العدادات الموجودة
4. تحديث صفحة القراءات الموجودة
5. إضافة في التنقل (Dashboard.tsx)

### 🟢 منخفضة (بعد الانتهاء):
1. Cron Jobs
2. Auto Journal Engine
3. Notifications
4. Testing

---

## 🚫 ما لا يجب فعله (مهم جداً)

1. ❌ **لا تعيد إنشاء** `STSManagement.tsx` - موجود ومرتبط ✅
2. ❌ **لا تعيد إنشاء** `STSCharging.tsx` - موجود ومرتبط ✅
3. ❌ **لا تعيد إنشاء** قسم STS في التنقل - موجود بالفعل ✅
4. ❌ **لا تعيد إنشاء** `MetersManagement.tsx` - حدّثه فقط
5. ❌ **لا تعيد إنشاء** `MeterReadingsManagement.tsx` - حدّثه فقط
6. ❌ **لا تعيد إنشاء** نظام الفوترة - موجود بالكامل
7. ❌ **لا تضف** STS في التبويب مرة أخرى - موجود بالفعل!

---

## ✅ ما يجب فعله

1. ✅ إنشاء ACREL Router (جديد)
2. ✅ إنشاء صفحات ACREL (جديدة)
3. ✅ إضافة قسم ACREL في التنقل (جديد)
4. ✅ تحديث صفحات STS الموجودة (إضافات فقط)
5. ✅ تحديث صفحات العدادات والقراءات (إضافات فقط)
6. ✅ إنشاء جداول قاعدة البيانات (جديدة)

---

**آخر تحديث:** 2026-01-06  
**الحالة:** ✅ جاهز للتنفيذ بعد الفحص الشامل

