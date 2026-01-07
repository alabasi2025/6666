# 📖 القصص من واقع العمل وكيفية تنفيذها
## User Stories & Implementation Guide

**تاريخ:** 6 يناير 2026  
**المصدر:** 125+ قصة مستخرجة من التخطيط + قصتان من الواقع  
**الغرض:** شرح ما تحكيه القصص وكيف سيتم تنفيذها تقنياً

---

## 🎯 نظرة عامة

تم استخراج **127 قصة** من واقع العمل موزعة على الأنظمة:

| النظام | عدد القصص |
|--------|-----------|
| **Core** | 26 |
| **Billing & Customers** | 16 |
| **Inventory** | 14 |
| **Finance** | 4 |
| **Operations** | 55 |
| **Tech** | 10 |
| **قصص مروية** | 2 |

---

## 📚 **القصص المروية من الواقع**

### **قصة 1: المحطة والبنية التحتية** 🏗️

#### **ما تحكيه:**

> "المحطة هي نستأجر حوش في أحد الأحياء، ثم نضع بداخلها مكتب للمحطة، وثم داخل الحوش هذا نضع المولدات التي تعمل بالديزل، ومن المولدات إلى الدمج، وثم إلى طبلة التوزيع، وثم تخرج كيابل تمتد إلى الشوارع والحواري التي حول المحطة."

#### **العناصر الأساسية:**
```
المحطة (الحوش المستأجر)
    │
    ├── المكتب (الإدارة)
    │
    ├── المولدات (3-5 مولدات ديزل)
    │   └── تنتج الكهرباء
    │
    ├── وحدة الدمج
    │   └── توحيد الطاقة من المولدات
    │
    ├── طبلة التوزيع الرئيسية
    │   └── توزيع الطاقة على الخطوط
    │
    └── الكيابل
        └── تمتد للشوارع والحواري
```

#### **كيف سيتم تنفيذها:**

**1. تسجيل المحطة:**
```sql
-- جدول: stations
INSERT INTO stations (
  code, nameAr,
  type,              -- 'generation' (توليد)
  status,            -- 'operational'
  address,           -- عنوان الحوش
  latitude, longitude,
  capacity,          -- إجمالي قدرة المولدات
  capacityUnit       -- 'MW' أو 'kW'
)
```

**2. تسجيل الأصول:**
```sql
-- المولدات (كأصول ثابتة):
INSERT INTO assets (
  categoryId,        -- فئة: مولدات
  stationId,
  nameAr,            -- مولد 1، مولد 2، إلخ
  type,              -- 'generator'
  manufacturer,      -- Caterpillar, Cummins
  model,
  serialNumber,
  purchaseCost,
  usefulLife         -- 15-20 سنة
)

-- وحدة الدمج:
INSERT INTO assets (
  categoryId,        -- فئة: معدات كهربائية
  nameAr,            -- وحدة الدمج الرئيسية
  type               -- 'switchgear'
)

-- طبلة التوزيع:
INSERT INTO assets (
  categoryId,        -- فئة: معدات التوزيع
  nameAr,            -- طبلة التوزيع الرئيسية
  type               -- 'distribution_panel'
)
```

**3. تسجيل الشبكة (GIS):**
```sql
-- الكيابل (كشبكة خطية):
CREATE TABLE network_segments (
  id UUID PRIMARY KEY,
  stationId UUID,
  fromNodeId UUID,   -- من طبلة التوزيع
  toNodeId UUID,     -- إلى عمود/طبلون فرعي
  cableType VARCHAR, -- ABC Cable
  cableSize VARCHAR, -- 120mm²
  length DECIMAL,    -- بالمتر
  installDate DATE,
  path GEOMETRY      -- المسار الفعلي (GIS)
)
```

**4. ربط بنظام SCADA:**
```sql
-- المعدات المراقبة:
INSERT INTO equipment (
  assetId,           -- ربط بالمولد
  type,              -- 'generator'
  isMonitored,       -- TRUE
  isControllable,    -- TRUE
  ipAddress,         -- عنوان وحدة التحكم
  communicationProtocol  -- 'Modbus', 'MQTT'
)
```

#### **الشاشات المطلوبة:**
1. ✅ إدارة المحطات `/dashboard/organization/stations`
2. ✅ سجل الأصول `/dashboard/assets`
3. ❌ **خريطة الشبكة** (GIS) `/dashboard/operations/network-map`
4. ⚠️ لوحة مراقبة المحطة `/dashboard/scada/monitoring` (Mock)

---

### **قصة 2: الموظفون والأدوار** 👥

#### **ما تحكيها:**

> "الموظفين داخل المحطة يوجد مدير للمحطة ومتحصلين وفني مولدات وكهربائيين."

#### **الهيكل الوظيفي:**
```
مدير المحطة
    │
    ├── المتحصلين (1-3 موظفين)
    │   └── دورهم: تحصيل الفواتير نقداً
    │
    ├── فني المولدات (1-2 فنيين)
    │   └── دورهم: صيانة المولدات، مراقبة الديزل
    │
    └── الكهربائيين (2-4 فنيين)
        └── دورهم: التركيبات، الصيانة، الأعطال
```

#### **كيف سيتم تنفيذها:**

**1. تسجيل الأقسام:**
```sql
INSERT INTO departments (
  code, nameAr, managerId
) VALUES
  ('ADMIN', 'الإدارة', manger_id),
  ('COLLECTION', 'التحصيل', manager_id),
  ('GENERATORS', 'فنيي المولدات', manager_id),
  ('ELECTRICAL', 'الكهربائيين', manager_id)
```

**2. تسجيل المسميات الوظيفية:**
```sql
INSERT INTO job_titles (
  code, titleAr, departmentId
) VALUES
  ('STATION_MGR', 'مدير محطة', admin_dept),
  ('COLLECTOR', 'متحصل', collection_dept),
  ('GEN_TECH', 'فني مولدات', generators_dept),
  ('ELECTRICIAN', 'كهربائي', electrical_dept)
```

**3. تسجيل الموظفين:**
```sql
INSERT INTO employees (
  employeeNumber,
  fullNameAr,
  departmentId,
  jobTitleId,
  hireDate,
  basicSalary,
  phone, mobile
)
```

**4. ربط بالمستخدمين:**
```sql
-- إنشاء حساب مستخدم لكل موظف:
INSERT INTO users (
  openId,
  name,
  email,
  role,              -- 'admin', 'user'
  employeeId,        -- ربط بجدول الموظفين
  stationId          -- المحطة المسؤول عنها
)
```

**5. ربط الفنيين بنظام العمليات الميدانية:**
```sql
-- للكهربائيين وفنيي المولدات:
INSERT INTO field_workers (
  employeeId,        -- ربط بجدول الموظفين
  userId,            -- ربط بحساب المستخدم
  workerType,        -- 'technician'
  specialization,    -- 'generators' أو 'electrical'
  dailyRate,
  operationRate
)
```

#### **الشاشات المطلوبة:**
1. ✅ إدارة الموظفين `/dashboard/hr/employees`
2. ✅ الأقسام `/dashboard/hr/departments`
3. ⚠️ ربط employees ↔ field_workers (موجود لكن يحتاج واجهة)

---

## 📚 **القصص المستخرجة من التخطيط**

### **قصة: سيناريو التسوية المعقدة** 🔴 **حرجة!**

#### **ما تحكيها:**

> "مسؤول الصندوق قام بتوريد مبلغ إجمالي واحد 150,000 إلى البنك. هذا المبلغ هو مجموع إيرادات نظامين: 100,000 من الفوترة و 50,000 من الدفع المسبق."

#### **المشكلة:**
```
كيف نطابق:
├─ حركة واحدة في الصندوق (توريد 150,000)
└─ مع
    ├─ إيراد الفوترة (100,000)
    └─ إيراد الدفع المسبق (50,000)
```

#### **كيف سيتم تنفيذها:**

**1. نظام الحسابات الوسيطة:**
```sql
-- الحركات المُسجلة:
-- في ح/ وسيط صندوق التحصيل:
INSERT (مدين: 100,000, مرجع: "إيراد فوترة")
INSERT (مدين: 50,000, مرجع: "إيراد دفع مسبق")  
INSERT (دائن: 150,000, مرجع: "توريد للبنك")

-- في ح/ وسيط بنك الحوشبي:
INSERT (مدين: 150,000, مرجع: "إيداع")
```

**2. مركز التسوية المرن:**
```typescript
// الواجهة:
┌────────────────────────────────────────────────┐
│  اللوح 1: وسيط الصندوق                       │
│  ☑ مدين: 100,000 (إيراد فوترة)              │
│  ☑ مدين: 50,000 (إيراد دفع مسبق)             │
│  ☑ دائن: 150,000 (توريد للبنك)              │
│                                                │
│  اللوح 2: وسيط البنك                         │
│  ☑ مدين: 150,000 (إيداع)                    │
│                                                │
│  سلة التسوية:                                │
│  المدين: 300,000                              │
│  الدائن: 300,000                              │
│  ✅ متوازن → [زر التسوية نشط]                │
└────────────────────────────────────────────────┘

// الكود:
class ReconciliationEngine {
  validateBalance(items) {
    const totalDebit = items.filter(i => i.type === 'debit')
      .reduce((sum, i) => sum + i.amount, 0)
    const totalCredit = items.filter(i => i.type === 'credit')
      .reduce((sum, i) => sum + i.amount, 0)
    
    return totalDebit === totalCredit
  }
  
  async reconcile(items) {
    if (!this.validateBalance(items)) {
      throw new Error("المبالغ غير متوازنة!")
    }
    
    const reconciliationId = generateId()
    for (const item of items) {
      await markAsReconciled(item.id, reconciliationId)
    }
    
    return { success: true, reconciliationId }
  }
}
```

#### **الشاشات المطلوبة:**
- ❌ **مركز التسوية** `/dashboard/finance/reconciliation`
- ❌ **سلة التسوية** (Multi-panel interface)

---

### **قصة: استبدال عداد تالف** ⚡ **مهمة جداً!**

#### **ما تحكيها:**

> "عداد المشترك أحمد تعطل منذ 15 يوم. آخر قراءة كانت 1000 كيلو. متوسط استهلاكه الشهري 300 كيلو (10 كيلو/يوم). نحتاج استبدال العداد وحساب الاستهلاك المفقود."

#### **المشكلة:**
```
كيف نحسب:
├─ الاستهلاك المفقود (15 يوم × 10 كيلو = 150 كيلو)
├─ تكلفة الاستهلاك (150 × سعر الكيلو)
├─ تكلفة العداد الجديد (هل على حساب العميل؟)
└─ كيف نوثق العملية بالكامل؟
```

#### **كيف سيتم تنفيذها:**

**1. Wizard استبدال العداد التالف:**
```typescript
class DefectiveMeterReplacementWizard {
  
  // الخطوة 1: حساب الاستهلاك التقديري
  async step1_estimateConsumption(customerId) {
    // جلب آخر 3 فواتير
    const invoices = await getRecentInvoices(customerId, 3)
    
    // حساب المتوسط
    const avgConsumption = invoices.reduce((sum, inv) => 
      sum + inv.consumption, 0) / invoices.length
    
    // أيام العطل
    const lastReading = await getLastReading(customerId)
    const daysSince = (today - lastReading.date).days
    
    // الاستهلاك المقدر
    const estimatedConsumption = (avgConsumption / 30) * daysSince
    const estimatedCost = estimatedConsumption * tariffRate
    
    return {
      avgMonthly: avgConsumption,
      daysMissing: daysSince,
      estimatedKWh: estimatedConsumption,
      estimatedCost: estimatedCost,
      confidence: invoices.length >= 3 ? 'high' : 'medium'
    }
  }
  
  // الخطوة 2: إنشاء فاتورة الاستهلاك
  async step2_createConsumptionInvoice(customerId, estimation) {
    const invoice = await createInvoice({
      customerId,
      invoiceType: 'estimated_consumption',
      consumption: estimation.estimatedKWh,
      amount: estimation.estimatedCost,
      notes: `استهلاك تقديري - عداد تالف (${estimation.daysMissing} يوم)`
    })
    
    // قيد محاسبي تلقائي
    await createJournalEntry({
      debit: {account: 'customers', amount: invoice.amount},
      credit: {account: 'revenue', amount: invoice.amount},
      sourceType: 'invoice',
      sourceId: invoice.id
    })
    
    return invoice
  }
  
  // الخطوة 3: تحديد تكلفة العداد
  async step3_determineMeterCost(meterType) {
    const item = await getItem({code: `METER_${meterType}`})
    
    return {
      options: [
        {type: 'full', cost: item.price, label: 'تحميل كامل'},
        {type: 'half', cost: item.price / 2, label: 'تحميل 50%'},
        {type: 'free', cost: 0, label: 'مجاني (ضمان)'}
      ]
    }
  }
  
  // الخطوة 4: إنشاء فاتورة العداد
  async step4_createMeterInvoice(customerId, option) {
    if (option.cost === 0) return null
    
    const invoice = await createInvoice({
      customerId,
      invoiceType: 'meter_replacement',
      amount: option.cost,
      notes: `استبدال عداد - ${option.label}`
    })
    
    await createJournalEntry({
      debit: {account: 'customers', amount: invoice.amount},
      credit: {account: 'equipment_sales', amount: invoice.amount},
      sourceType: 'invoice',
      sourceId: invoice.id
    })
    
    return invoice
  }
  
  // الخطوة 5: إنشاء أمر عمل التركيب
  async step5_createWorkOrder(customerId, oldMeter, newMeter) {
    const workOrder = await createWorkOrder({
      type: 'replacement',
      customerId,
      title: 'استبدال عداد تالف',
      description: `القديم: ${oldMeter.serialNumber}, الجديد: ${newMeter.serialNumber}`,
      assignedWorkerId: null  // سيُسند لاحقاً
    })
    
    // ربط بالفواتير
    await linkInvoicesToWorkOrder(workOrder.id, [
      consumptionInvoice.id,
      meterInvoice?.id
    ])
    
    return workOrder
  }
}
```

#### **الشاشات المطلوبة:**
- ❌ **Wizard استبدال عداد تالف** `/dashboard/wizards/meter-replacement`
- ⚠️ أمر عمل (موجود لكن لا wizard)

---

### **قصة: شحن رصيد STS** ⚡

#### **ما تحكيها:**

> "مشترك عداد STS يريد شحن 20 ريال. يدخل الموقع، يدفع، يستلم التوكن (كود 20 رقم) ويدخله في العداد."

#### **السير المطلوب:**
```
1. العميل يدخل صفحة "شحن STS"
   └─ https://station.com/sts-recharge
2. يدخل رقم العداد (11 رقم)
3. النظام يتحقق ويعرض اسم العميل
4. يدخل المبلغ (20 ريال)
5. النظام يحسب الكيلوواط تلقائياً
   └─ 20 ريال ÷ 0.5 ريال/كيلو = 40 كيلو
6. يختار طريقة الدفع (بطاقة/STC Pay/Apple Pay)
7. يتم توجيهه لبوابة الدفع
8. يدفع
9. النظام يستقبل تأكيد الدفع (Webhook)
10. يطلب التوكن من مزود STS عبر API
11. يستقبل التوكن (20 رقم)
12. يعرض التوكن للعميل
13. يرسل التوكن عبر SMS
14. يُنشئ قيد محاسبي تلقائياً
```

#### **كيف سيتم تنفيذها:**

**1. صفحة شحن STS:**
```typescript
// Route: /sts-recharge
export function STSRechargePage() {
  const [meterNumber, setMeterNumber] = useState('')
  const [amount, setAmount] = useState(0)
  const [customer, setCustomer] = useState(null)
  
  async function verifyMeter() {
    const result = await api.sts.verifyMeter(meterNumber)
    setCustomer(result.customer)
  }
  
  async function processPayment() {
    // 1. إنشاء طلب شحن
    const recharge = await api.sts.createRecharge({
      meterId: customer.meterId,
      amount: amount,
      kwh: amount / 0.5  // سعر الكيلو
    })
    
    // 2. إنشاء رابط دفع
    const paymentUrl = await paymentGateway.createPayment({
      amount: amount,
      reference: recharge.id,
      callbackUrl: '/sts-recharge/callback'
    })
    
    // 3. توجيه للدفع
    window.location = paymentUrl
  }
  
  // الشاشة
  return (
    <div>
      <input value={meterNumber} onChange={...} />
      <button onClick={verifyMeter}>تحقق</button>
      {customer && (
        <>
          <p>العميل: {customer.name}</p>
          <input type="number" value={amount} onChange={...} />
          <p>الكيلوواط: {amount / 0.5}</p>
          <button onClick={processPayment}>اشحن الآن</button>
        </>
      )}
    </div>
  )
}
```

**2. معالج Webhook (عند نجاح الدفع):**
```typescript
// POST /webhooks/payment-gateway
async function handlePaymentWebhook(payload) {
  // 1. التحقق من التوقيع
  if (!verifySignature(payload)) {
    throw new Error('Invalid signature')
  }
  
  // 2. جلب طلب الشحن
  const recharge = await getRecharge(payload.reference)
  
  // 3. طلب التوكن من مزود STS
  const token = await stsProvider.requestToken(
    recharge.meterId,
    recharge.kwh
  )
  
  // 4. حفظ التوكن
  await updateRecharge(recharge.id, {
    status: 'completed',
    token: token.number,
    paidAt: new Date()
  })
  
  // 5. إرسال SMS
  await smsService.send(recharge.customer.phone, `
    تم شحن عدادك بـ ${recharge.kwh} كيلو
    التوكن: ${token.number}
  `)
  
  // 6. قيد محاسبي تلقائي
  await autoJournal.onSTSRecharge(recharge)
  // مدين: ح/ البنك
  // دائن: ح/ إيرادات الدفع المسبق
  
  return { success: true }
}
```

#### **الشاشات والتكاملات المطلوبة:**
- ❌ صفحة شحن STS `/sts-recharge`
- ❌ تكامل مزود STS
- ❌ تكامل بوابة الدفع
- ❌ تكامل SMS
- ❌ محرك القيود التلقائي

---

### **قصة: الدعم الحكومي** 🏛️

#### **ما تحكيها:**

> "عندنا 2200 مشترك مدعوم من صندوق دعم الحديدة. الفئة أ: 82 كيلو شهرياً، الفئة ب: 64 كيلو. أول كل شهر نشحن لهم الحصة. آخر الشهر نرسل تقرير للصندوق بالاستهلاك الفعلي."

#### **المشكلة:**
```
كيف:
├─ نتتبع من هو مدعوم؟
├─ نشحن الحصة تلقائياً أول كل شهر؟
├─ نمنع التجاوز؟
├─ نحسب الاستهلاك الإضافي؟
├─ ننشئ التقرير تلقائياً؟
└─ نرسله للصندوق؟
```

#### **كيف سيتم تنفيذها:**

**1. تعديل جدول العملاء:**
```sql
ALTER TABLE customers ADD COLUMN is_subsidized BOOLEAN DEFAULT FALSE
ALTER TABLE customers ADD COLUMN subsidy_category ENUM('A', 'B')
ALTER TABLE customers ADD COLUMN subsidy_reference_number VARCHAR(50)
ALTER TABLE customers ADD COLUMN monthly_quota_kwh DECIMAL  -- 82 or 64
```

**2. Cron Job شحن الحصص:**
```python
@cron("1 0 1 * *")  # 12:01 صباحاً أول يوم من كل شهر
async def charge_monthly_subsidies():
    """شحن الحصص المدعومة"""
    subsidized = await getSubsidizedCustomers(active=True)
    
    for customer in subsidized:
        quota = customer.monthly_quota_kwh  # 82 or 64
        
        # استدعاء Acrel API لشحن العداد
        result = await acrel.setMonthlyQuota(
            device_id=customer.acrel_device_id,
            quota_kwh=quota
        )
        
        # تسجيل العملية
        await logSubsidyCharge(customer.id, quota, result)
```

**3. Cron Job تقرير الصندوق:**
```python
@cron("59 23 28 * *")  # 11:59 مساءً يوم 28 من كل شهر
async def generate_subsidy_report():
    """إنشاء تقرير Excel للصندوق"""
    subsidized = await getSubsidizedCustomers()
    
    # إنشاء Excel
    report = create_excel({
        columns: [
            "الرقم المرجعي",
            "اسم المشترك",
            "الفئة",
            "الاستهلاك (كيلو)",
            "السعر (ريال)"
        ],
        data: []
    })
    
    for customer in subsidized:
        # جلب الاستهلاك الفعلي من Acrel
        consumption = await acrel.getMonthlyConsumption(
            device_id=customer.acrel_device_id,
            year=current_year,
            month=current_month - 1
        )
        
        report.addRow({
            ref: customer.subsidy_reference_number,
            name: customer.nameAr,
            category: customer.subsidy_category,
            consumption: consumption.total_kwh,
            amount: consumption.total_kwh * unit_price
        })
    
    # إرسال للصندوق
    await sendEmail(
        to=subsidy_fund_email,
        subject=f"تقرير الدعم - {current_month}/{current_year}",
        attachment=report.file
    )
```

**4. معالجة الاستهلاك الإضافي:**
```python
async def handle_quota_exceeded(customer):
    """عند تجاوز الحصة"""
    # جلب الاستهلاك الحالي
    consumption = await acrel.getCurrentConsumption(customer.acrel_device_id)
    quota = customer.monthly_quota_kwh
    
    if consumption > quota:
        overage = consumption - quota
        amount = overage * commercial_rate  # سعر تجاري
        
        # إنشاء فاتورة للتجاوز
        invoice = await createInvoice({
            customerId: customer.id,
            invoiceType: 'subsidy_overage',
            consumption: overage,
            amount: amount,
            notes: f'استهلاك إضافي - تجاوز الحصة المدعومة'
        })
        
        # إرسال إشعار
        await sendSMS(customer.phone, f"""
            عميلنا العزيز،
            تجاوزت حصتك المدعومة ({quota} كيلو).
            الاستهلاك الإضافي: {overage} كيلو ({amount} ريال).
            يرجى الدفع.
        """)
```

#### **الشاشات المطلوبة:**
- ❌ إدارة الدعم `/dashboard/subsidies/management`
- ❌ لوحة مراقبة الدعم `/dashboard/subsidies/monitoring`
- ❌ تقارير الدعم `/dashboard/subsidies/reports`

---

### **قصة: تركيب عداد جديد** 🔧

#### **ما تحكيها:**

> "عميل جديد اسمه أحمد يريد تركيب عداد. الفني يذهب، يركب العداد رقم 12345، ختم أخضر رقم 555، قاطع 63 أمبير، كيبل 50 متر. يلتقط 5 صور. العميل يوقع."

#### **المتطلبات:**
```
توثيق كامل:
├─ الرقم التسلسلي للعداد
├─ رقم ولون الختم
├─ نوع وسعة القاطع
├─ طول ونوع الكيبل
├─ 5 صور على الأقل
├─ GPS للموقع
├─ توقيع العميل الرقمي
└─ القراءة الأولية
```

#### **كيف سيتم تنفيذها:**

**1. إنشاء العملية:**
```sql
INSERT INTO field_operations (
  operationType,     -- 'installation'
  customerId,
  title,             -- 'تركيب عداد جديد'
  locationLat, locationLng,
  scheduledDate,
  assignedWorkerId,
  status             -- 'assigned'
)
```

**2. في تطبيق الفني الجوال:**
```typescript
// شاشة تفاصيل التركيب
function InstallationScreen({ operation }) {
  const [meterSerial, setMeterSerial] = useState('')
  const [sealNumber, setSealNumber] = useState('')
  const [sealColor, setSealColor] = useState('')
  const [breakerType, setBreakerType] = useState('')
  const [cableLength, setCableLength] = useState(0)
  const [photos, setPhotos] = useState([])
  const [signature, setSignature] = useState(null)
  
  // مسح الباركود
  async function scanBarcode(type) {
    const result = await BarcodeScanner.scan()
    if (type === 'meter') setMeterSerial(result)
    if (type === 'seal') setSealNumber(result)
  }
  
  // التقاط صورة
  async function capturePhoto(photoType) {
    const photo = await Camera.takePicture()
    const location = await Location.getCurrentPosition()
    
    photos.push({
      type: photoType,  // 'meter_front', 'seal', etc
      url: photo.uri,
      latitude: location.lat,
      longitude: location.lng,
      capturedAt: new Date()
    })
  }
  
  // توقيع العميل
  async function captureSignature() {
    const sign = await SignaturePad.getSignature()
    setSignature(sign.base64)
  }
  
  // إكمال التركيب
  async function completeInstallation() {
    await api.installations.complete({
      operationId: operation.id,
      details: {
        meterSerialNumber: meterSerial,
        sealNumber: sealNumber,
        sealColor: sealColor,
        breakerType: breakerType,
        cableLength: cableLength,
        initialReading: 0
      },
      photos: photos,
      customerSignature: signature
    })
    
    // التطبيق يرسل كل شيء مع GPS الحالي
  }
  
  return (
    <View>
      <Button onPress={() => scanBarcode('meter')}>
        مسح العداد
      </Button>
      <Input value={meterSerial} />
      
      <Button onPress={() => scanBarcode('seal')}>
        مسح الختم
      </Button>
      <Input value={sealNumber} />
      <ColorPicker value={sealColor} onChange={setSealColor} />
      
      <Input placeholder="نوع القاطع" value={breakerType} />
      <Input placeholder="طول الكيبل (متر)" value={cableLength} type="number" />
      
      <Text>الصور المطلوبة (5):</Text>
      <Button onPress={() => capturePhoto('meter_front')}>
        صورة العداد
      </Button>
      <Button onPress={() => capturePhoto('seal')}>
        صورة الختم
      </Button>
      {/* ... المزيد */}
      
      <SignaturePad onEnd={captureSignature} />
      
      <Button onPress={completeInstallation}>
        إكمال التركيب
      </Button>
    </View>
  )
}
```

**3. المعالجة في الخادم:**
```typescript
async function onInstallationCompleted(data) {
  // 1. حفظ بيانات التركيب
  await createInstallationDetails(data.details)
  
  // 2. حفظ الصور
  for (const photo of data.photos) {
    await createInstallationPhoto({
      operationId: data.operationId,
      photoType: photo.type,
      photoUrl: await uploadPhoto(photo.url),
      latitude: photo.latitude,
      longitude: photo.longitude
    })
  }
  
  // 3. تحديث المخزون
  await updateInventoryUnit(data.details.meterSerialNumber, {
    status: 'installed',
    installedAtCustomerId: data.customerId,
    installationDate: new Date()
  })
  
  // 4. تفعيل العداد
  await activateMeter({
    meterId: data.meterId,
    isActive: true,
    activationDate: new Date()
  })
  
  // 5. تحديث حالة العملية
  await updateOperationStatus(data.operationId, 'completed')
}
```

#### **الشاشات المطلوبة:**
- ❌ **تطبيق جوال** للفنيين (كامل)
- ✅ شاشة العمليات (موجودة)

---

### **قصة: صيانة دورية للمولد** 🔧

#### **ما تحكيها:**

> "المولد رقم 1 يحتاج صيانة كل 250 ساعة عمل. الصيانة تشمل: تغيير الزيت (20 لتر)، تغيير فلتر الزيت، فحص الأحزمة."

#### **كيف سيتم تنفيذها:**

**1. خطة الصيانة الوقائية:**
```sql
INSERT INTO maintenance_plans (
  code,              -- 'PM-GEN-250H'
  nameAr,            -- 'صيانة مولد كل 250 ساعة'
  assetCategoryId,   -- فئة: مولدات
  frequency,         -- 'usage_based'
  basedOn,           -- 'meter'
  meterType,         -- 'running_hours'
  meterInterval,     -- 250
  tasks              -- JSON: [{task: 'تغيير زيت', materials: [...]}]
)
```

**2. Cron Job الجدولة:**
```python
@cron("0 0 * * *")  # يومياً منتصف الليل
async def schedule_preventive_maintenance():
    """فحص خطط الصيانة وإنشاء أوامر عمل"""
    plans = await getActivePMPlans()
    
    for plan in plans:
        if plan.basedOn == 'meter':
            # جلب الأصول المرتبطة بهذه الخطة
            assets = await getAssetsByCategory(plan.assetCategoryId)
            
            for asset in assets:
                # جلب آخر قراءة
                current = await getCurrentMeterReading(asset.id, plan.meterType)
                last_pm = await getLastPMReading(asset.id, plan.id)
                
                if current - last_pm >= plan.meterInterval:
                    # حان موعد الصيانة!
                    work_order = await createWorkOrder({
                        type: 'preventive',
                        assetId: asset.id,
                        title: plan.nameAr,
                        tasks: plan.tasks,
                        estimatedHours: plan.estimatedHours
                    })
                    
                    # إنشاء طلب مواد تلقائي
                    await createMaterialRequest({
                        operationId: work_order.id,
                        items: extractMaterialsFromTasks(plan.tasks)
                    })
```

**3. تنفيذ الصيانة:**
```typescript
// في تطبيق الفني:
async function completePreventiveMaintenance(workOrder) {
  // تسجيل المواد المستخدمة فعلياً
  const usedMaterials = [
    {itemId: oil_20l, quantity: 20},  // زيت 20 لتر
    {itemId: oil_filter, quantity: 1}  // فلتر زيت
  ]
  
  // حفظ النتائج
  await api.workOrders.complete({
    id: workOrder.id,
    actualHours: 2.5,
    materialsUsed: usedMaterials,
    notes: "تم تغيير الزيت والفلتر، الأحزمة بحالة جيدة",
    completedAt: new Date()
  })
  
  // النظام تلقائياً:
  // 1. يخصم المواد من المخزون
  // 2. يحدث سجل الأصل
  // 3. يحدث قراءة آخر صيانة
  // 4. يُنشئ قيد محاسبي (تكلفة الصيانة)
}
```

#### **الشاشات المطلوبة:**
- ⚠️ خطط الصيانة `/dashboard/maintenance/plans` (موجودة لكن محدودة)
- ❌ **محرك الجدولة** (Cron Job)
- ❌ تطبيق جوال للفنيين

---

### **قصة: تحصيل نقدي** 💰

#### **ما تحكيها:**

> "المتحصل محمد يذهب للأحياء، يجمع الفواتير نقداً. اليوم جمع 50,000 ريال من 30 عميل. يرجع للمكتب، يسلم النقد لأمين الصندوق."

#### **كيف سيتم تنفيذها:**

**1. في تطبيق المتحصل:**
```typescript
// لكل دفعة:
async function recordPayment(customerId, amount, invoiceIds) {
  const payment = await api.payments.create({
    customerId,
    amount,
    paymentMethod: 'cash',
    receivedBy: currentUser.id,  // المتحصل
    invoices: invoiceIds,
    
    // GPS للموقع
    latitude: await getCurrentLat(),
    longitude: await getCurrentLng()
  })
  
  // يطبع إيصال فوراً
  await printReceipt(payment)
  
  // قيد محاسبي تلقائي (في حساب وسيط):
  // مدين: ح/ وسيط صندوق التحصيل
  // دائن: ح/ العملاء
}
```

**2. في نهاية اليوم:**
```typescript
// شاشة التسليم:
async function handoverToTreasury() {
  const summary = await api.payments.getCollectorSummary({
    collectorId: currentUser.id,
    date: today
  })
  
  // عرض الملخص:
  // - عدد العملاء: 30
  // - إجمالي المبلغ: 50,000
  // - قائمة تفصيلية
  
  // تأكيد التسليم
  await api.treasury.handover({
    collectorId: currentUser.id,
    amount: summary.total,
    receipts: summary.payments,
    handedTo: treasuryUserId
  })
  
  // قيد تلقائي (في وسيط):
  // لا قيد! (المبلغ موجود في وسيط الصندوق من الدفعات)
}
```

**3. أمين الصندوق:**
```typescript
// يستلم ويؤكد
async function confirmHandover(handoverId) {
  await api.treasury.confirmReceived(handoverId)
  
  // الآن المبلغ في الصندوق فعلياً
  // رصيد ح/ وسيط صندوق التحصيل: 50,000 (مدين)
}
```

**4. في نهاية اليوم - توريد للبنك:**
```typescript
async function depositToBank(amount, bankId) {
  await api.treasury.deposit({
    amount: amount,     // 500,000 (من عدة أيام)
    toBankId: bankId,
    depositDate: today
  })
  
  // قيد في الوسيط:
  // مدين: ح/ وسيط بنك الحوشبي
  // دائن: ح/ وسيط صندوق التحصيل
}
```

**5. المحاسب (بعد كشف الحساب):**
```typescript
async function reconcileBankStatement(entries) {
  // يرى إيداع 500,000 في كشف الحساب
  // يطابقه مع حركة التوريد في الوسيط
  await reconciliationCenter.match({
    clearingEntry: '500,000 دائن في وسيط الصندوق',
    bankEntry: '500,000 مدين في وسيط البنك'
  })
  
  // بعد المطابقة، يتم الترحيل للحساب الدائم
}
```

#### **الشاشات المطلوبة:**
- ❌ تطبيق المتحصل (جوال)
- ❌ شاشة التسليم `/dashboard/treasury/handover`
- ❌ شاشة التوريد `/dashboard/treasury/deposits`
- ❌ مركز التسوية `/dashboard/finance/reconciliation`

---

## 🔥 **القصص الحرجة (غير مُنفذة)**

### **1. محرك التسوية المرن** 🔴

**عدد القصص:** 5 قصص ذات أولوية عالية

**ما تحكيه:**
- سيناريوهات تسوية معقدة (1:1, 1:N, N:1, N:M)
- الحسابات الوسيطة
- المطابقة المرنة
- سلة التسوية

**المتطلبات:**
```sql
-- جداول جديدة:
daily_transactions (الحركات اليومية في الوسيط)
reconciliations (التسويات)
reconciliation_items (بنود التسوية)
clearing_accounts (الحسابات الوسيطة)

-- واجهات:
مركز التسوية (Multi-panel)
سلة التسوية (Reconciliation Basket)
تقرير تقادم العمليات
```

**الحالة:** ❌ **غير موجود نهائياً!**

---

### **2. الدعم الحكومي** 🔴

**عدد القصص:** 3 قصص

**ما تحكيها:**
- 2200 مشترك مدعوم
- فئتان (أ: 82 كيلو، ب: 64 كيلو)
- شحن تلقائي أول كل شهر
- تقرير شهري للصندوق

**المتطلبات:**
```sql
-- حقول في customers
subsidy_* fields

-- Cron Jobs:
charge_monthly_subsidies()
generate_subsidy_report()

-- تكامل:
Acrel API: setMonthlyQuota()
```

**الحالة:** ❌ **غير موجود نهائياً!**

---

### **3. Wizards للعمليات المعقدة** 🔴

**عدد القصص:** 10+ قصص

**ما تحكيها:**
- استبدال عداد تالف (حساب الاستهلاك المفقود)
- ترقية اشتراك (إلغاء تأمين)
- تركيب جديد (توثيق كامل)

**المتطلبات:**
```
كل Wizard:
├─ واجهة خطوة بخطوة
├─ حسابات تلقائية
├─ إنشاء فواتير تلقائياً
├─ إنشاء قيود تلقائياً
└─ توجيه المستخدم
```

**الحالة:** ❌ **غير موجود نهائياً!**

---

### **4. التطبيقات الجوالة** 🔴

**عدد القصص:** 20+ قصة

**ما تحكيها:**
- الفني يستلم المهمة
- يذهب للموقع
- يمسح الباركود
- يلتقط الصور
- يسجل البيانات
- العميل يوقع

**المتطلبات:**
```
تطبيقان:
├─ تطبيق الفنيين
│  ├─ React Native/Flutter
│  ├─ مسح باركود
│  ├─ كاميرا
│  ├─ GPS
│  ├─ توقيع رقمي
│  └─ Offline mode
│
└─ تطبيق العملاء
   ├─ عرض الفواتير
   ├─ دفع إلكتروني
   ├─ شحن STS
   ├─ مراقبة الاستهلاك
   └─ طلبات الخدمة
```

**الحالة:** ❌ **غير موجود نهائياً!**

---

## 📊 **ملخص القصص حسب الحالة**

| الحالة | عدد القصص | النسبة |
|--------|-----------|--------|
| ✅ **مُنفذة بالكامل** | 20 | 16% |
| ⚠️ **مُنفذة جزئياً** | 50 | 39% |
| ❌ **غير مُنفذة** | 57 | 45% |
| **الإجمالي** | **127** | **100%** |

---

## 🎯 **القصص حسب الأولوية**

### **🔴 أولوية حرجة (15 قصة):**

| # | القصة | الحالة |
|---|-------|--------|
| 1 | محرك التسوية المرن | ❌ 0% |
| 2 | محرك القيود التلقائي | ❌ 0% |
| 3 | الدعم الحكومي | ❌ 0% |
| 4 | تكامل بوابات الدفع | ❌ 0% |
| 5 | تكامل SMS/WhatsApp | ❌ 0% |
| 6 | Cron Job الفوترة التلقائية | ❌ 0% |
| 7 | تطبيق الفنيين الجوال | ❌ 0% |
| 8 | محرك التسعير المرن | ❌ 0% |
| 9 | تكامل STS | ❌ 0% |
| 10 | تكامل Acrel IoT | ❌ 0% |
| 11 | نظام GIS | ❌ 5% |
| 12 | معالج استبدال عداد تالف | ❌ 0% |
| 13 | معالج ترقية اشتراك | ❌ 0% |
| 14 | نظام POS | ❌ 0% |
| 15 | محرك الجدولة الوقائية | ❌ 0% |

---

### **🟡 أولوية عالية (40 قصة):**

تشمل:
- تتبع الأرقام التسلسلية
- Work Packages
- نظام الفحص والقبول (موجود جزئياً)
- المطابقة الثلاثية للموردين
- تقارير مالية متقدمة
- نظام الصيانة الوقائية (موجود جزئياً)

---

## 💡 **كيف نفهم القصص؟**

### **كل قصة تتكون من:**

```
1. الموقف الحقيقي
   └─ "المتحصل يجمع 50,000 من 30 عميل"

2. نقطة الألم
   └─ "كيف نتتبع كل دفعة؟"

3. الحل المطلوب
   └─ "تطبيق جوال للمتحصل"

4. التنفيذ التقني
   └─ "API + تطبيق + قيد محاسبي"
```

---

## 🚀 **خطة تنفيذ القصص الحرجة**

### **المرحلة 1: المحركات (6 أسابيع)**

| الأسبوع | القصة | المخرج |
|---------|-------|--------|
| 1-2 | محرك القيود التلقائي | كل عملية → قيد تلقائي |
| 2-3 | محرك التسوية المرن | الحسابات الوسيطة + مركز التسوية |
| 3-4 | محرك التسعير | تسعير ديناميكي حسب نوع العداد |
| 5 | Cron Job الفوترة | فواتير تلقائية كل 10 أيام |
| 6 | محرك الجدولة الوقائية | صيانة تلقائية |

---

### **المرحلة 2: التكاملات (6 أسابيع)**

| الأسبوع | القصة | المخرج |
|---------|-------|--------|
| 1-2 | تكامل بوابة دفع | دفع إلكتروني فعلي |
| 2-3 | تكامل SMS | إشعارات تلقائية |
| 3-4 | تكامل Acrel IoT | قراءات حية + فصل/وصل |
| 5-6 | تكامل STS | شحن رصيد تلقائي |

---

### **المرحلة 3: التطبيقات الجوالة (10 أسابيع)**

| الأسبوع | القصة | المخرج |
|---------|-------|--------|
| 1-6 | تطبيق الفنيين | عمليات ميدانية رقمية |
| 4-10 | تطبيق العملاء | خدمة ذاتية |

---

### **المرحلة 4: الميزات المتقدمة (10 أسابيع)**

| الأسبوع | القصة | المخرج |
|---------|-------|--------|
| 1-3 | نظام GIS | خرائط تفاعلية |
| 2-4 | Wizards | معالجات للعمليات المعقدة |
| 5-7 | نظام الدعم الحكومي | إدارة كاملة للدعم |
| 8-10 | تتبع المكونات الفرعية | MTBF + TCO |

---

## 📌 **الخلاصة**

### **القصص تحكي:**
```
واقع العمل اليومي:
├─ كيف تعمل المحطة
├─ من هم الموظفون
├─ كيف يتم التحصيل
├─ كيف تتم الصيانة
├─ ما هي المشاكل
└─ ما هي الاحتياجات
```

### **التنفيذ يتطلب:**
```
1. المحركات (5 محركات رئيسية)
2. التكاملات (8 تكاملات)
3. Cron Jobs (15+ مهمة)
4. التطبيقات الجوالة (2)
5. Wizards (10+)
6. GIS (نظام كامل)
```

### **الوضع الحالي:**
```
✅ البنية موجودة (الجداول + APIs الأساسية)
❌ القصص غير مُنفذة (المحركات + التكاملات + الجوال)

النسبة: 45-50% من القصص الكاملة
```

---

**آخر تحديث:** 6 يناير 2026  
**الحالة:** دليل شامل للقصص وتنفيذها  
**النصيحة:** ابدأ بالمحركات الخمسة أولاً!


