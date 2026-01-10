# 📋 قائمة المهام الدقيقة جداً لاستكمال النظام
## Ultra-Detailed TODO List - Based on 86 TODO Comments + Deep Analysis

**تاريخ الإنشاء:** 2026-01-08  
**النسخة:** 2.0 (الأدق والأشمل)  
**المصدر:** فحص 86 TODO comment + 25 TODO في client + تحليل شامل

---

## 📊 الإحصائيات:

- **TODO Comments في Server:** 86
- **TODO Comments في Client:** 25  
- **إجمالي المهام:** ~2000 مهمة (مع التفصيل الدقيق)
- **المهام الحرجة (🔴):** ~50 مهمة
- **المهام العالية (🟡):** ~400 مهمة
- **المهام المتوسطة (🟢):** ~800 مهمة
- **المهام المنخفضة (🔵):** ~750 مهمة

---

# 🔴 القسم 1: Cron Jobs (المهام المجدولة) - 15 مهمة

## الوصف:
معظم Cron Jobs موجودة في `server/core/cron-jobs.ts` لكنها **TODO فقط** (لا تنفذ أي شيء).

---

### 🔴 1.1: تفعيل الفوترة التلقائية (Auto-Billing) - أولوية عالية جداً

**الملف:** `server/core/cron-jobs.ts` (السطر 65-73)  
**Cron:** كل 10 أيام (`0 0 */10 * *`)

**الكود الحالي:**
```typescript
// TODO: تنفيذ الفوترة التلقائية
logger.info("Auto-billing job completed");
```

**المطلوب:**
1. إنشاء `server/services/auto-billing-service.ts`
2. جلب جميع العدادات التقليدية التي مرّ عليها 10 أيام أو أكثر منذ آخر قراءة
3. لكل عداد:
   - جلب القراءة الأخيرة
   - حساب الاستهلاك (القراءة الحالية - القراءة السابقة)
   - حساب التعرفة والرسوم والضرائب
   - إنشاء فاتورة في `invoices_enhanced`
   - إنشاء قيد محاسبي تلقائي (`AutoJournalEngine.onInvoiceCreated`)
   - إرسال الفاتورة للعميل (SMS + WhatsApp + Email)
4. معالجة الأخطاء:
   - قراءة مفقودة → تسجيل خطأ وتخطي
   - تعرفة غير موجودة → استخدام التعرفة الافتراضية أو تسجيل خطأ
   - عداد غير مربوط → تسجيل خطأ
   - فشل القيد المحاسبي → إعادة المحاولة أو تسجيل خطأ
5. تسجيل جميع الأخطاء في جدول `billing_errors` (يجب إنشاؤه)
6. إرسال تقرير يومي للمحاسب بالأخطاء

**الكود المطلوب:**
```typescript
// في cron-jobs.ts
this.scheduleJob("auto-billing", "0 0 */10 * *", async () => {
  logger.info("Running auto-billing job...");
  try {
    const autoBillingService = (await import("../services/auto-billing-service")).default;
    const result = await autoBillingService.run();
    logger.info("Auto-billing job completed", { 
      invoicesCreated: result.success, 
      errors: result.errors 
    });
  } catch (error: any) {
    logger.error("Auto-billing job failed", { error: error.message });
  }
}, 10 * 24 * 60 * 60 * 1000);
```

**المدة المتوقعة:** 3-5 أيام عمل

---

### 🔴 1.2: تفعيل شحن الحصص المدعومة (Charge Subsidies) - أولوية عالية

**الملف:** `server/core/cron-jobs.ts` (السطر 76-126)  
**Cron:** أول كل شهر (`1 0 1 * *`)

**الكود الحالي:**
```typescript
// TODO: استدعاء ACREL API لشحن الحصة
// import { acrelService } from "../developer/integrations/acrel-service";
// await acrelService.setTariff(meterId, tariffId);
// await AcrelService.setMonthlyQuota(meterId, customer.monthly_quota);
```

**المطلوب:**
1. إكمال تكامل ACREL (راجع القسم 3)
2. استدعاء `acrelService.setMonthlyQuota(meterId, quota)` لكل عميل مدعوم
3. تسجيل الشحن في جدول `government_support_consumption`
4. إرسال إشعار للعميل (SMS/WhatsApp) بأنه تم شحن الحصة الشهرية
5. معالجة الأخطاء:
   - فشل API → إعادة المحاولة 3 مرات
   - عداد غير موجود → تسجيل خطأ
   - عميل غير نشط → تخطي

**المدة المتوقعة:** 2-3 أيام عمل (بعد استكمال تكامل ACREL)

---

### 🟡 1.3: تفعيل تقرير الدعم الشهري (Generate Subsidy Report) - أولوية متوسطة

**الملف:** `server/core/cron-jobs.ts` (السطر 128-182)  
**Cron:** اليوم 28 من كل شهر (`59 23 28 * *`)

**الكود الحالي:**
```typescript
// TODO: إرسال التقرير للجهات المعنية
// await EmailService.send({
//   to: "government@example.com",
//   subject: `تقرير الدعم الشهري - ${year}/${month}`,
//   body: generateReportHTML(report)
// });
```

**المطلوب:**
1. إنشاء `server/reports/subsidy-report-generator.ts`
2. توليد تقرير HTML شامل يحتوي على:
   - عدد العملاء المدعومين
   - إجمالي الاستهلاك المدعوم
   - إجمالي المبلغ المطلوب من الدعم
   - قائمة العملاء الذين تجاوزوا الحد
   - قائمة العملاء غير النشطين
3. إرسال التقرير عبر Email للجهات المعنية
4. حفظ نسخة PDF من التقرير في `server/uploads/subsidy-reports/`
5. إشعار مدير المحطة بأن التقرير جاهز

**المدة المتوقعة:** 2 يوم عمل

---

### 🟡 1.4: تفعيل الإهلاك الشهري (Monthly Depreciation) - أولوية متوسطة

**الملف:** `server/core/cron-jobs.ts` (السطر 184-209)  
**Cron:** أول كل شهر (`0 1 1 * *`)

**الكود الحالي:**
```typescript
// TODO: استدعاء دالة حساب الإهلاك
logger.info(`Monthly depreciation calculated for business ${business.id}`);
```

**المطلوب:**
1. إنشاء `server/services/depreciation-service.ts`
2. لكل أصل في جدول `assets`:
   - جلب قيمة الأصل الدفترية (`bookValue`)
   - جلب طريقة الإهلاك (`depreciationMethod`)
   - حساب الإهلاك الشهري:
     - **القسط الثابت:** `(cost - salvageValue) / (usefulLife * 12)`
     - **القسط المتناقص:** `bookValue * (depreciationRate / 12)`
   - تحديث `bookValue` و `accumulatedDepreciation`
   - إنشاء قيد محاسبي:
     - مدين: مصروف الإهلاك (5200)
     - دائن: مخصص إهلاك الأصل (1900)
3. تسجيل جميع عمليات الإهلاك في جدول `depreciation_history` (يجب إنشاؤه)
4. توليد تقرير شهري بالإهلاكات

**المدة المتوقعة:** 3-4 أيام عمل

---

### 🟡 1.5: تفعيل معالجة سجلات الحضور (Process Attendance) - أولوية متوسطة

**الملف:** `server/core/cron-jobs.ts` (السطر 211-225)  
**Cron:** يومياً الساعة 23:55 (`55 23 * * *`)

**الكود الحالي:**
```typescript
// TODO: معالجة سجلات الحضور من أجهزة البصمة
```

**المطلوب:**
1. تكامل مع أجهزة البصمة (راجع القسم 7)
2. جلب سجلات الحضور من أجهزة البصمة (TCP/IP أو Web API)
3. حفظ السجلات في جدول `attendance_logs`
4. معالجة السجلات:
   - حساب ساعات العمل
   - حساب العمل الإضافي
   - حساب التأخير والغياب
   - تحديث جدول `attendance_summaries`
5. إرسال إشعارات للموظفين المتأخرين
6. توليد تقرير يومي للموارد البشرية

**المدة المتوقعة:** 5-7 أيام عمل (بعد تكامل البصمة)

---

### 🔴 1.6: تفعيل إرسال التذكيرات (Payment Reminders) - أولوية عالية جداً

**الملف:** `server/core/cron-jobs.ts` (السطر 231-287)  
**Cron:** يومياً الساعة 10:00 (`0 10 * * *`)

**الكود الحالي:**
```typescript
// TODO: استدعاء SMS Service
```

**المطلوب:**
1. تفعيل SMS/WhatsApp (راجع القسم 2)
2. جلب جميع الفواتير المتأخرة (`dueDate < today` و `status = 'unpaid'`)
3. لكل فاتورة:
   - التحقق من عدم إرسال تذكير في آخر 24 ساعة (تجنب التكرار)
   - إرسال SMS: "عزيزي العميل، تذكير بسداد فاتورة رقم {invoiceNumber} بمبلغ {amount} ريال. تاريخ الاستحقاق: {dueDate}"
   - إرسال WhatsApp مع صورة/PDF الفاتورة
   - إرسال Email مع PDF مرفق
   - تسجيل التذكير في جدول `payment_reminders`
4. تصعيد الفواتير المتأخرة أكثر من 30 يوم:
   - إشعار مدير المحطة
   - إضافة العميل إلى قائمة "المطلوب فصلهم"
5. معالجة الأخطاء:
   - فشل الإرسال → إضافة إلى queue لإعادة المحاولة

**المدة المتوقعة:** 2-3 أيام عمل (بعد تفعيل SMS/WhatsApp)

---

### 🟢 1.7-1.15: باقي Cron Jobs

**المهام الأخرى:** (بدون TODO لكن تحتاج تحسين)
- **1.7:** تسوية عمليات الدفع المسبق (`prepaid-reconciliation`)
- **1.8:** فحص حالة الاتصال بالأجهزة (`health-check-devices`)
- **1.9:** إشعارات انتهاء الاشتراكات (`subscription-expiry-notifications`)
- **1.10:** النسخ الاحتياطي (`backup`)
- **1.11:** التنظيف (`cleanup`)
- **1.12:** تحديث الأسعار (`price-updates`)
- **1.13:** تحديث الإحصائيات (`update-stats`)
- **1.14:** إشعارات النظام (`system-notifications`)
- **1.15:** معالجة عمليات الدفع المعلقة (`process-pending-payments`)

**المدة المتوقعة:** 1-2 يوم عمل لكل مهمة

---

# 🔴 القسم 2: SMS & WhatsApp & Email (التكاملات الحرجة) - 8 مهام

## الوصف:
جميع خدمات الإرسال موجودة لكن **محاكاة فقط** (logger.debug) - لا يوجد إرسال فعلي.

---

### 🔴 2.1: تفعيل SMS الفعلي - أولوية عالية جداً

**الملف:** `server/notifications/channels/sms.ts`  
**المشكلة:** السطر 42 يستخدم `logger.debug` فقط

**الكود الحالي:**
```typescript
logger.debug('Sending SMS', { to: recipient.phone, message });
return { success: true, ... };
```

**المطلوب:**
1. اختيار مزود SMS:
   - **Twilio** (عالمي، موثوق)
   - **Unifonic** (سعودي، رخيص)
   - **Nexmo/Vonage** (عالمي)
2. إنشاء حساب والحصول على API Keys
3. إضافة متغيرات بيئة:
   ```env
   SMS_PROVIDER=twilio
   SMS_API_KEY=your_api_key
   SMS_API_SECRET=your_api_secret
   SMS_FROM_NUMBER=+966xxxxxxxxx
   ```
4. تثبيت مكتبة:
   ```bash
   npm install twilio  # أو
   npm install unifonic  # أو
   npm install nexmo
   ```
5. تنفيذ الإرسال الفعلي:
   ```typescript
   async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
     try {
       const message = this.formatSmsMessage(notification);
       
       if (this.config.provider === 'twilio') {
         const client = require('twilio')(this.config.apiKey, this.config.apiSecret);
         const result = await client.messages.create({
           body: message,
           from: this.config.fromNumber,
           to: recipient.phone
         });
         return { success: true, messageId: result.sid };
       }
       // ... باقي المزودين
     } catch (error) {
       logger.error('SMS send failed', { error });
       return { success: false, error: error.message };
     }
   }
   ```
6. إضافة جدول `sms_logs` لتسجيل جميع الرسائل:
   ```typescript
   {
     id, business_id, recipient_phone, message, status,
     provider, message_id, cost, sent_at, delivered_at, error
   }
   ```
7. معالجة الأخطاء:
   - رصيد غير كافٍ → إشعار الإدارة
   - رقم غير صحيح → تسجيل خطأ
   - فشل الإرسال → إضافة إلى queue لإعادة المحاولة

**التكلفة المتوقعة:** ~0.01-0.05 ريال لكل رسالة  
**المدة المتوقعة:** 2-3 أيام عمل

---

### 🔴 2.2: تفعيل WhatsApp الفعلي - أولوية عالية جداً

**الملف:** `server/notifications/channels/whatsapp.ts`  
**المشكلة:** السطر 51-57 يوجد `TODO: تكامل فعلي مع Twilio`

**الكود الحالي:**
```typescript
// TODO: تكامل فعلي مع Twilio
logger.info('WhatsApp message sent (simulated)', { ... });
```

**المطلوب:**
1. اختيار مزود WhatsApp:
   - **Twilio WhatsApp Business API** (عالمي، سريع الإعداد)
   - **Infobip** (عالمي، احترافي)
   - **WhatsApp Business API** (رسمي، معقد)
2. إنشاء حساب والحصول على API Keys
3. إضافة متغيرات بيئة:
   ```env
   WHATSAPP_PROVIDER=twilio
   WHATSAPP_ACCOUNT_SID=your_sid
   WHATSAPP_AUTH_TOKEN=your_token
   WHATSAPP_FROM_NUMBER=whatsapp:+14155238886
   ```
4. تنفيذ الإرسال الفعلي:
   ```typescript
   async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
     try {
       const formattedPhone = `whatsapp:${recipient.phone.startsWith('+') ? recipient.phone : '+966' + recipient.phone}`;
       const message = this.formatWhatsAppMessage(notification);
       
       if (this.config.provider === 'twilio' && this.config.accountSid && this.config.authToken) {
         const client = require('twilio')(this.config.accountSid, this.config.authToken);
         const result = await client.messages.create({
           body: message,
           from: this.config.fromNumber,
           to: formattedPhone
         });
         return { success: true, messageId: result.sid };
       }
       // ...
     } catch (error) {
       logger.error('WhatsApp send failed', { error });
       return { success: false, error: error.message };
     }
   }
   ```
5. دعم إرسال الوسائط (صور، PDFs):
   ```typescript
   async sendInvoice(invoiceId: number, recipient: NotificationRecipient): Promise<NotificationResult> {
     // توليد PDF للفاتورة
     const pdfUrl = await generateInvoicePDF(invoiceId);
     
     // إرسال WhatsApp مع الصورة/PDF
     const result = await client.messages.create({
       from: this.config.fromNumber,
       to: formattedPhone,
       mediaUrl: [pdfUrl]
     });
   }
   ```
6. إضافة جدول `whatsapp_logs`
7. معالجة callbacks/webhooks من WhatsApp (حالة التسليم، القراءة، الرد)

**التكلفة المتوقعة:** ~0.005-0.02 ريال لكل رسالة  
**المدة المتوقعة:** 3-4 أيام عمل

---

### 🔴 2.3: تفعيل Email الفعلي - أولوية عالية

**الملف:** `server/notifications/channels/email.ts` (غير موجود - يجب إنشاؤه)

**المطلوب:**
1. اختيار مزود Email:
   - **SendGrid** (عالمي، سهل)
   - **AWS SES** (رخيص جداً، موثوق)
   - **Mailgun** (عالمي)
   - **SMTP العادي** (Gmail, Outlook)
2. إنشاء `server/notifications/channels/email.ts`:
   ```typescript
   class EmailChannel {
     private transporter: nodemailer.Transporter;
     
     constructor(config?: Partial<EmailConfig>) {
       this.config = {
         provider: process.env.EMAIL_PROVIDER || 'smtp',
         host: process.env.SMTP_HOST,
         port: parseInt(process.env.SMTP_PORT || '587'),
         secure: process.env.SMTP_SECURE === 'true',
         user: process.env.SMTP_USER,
         password: process.env.SMTP_PASSWORD,
         from: process.env.EMAIL_FROM,
         ...config,
       };
       
       if (this.config.provider === 'smtp') {
         this.transporter = nodemailer.createTransport({
           host: this.config.host,
           port: this.config.port,
           secure: this.config.secure,
           auth: {
             user: this.config.user,
             pass: this.config.password,
           },
         });
       }
     }
     
     async send(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
       try {
         const html = this.formatEmailHTML(notification);
         const result = await this.transporter.sendMail({
           from: this.config.from,
           to: recipient.email,
           subject: notification.title,
           html: html,
         });
         return { success: true, messageId: result.messageId };
       } catch (error: any) {
         logger.error('Email send failed', { error: error.message });
         return { success: false, error: error.message };
       }
     }
     
     async sendInvoice(invoiceId: number, recipient: NotificationRecipient): Promise<NotificationResult> {
       const pdfPath = await generateInvoicePDF(invoiceId);
       const result = await this.transporter.sendMail({
         from: this.config.from,
         to: recipient.email,
         subject: 'فاتورة جديدة',
         html: '<p>تجدون الفاتورة في المرفقات</p>',
         attachments: [{
           filename: `invoice-${invoiceId}.pdf`,
           path: pdfPath
         }]
       });
       return { success: true, messageId: result.messageId };
     }
   }
   ```
3. إضافة متغيرات بيئة
4. تثبيت `npm install nodemailer @types/nodemailer`
5. إنشاء قوالب Email احترافية (HTML templates)
6. إضافة جدول `email_logs`

**التكلفة المتوقعة:** مجاني-0.001 ريال لكل email  
**المدة المتوقعة:** 2-3 أيام عمل

---

### 🔴 2.4: تفعيل إرسال الفاتورة تلقائياً - أولوية عالية جداً

**الملف:** `server/messagingRouter.ts` (السطر 195-224)

**الكود الحالي:**
```typescript
// TODO: تنفيذ منطق إرسال الفاتورة
// هذا يحتاج:
// 1. جلب بيانات الفاتورة والعميل
// 2. جلب القالب (أو استخدام الافتراضي)
// 3. ملء القالب بالبيانات
// 4. إرسال الرسالة عبر المزود
// 5. حفظ سجل الرسالة

return { success: true, message: "تم إرسال الفاتورة بنجاح" };
```

**المطلوب:**
1. إنشاء `server/services/invoice-notification-service.ts`:
   ```typescript
   export class InvoiceNotificationService {
     async sendInvoice(invoiceId: number) {
       // 1. جلب الفاتورة
       const invoice = await db.query.invoicesEnhanced.findFirst({
         where: eq(invoicesEnhanced.id, invoiceId),
         with: { customer: true }
       });
       
       // 2. جلب العميل
       const customer = invoice.customer;
       
       // 3. توليد PDF
       const pdfPath = await this.generateInvoicePDF(invoice);
       
       // 4. إرسال عبر جميع القنوات
       const results = await Promise.all([
         // SMS
         smsChannel.send({
           type: 'invoice',
           title: 'فاتورة جديدة',
           body: `فاتورة رقم ${invoice.invoiceNumber} بمبلغ ${invoice.totalAmount} ريال`
         }, { phone: customer.phone }),
         
         // WhatsApp
         whatsappChannel.sendInvoice(invoiceId, { phone: customer.whatsappNumber }),
         
         // Email
         emailChannel.sendInvoice(invoiceId, { email: customer.email })
       ]);
       
       // 5. تسجيل الإرسال
       await db.insert(invoiceNotifications).values({
         invoiceId,
         customerId: customer.id,
         channels: ['sms', 'whatsapp', 'email'],
         status: 'sent',
         sentAt: new Date()
       });
       
       return { success: true, results };
     }
   }
   ```
2. استدعاء `InvoiceNotificationService.sendInvoice()` تلقائياً بعد إنشاء الفاتورة:
   ```typescript
   // في billingRouter.ts - بعد إنشاء الفاتورة
   await InvoiceNotificationService.sendInvoice(newInvoice.id);
   ```
3. إنشاء جدول `invoice_notifications`:
   ```typescript
   {
     id, invoice_id, customer_id, channels (JSON),
     sms_status, whatsapp_status, email_status,
     sent_at, created_at
   }
   ```

**المدة المتوقعة:** 2-3 أيام عمل (بعد تفعيل SMS/WhatsApp/Email)

---

### 🔴 2.5: تفعيل إرسال التذكيرات - أولوية عالية جداً

**الملف:** `server/messagingRouter.ts` (السطر 226-255)

**الكود الحالي:**
```typescript
// TODO: تنفيذ منطق إرسال التذكير
// مشابه لإرسال الفاتورة
```

**المطلوب:**
- مشابه لـ 2.4 لكن للتذكيرات
- إضافة جدول `payment_reminders`
- ربطه بـ Cron Job (1.6)

**المدة المتوقعة:** 1-2 يوم عمل

---

### 🔴 2.6: تفعيل إرسال تأكيد الدفع - أولوية عالية

**الملف:** `server/messagingRouter.ts` (السطر 257-285)

**الكود الحالي:**
```typescript
// TODO: تنفيذ منطق إرسال تأكيد الدفع
```

**المطلوب:**
- مشابه لـ 2.4 لكن لتأكيد الدفع
- إرسال فوري بعد نجاح الدفع
- تضمين: رقم الإيصال، المبلغ، التاريخ، رصيد العميل

**المدة المتوقعة:** 1-2 يوم عمل

---

### 🔴 2.7: بناء نظام إعادة المحاولة (Retry Queue) - أولوية عالية

**المطلوب:**
1. إنشاء جدول `notification_queue`:
   ```typescript
   {
     id, notification_type, recipient, channel, message,
     status (pending, sending, sent, failed),
     retry_count, max_retries (default 3),
     next_retry_at, error, created_at, updated_at
   }
   ```
2. عند فشل الإرسال → حفظ في `notification_queue`
3. Cron Job كل ساعة:
   ```typescript
   this.scheduleJob("retry-notifications", "0 * * * *", async () => {
     const pendingNotifications = await db.query.notificationQueue.findMany({
       where: and(
         eq(notificationQueue.status, 'pending'),
         lt(notificationQueue.nextRetryAt, new Date())
       )
     });
     
     for (const notification of pendingNotifications) {
       try {
         await sendNotification(notification);
         await db.update(notificationQueue)
           .set({ status: 'sent', sentAt: new Date() })
           .where(eq(notificationQueue.id, notification.id));
       } catch (error) {
         if (notification.retryCount >= notification.maxRetries) {
           // بعد 3 محاولات → failed
           await db.update(notificationQueue)
             .set({ status: 'failed', error: error.message })
             .where(eq(notificationQueue.id, notification.id));
         } else {
           // إعادة جدولة مع exponential backoff
           const nextRetry = new Date(Date.now() + (2 ** notification.retryCount) * 60 * 60 * 1000);
           await db.update(notificationQueue)
             .set({ 
               retryCount: notification.retryCount + 1,
               nextRetryAt: nextRetry
             })
             .where(eq(notificationQueue.id, notification.id));
         }
       }
     }
   });
   ```
4. لوحة تحكم لمراقبة queue

**المدة المتوقعة:** 2-3 أيام عمل

---

### 🟡 2.8: إنشاء قوالب الرسائل (Message Templates) - أولوية متوسطة

**المطلوب:**
1. إنشاء جدول `message_templates`:
   ```typescript
   {
     id, business_id, type (invoice, reminder, payment_confirmation),
     channel (sms, whatsapp, email),
     subject, body (مع placeholders: {{invoiceNumber}}, {{amount}}),
     is_default, is_active, created_at, updated_at
   }
   ```
2. واجهة لإدارة القوالب
3. دعم placeholders ديناميكية
4. دعم لغات متعددة (عربي/إنجليزي)

**المدة المتوقعة:** 2-3 أيام عمل

---

# 🔴 القسم 3: ACREL IoT Integration (التكامل الحرج) - 30+ مهمة

## الوصف:
جميع وظائف `acrel-service.ts` موجودة لكن **TODO - لا تحفظ في قاعدة البيانات**.

---

### 🔴 3.1: حفظ القراءات في قاعدة البيانات - أولوية عالية جداً

**الملفات:**
- `server/developer/integrations/acrel-service.ts` (11 موقع TODO لحفظ القراءات)

**TODO Locations:**
- السطر 130: `// TODO: حفظ في جدول meter_readings_enhanced`
- السطر 156: `// TODO: حفظ القراءات في قاعدة البيانات`
- السطر 230: `// TODO: حفظ في قاعدة البيانات (جدول acrel_command_logs)`
- السطر 287: `// TODO: حفظ في قاعدة البيانات وتحديث حالة العداد`
- السطر 338: `// TODO: حفظ في قاعدة البيانات وتحديث التعرفة`
- السطر 397: `// TODO: تحديث معلومات العداد في قاعدة البيانات`
- السطر 444: `// TODO: تحديث معلومات العداد في قاعدة البيانات`
- السطر 493: `// TODO: حفظ معلومات محولات التيار في قاعدة البيانات`
- السطر 567: `// TODO: تحديث نوع الدفع في قاعدة البيانات`
- السطر 604: `// TODO: تحديث نوع الدفع في قاعدة البيانات`
- السطر 641: `// TODO: تحديث الرصيد في قاعدة البيانات`
- السطر 714: `// TODO: حفظ حد الائتمان في قاعدة البيانات`
- السطر 789: `// TODO: حفظ جدول التعرفات في قاعدة البيانات`

**المطلوب:**
1. استبدال كل `// TODO:` بكود فعلي لحفظ البيانات
2. مثال: حفظ القراءات:
   ```typescript
   async getMeterReading(meterId: string): Promise<AcrelMeterReading> {
     try {
       // ... جلب القراءة من API
       
       // حفظ القراءة في قاعدة البيانات
       const db = await getDb();
       await db.insert(meterReadingsEnhanced).values({
         meterId: parseInt(meterId),
         currentReading: reading.totalActiveEnergy,
         voltage: reading.voltage,
         current: reading.current,
         powerFactor: reading.powerFactor,
         frequency: reading.frequency,
         readingDate: new Date(),
         readingType: 'automatic',
         source: 'acrel_iot',
         status: 'approved',
         rawData: JSON.stringify(reading)
       });
       
       return reading;
     } catch (error) {
       logger.error("Failed to get reading from ACREL", { error });
       throw error;
     }
   }
   ```
3. إنشاء جدول `acrel_command_logs`:
   ```typescript
   {
     id, business_id, meter_id, command_type,
     parameters (JSON), response (JSON), status,
     executed_by, executed_at, created_at
   }
   ```
4. تحديث جدول `metersEnhanced` عند تغيير حالة العداد

**المدة المتوقعة:** 5-7 أيام عمل

---

### 🔴 3.2: إنشاء ACREL Router في developer.integrations - أولوية عالية

**المطلوب:**
1. `acrelService` موجود لكن لا يوجد router للوصول من Frontend
2. إنشاء `server/developer/acrelRouter.ts` أو إضافة إلى `routers.ts`:
   ```typescript
   // في routers.ts - developer.integrations
   acrel: router({
     // قراءة
     getMeterReading: protectedProcedure
       .input(z.object({ meterId: z.string() }))
       .query(async ({ input }) => {
         return await acrelService.getMeterReading(input.meterId);
       }),
     
     getMonitoringReadings: protectedProcedure
       .input(z.object({ deviceId: z.string() }))
       .query(async ({ input }) => {
         return await acrelService.getMonitoringReadings(input.deviceId);
       }),
     
     // تحكم
     disconnectMeter: protectedProcedure
       .input(z.object({ meterId: z.string(), reason: z.string() }))
       .mutation(async ({ input }) => {
         return await acrelService.disconnectMeter(input.meterId, input.reason);
       }),
     
     reconnectMeter: protectedProcedure
       .input(z.object({ meterId: z.string() }))
       .mutation(async ({ input }) => {
         return await acrelService.reconnectMeter(input.meterId);
       }),
     
     setTariff: protectedProcedure
       .input(z.object({ meterId: z.string(), tariffId: z.number() }))
       .mutation(async ({ input }) => {
         return await acrelService.setTariff(input.meterId, input.tariffId);
       }),
     
     setMonthlyQuota: protectedProcedure
       .input(z.object({ meterId: z.string(), quota: z.number() }))
       .mutation(async ({ input }) => {
         return await acrelService.setMonthlyQuota(input.meterId, input.quota);
       }),
     
     // ... باقي الوظائف
   })
   ```
3. إنشاء صفحات Frontend:
   - `client/src/pages/acrel/AcrelDashboard.tsx` - لوحة تحكم ACREL
   - `client/src/pages/acrel/AcrelMeters.tsx` - قائمة العدادات IoT (موجود)
   - `client/src/pages/acrel/AcrelCommands.tsx` - إرسال أوامر
   - `client/src/pages/acrel/AcrelHistory.tsx` - سجل الأوامر والقراءات

**المدة المتوقعة:** 3-4 أيام عمل

---

### 🟡 3.3-3.30: باقي مهام ACREL

**المطلوب:**
- ربط ACREL مع نظام SCADA (عرض البيانات الحية)
- ربط ACREL مع نظام الفوترة (القراءات التلقائية)
- ربط ACREL مع نظام الدعم (الحصص الشهرية)
- Webhooks من ACREL (إشعارات الانقطاع، التجاوز، إلخ)

**المدة المتوقعة:** 10-15 يوم عمل (مجموع)

---

# 🔴 القسم 4: STS Integration (التكامل الحرج) - 25+ مهمة

## الوصف:
مشابه لـ ACREL - جميع وظائف `sts-service.ts` **TODO - لا تحفظ في قاعدة البيانات**.

---

### 🔴 4.1: حفظ بيانات STS في قاعدة البيانات - أولوية عالية جداً

**الملفات:**
- `server/developer/integrations/sts-service.ts` (12 موقع TODO)

**TODO Locations:**
- السطر 75: `// TODO: الحصول على معرف العداد في STS من حقل في قاعدة البيانات`
- السطر 91-92: `// TODO: حفظ طلب الشحن في قاعدة البيانات` + `// TODO: استبدال بـ ID من قاعدة البيانات`
- السطر 109: `// TODO: حفظ في قاعدة البيانات (جدول sts_command_logs)`
- السطر 151: `// TODO: حفظ القراءة في قاعدة البيانات`
- السطر 290: `// TODO: حفظ في قاعدة البيانات`
- السطر 345: `// TODO: حفظ في قاعدة البيانات وتحديث حالة العداد`
- السطر 395: `// TODO: حفظ في قاعدة البيانات وتحديث حالة العداد`
- السطر 446: `// TODO: حفظ في قاعدة البيانات`
- السطر 498: `// TODO: حفظ في قاعدة البيانات`
- السطر 549: `// TODO: حفظ في قاعدة البيانات`
- السطر 599: `// TODO: حفظ في قاعدة البيانات`

**المطلوب:**
- مشابه لـ ACREL (3.1)
- جداول: `sts_charge_requests`, `sts_tokens`, `sts_command_logs`

**المدة المتوقعة:** 4-6 أيام عمل

---

### 🔴 4.2: إكمال التحقق من الدفع في STS - أولوية عالية جداً

**الملف:** `server/stsRouter.ts` (السطر 370-376)

**الكود الحالي:**
```typescript
// TODO: التحقق من الدفع من بوابة الدفع
// حالياً نعتبر أن الدفع تم إذا كان هناك paymentReference
const paymentVerified = !!paymentReference;
```

**المطلوب:**
- ربط فعلي مع بوابة الدفع
- إذا كانت طريقة الدفع = `card` → استدعاء بوابة الدفع
- إذا كانت = `bank_transfer` → الانتظار حتى التحقق اليدوي
- فقط بعد `paymentVerified === true` → استدعاء STS API

**المدة المتوقعة:** 2-3 أيام عمل

---

### 🔴 4.3: إكمال اختبار الاتصال مع STS API - أولوية عالية

**الملف:** `server/stsRouter.ts` (السطر 683-727)

**الكود الحالي:**
```typescript
// TODO: تنفيذ اختبار الاتصال الفعلي مع API مقدم الخدمة
```

**المطلوب:**
- استدعاء `stsApiClient.testConnection()`
- التحقق من الرد
- تحديث حالة الاتصال في قاعدة البيانات
- إشعار المسؤول عند فشل الاتصال

**المدة المتوقعة:** 1-2 يوم عمل

---

### 🔴 4.4-4.25: باقي مهام STS

- التحقق من حالة الشحن من API
- مزامنة العدادات من API
- الحصول على الحالة الفعلية للعداد
- إلغاء الشحن
- إرسال التوكن عبر SMS/Email

**المدة المتوقعة:** 8-12 يوم عمل (مجموع)

---

# 🔴 القسم 5: Payment Gateways (بوابات الدفع) - 10 مهام

---

### 🔴 5.1: إكمال التكامل الفعلي مع بوابات الدفع - أولوية عالية جداً

**الملف:** `server/paymentGatewaysRouter.ts`

**TODO Locations:**
- السطر 140: `// TODO: تنفيذ اختبار الاتصال الفعلي مع بوابة الدفع`
- السطر 207: `// TODO: استدعاء API بوابة الدفع لإنشاء المعاملة`
- السطر 463: `// TODO: تنفيذ استدعاء API فعلي حسب نوع البوابة`

**المطلوب:**
1. إنشاء `server/services/payment-gateways/moyasar.ts`:
   ```typescript
   export class MoyasarGateway {
     async createTransaction(amount: number, customer: any) {
       const response = await axios.post('https://api.moyasar.com/v1/payments', {
         amount: amount * 100, // تحويل إلى هللة
         currency: 'SAR',
         description: `Payment for invoice #${invoiceId}`,
         callback_url: `${process.env.APP_URL}/api/webhooks/moyasar`,
         source: {
           type: 'creditcard',
           name: customer.name,
           number: 'XXXX',  // من Frontend
           cvc: 'XXX',
           month: 'XX',
           year: 'XXXX'
         }
       }, {
         auth: {
           username: process.env.MOYASAR_API_KEY,
           password: ''
         }
       });
       
       return {
         gatewayTransactionId: response.data.id,
         status: response.data.status,
         paymentUrl: response.data.source.transaction_url
       };
     }
   }
   ```
2. إنشاء `server/services/payment-gateways/sadad.ts` (مشابه)
3. استبدال TODO بالكود الفعلي
4. معالجة webhooks (السطر 600: `// TODO: تنفيذ التحقق الفعلي باستخدام HMAC SHA256`)

**المدة المتوقعة:** 5-7 أيام عمل

---

### 🔴 5.2: تفعيل التحقق من توقيع Webhooks - أولوية عالية

**الملفات:**
- `server/webhooks/payment-webhooks.ts` (السطر 241, 259)
- `server/paymentGatewaysRouter.ts` (السطر 600)

**الكود الحالي:**
```typescript
// TODO: تنفيذ التحقق الفعلي باستخدام HMAC SHA256
return true; // تجاهل التحقق في بيئة التطوير
```

**المطلوب:**
```typescript
function verifyMoyasarSignature(payload: string, signature: string): boolean {
  const secret = process.env.MOYASAR_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

**المدة المتوقعة:** 1 يوم عمل

---

### 🟡 5.3-5.10: باقي مهام بوابات الدفع

- واجهات Frontend لإدخال بيانات البطاقة
- دعم Apple Pay / Google Pay / STC Pay
- معالجة 3D Secure
- إدارة الاشتراكات المتكررة

**المدة المتوقعة:** 5-8 أيام عمل (مجموع)

---

# 🟡 القسم 6: Business Context (سياق العمل) - 25 مهمة

## الوصف:
كل صفحات Frontend تستخدم `businessId = 1` hardcoded.

---

### 🟡 6.1: إنشاء Business Context Provider - أولوية متوسطة

**المطلوب:**
1. إنشاء `client/src/contexts/BusinessContext.tsx`:
   ```typescript
   interface BusinessContextType {
     currentBusiness: Business | null;
     currentStation: Station | null;
     currentBranch: Branch | null;
     switchBusiness: (businessId: number) => void;
     switchStation: (stationId: number) => void;
     switchBranch: (branchId: number) => void;
   }
   
   export const BusinessProvider = ({ children }: { children: React.ReactNode }) => {
     const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
     const [currentStation, setCurrentStation] = useState<Station | null>(null);
     const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
     
     // جلب من localStorage أو من user session
     useEffect(() => {
       const storedBusinessId = localStorage.getItem('currentBusinessId');
       if (storedBusinessId) {
         fetchBusiness(parseInt(storedBusinessId));
       }
     }, []);
     
     return (
       <BusinessContext.Provider value={{ 
         currentBusiness, 
         currentStation, 
         currentBranch,
         switchBusiness,
         switchStation,
         switchBranch
       }}>
         {children}
       </BusinessContext.Provider>
     );
   };
   
   export const useBusinessContext = () => useContext(BusinessContext);
   ```
2. استبدال جميع `businessId = 1` بـ:
   ```typescript
   const { currentBusiness } = useBusinessContext();
   const businessId = currentBusiness?.id!;
   ```
3. إضافة Business Switcher في Header/Sidebar:
   ```tsx
   <Select value={currentBusiness?.id} onChange={switchBusiness}>
     {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
   </Select>
   ```

**الملفات المتأثرة:** 25 ملف (حسب TODO comments في client)

**المدة المتوقعة:** 3-4 أيام عمل

---

# 🔴 القسم 7: Mobile Apps (التطبيقات الجوالة) - 100+ مهمة

## الوصف:
يوجد هيكل `mobileApps` (جداول + APIs) لكن **لا يوجد تطبيق جوال فعلي**.

---

### 🔴 7.1: بناء تطبيق قراءة العدادات (Meter Reading App) - أولوية عالية جداً

**المطلوب:**
1. إنشاء مشروع React Native:
   ```bash
   npx react-native init MeterReadingApp --template react-native-template-typescript
   ```
2. الشاشات (10 شاشات):
   - Login Screen
   - Dashboard (المهام اليوم)
   - Reading Route List (قائمة العدادات المطلوبة)
   - Reading Entry Screen (إدخال القراءة + صورة + GPS)
   - Readings History
   - Sync Screen (مزامنة مع Server)
   - Profile & Settings
   - Map View (خريطة العدادات)
   - Offline Mode Support
   - Camera & Barcode Scanner

3. الميزات:
   - Offline-first (حفظ محلي في SQLite)
   - GPS tracking (تسجيل موقع كل قراءة)
   - Camera (التقاط صورة العداد)
   - Barcode Scanner (مسح رقم العداد)
   - Push Notifications (مهام جديدة)

**التقنيات:**
- React Native
- React Navigation
- Redux Toolkit / Zustand
- SQLite (التخزين المحلي)
- React Native Camera
- React Native Maps
- React Native Geolocation

**المدة المتوقعة:** 4-6 أسابيع

---

### 🔴 7.2: بناء تطبيق الموظف الميداني (Field Worker App) - أولوية عالية جداً

**المطلوب:**
- مشابه لـ 7.1 لكن مع ميزات أكثر (التركيب، الصيانة، التحصيل)
- 20+ شاشة
- GPS Tracking مستمر
- التقاط 9 أنواع صور
- توقيع العميل

**المدة المتوقعة:** 6-8 أسابيع

---

### 🔴 7.3: بناء تطبيق العملاء (Customer App) - أولوية عالية

**المطلوب:**
- 15 شاشة
- الفواتير والدفع
- مراقبة الاستهلاك (لعدادات IoT)
- شحن STS
- طلبات الخدمة
- إشعارات

**المدة المتوقعة:** 3-4 أسابيع

---

# 🟡 القسم 8: Accounting (المحاسبة) - 20 مهمة

---

### 🔴 8.1: إنشاء حسابات محاسبية افتراضية - أولوية عالية جداً

**المطلوب:**
- إنشاء `server/seed-accounts.ts`
- حسابات افتراضية لكل business جديد:
  - 1100 - النقدية
  - 1110 - البنك العام
  - 1200 - العملاء
  - 4100 - إيرادات الكهرباء
  - 4101 - إيراد الدفع المسبق
  - 2100 - الموردين
  - 5100 - المصروفات العامة
  - ... إلخ

**المدة المتوقعة:** 2-3 أيام عمل

---

### 🔴 8.2: بناء شاشة مطابقة الإيداعات البنكية - أولوية عالية جداً

**المطلوب:**
- `client/src/pages/accounting/BankReconciliation.tsx`
- عمودان: إيداعات بنكية غير مطابقة + فواتير مفتوحة
- Drag & Drop للمطابقة
- إنشاء قيد تلقائي

**المدة المتوقعة:** 3-4 أيام عمل

---

### 🟡 8.3-8.20: باقي مهام المحاسبة

- تحسين معالجة الرسوم والضرائب في القيود
- فلترة متقدمة في واجهة القيود
- تصدير القيود (Excel, PDF)
- تقرير يومي للقيود
- تقرير ميزان المراجعة
- تقرير الأرباح والخسائر
- تقرير المركز المالي

**المدة المتوقعة:** 10-15 يوم عمل (مجموع)

---

# 🟢 القسم 9: SCADA & IoT (المراقبة والتحكم) - 30 مهمة

---

### 🟢 9.1: بناء لوحة SCADA الحية - أولوية متوسطة

**المطلوب:**
- `client/src/pages/scada/LiveDashboard.tsx`
- عرض البيانات الحية من ACREL
- رسوم بيانية (Charts)
- تنبيهات (Alerts)
- تحكم عن بُعد

**المدة المتوقعة:** 5-7 أيام عمل

---

### 🟢 9.2-9.30: باقي مهام SCADA

- تكامل مع DeepSea/ComAp (مولدات)
- تكامل مع أجهزة SCADA الأخرى
- Webhooks من الأجهزة
- سجل الأحداث
- تقارير الطاقة

**المدة المتوقعة:** 15-20 يوم عمل (مجموع)

---

# 🟢 القسم 10: GIS (نظام المعلومات الجغرافية) - 25 مهمة

---

### 🟢 10.1: بناء خريطة المشتركين - أولوية منخفضة

**المطلوب:**
- `client/src/pages/gis/GISView.tsx`
- عرض جميع المشتركين على الخريطة
- عرض جميع الطبلونات
- رسم خطوط الربط

**المدة المتوقعة:** 3-4 أيام عمل

---

### 🔵 10.2-10.25: باقي مهام GIS

- أداة تخطيط الشبكة الذكية
- إضافة طبلونات جديدة
- Drag & Drop للربط
- حساب المسافات

**المدة المتوقعة:** 10-15 يوم عمل (مجموع)

---

# 🟢 القسم 11: Wizards (المعالجات التفاعلية) - 50 مهمة

---

### 🟢 11.1: Wizard استبدال عداد تالف - أولوية متوسطة

**الملف:** `client/src/pages/wizards/MeterReplacementWizard.tsx` (موجود لكن يحتاج تحسين)

**المطلوب:**
1. حساب الاستهلاك التقديري للفترة الانتقالية
2. إنشاء فاتورة آلية
3. تحديث السجل المحاسبي
4. إرسال إشعارات

**المدة المتوقعة:** 2-3 أيام عمل

---

### 🟢 11.2-11.10: باقي Wizards

- Wizard الترقية من تقليدي إلى STS
- Wizard الترقية من STS إلى IoT
- Wizard تركيب عداد جديد
- Wizard طلب خدمة جديد
- Wizard إنشاء مشروع
- Wizard إغلاق مشروع
- Wizard إنشاء خطة صيانة وقائية
- Wizard التحصيل الميداني
- Wizard المطابقة البنكية

**المدة المتوقعة:** 15-20 يوم عمل (مجموع)

---

# 🟡 القسم 12: Reports (التقارير) - 100+ مهمة

---

### 🟡 12.1-12.100: جميع التقارير المطلوبة

**التقارير المالية:**
- تقرير ميزان المراجعة
- تقرير الأرباح والخسائر
- تقرير المركز المالي
- تقرير التدفقات النقدية
- تقرير الحسابات الدائنة/المدينة
- تقرير الأصول
- تقرير الإهلاكات

**تقارير الفوترة:**
- تقرير الفواتير الشهري
- تقرير الديون المتأخرة
- تقرير التحصيل اليومي
- تقرير المبيعات
- تقرير الاستهلاك

**تقارير الصيانة:**
- تقرير أوامر العمل
- تقرير الأصول والمعدات
- تقرير الصيانة الوقائية
- تقرير المواد المستخدمة

**تقارير الموارد البشرية:**
- تقرير الحضور والانصراف
- تقرير الرواتب
- تقرير الإجازات
- تقرير العمل الإضافي

**المدة المتوقعة:** 30-40 يوم عمل (مجموع)

---

# 🟢 القسم 13: الأنظمة الأخرى - 500+ مهمة

## يشمل:
- نظام الأصول المتقدم
- نظام الصيانة الوقائية
- نظام المشاريع المتكامل
- نظام المخزون المتقدم
- نظام المشتريات
- كتالوج الخدمات
- نظام التتبع (GPS)
- نظام البصمة
- نظام المحادثات
- نظام الإشعارات المتقدم

**المدة المتوقعة:** 3-6 أشهر (مجموع)

---

# 📊 ملخص التقديرات:

| القسم | عدد المهام | الأولوية | المدة المتوقعة |
|-------|------------|----------|----------------|
| 1. Cron Jobs | 15 | 🔴 عالية جداً | 2-3 أسابيع |
| 2. SMS/WhatsApp/Email | 8 | 🔴 عالية جداً | 2-3 أسابيع |
| 3. ACREL IoT | 30 | 🔴 عالية جداً | 3-4 أسابيع |
| 4. STS | 25 | 🔴 عالية جداً | 2-3 أسابيع |
| 5. Payment Gateways | 10 | 🔴 عالية جداً | 1-2 أسبوع |
| 6. Business Context | 25 | 🟡 عالية | 1 أسبوع |
| 7. Mobile Apps | 100 | 🔴 عالية جداً | 3-4 أشهر |
| 8. Accounting | 20 | 🟡 عالية | 2-3 أسابيع |
| 9. SCADA & IoT | 30 | 🟢 متوسطة | 3-4 أسابيع |
| 10. GIS | 25 | 🔵 منخفضة | 2-3 أسابيع |
| 11. Wizards | 50 | 🟢 متوسطة | 3-4 أسابيع |
| 12. Reports | 100 | 🟡 عالية | 6-8 أسابيع |
| 13. أنظمة أخرى | 500+ | 🟢 متوسطة | 3-6 أشهر |
| **المجموع** | **~2000** | - | **~12-18 شهر** |

---

# 🎯 خطة التنفيذ المقترحة:

## المرحلة 1 (3 أشهر) - الأساسيات الحرجة:
1. ✅ SMS/WhatsApp/Email (2-3 أسابيع)
2. ✅ Cron Jobs (2-3 أسابيع)
3. ✅ Payment Gateways (1-2 أسبوع)
4. ✅ Business Context (1 أسبوع)
5. ✅ Accounting Essentials (2-3 أسابيع)

## المرحلة 2 (4 أشهر) - التكاملات:
1. ✅ ACREL IoT (3-4 أسابيع)
2. ✅ STS (2-3 أسابيع)
3. ✅ Mobile Apps (3-4 أشهر)

## المرحلة 3 (3 أشهر) - التحسينات:
1. ✅ Reports (6-8 أسابيع)
2. ✅ Wizards (3-4 أسابيع)
3. ✅ SCADA & IoT (3-4 أسابيع)

## المرحلة 4 (6 أشهر) - الأنظمة المتقدمة:
1. ✅ GIS (2-3 أسابيع)
2. ✅ أنظمة أخرى (5+ أشهر)

---

**آخر تحديث:** 2026-01-08  
**الإجمالي:** ~2000 مهمة  
**المدة الكلية المتوقعة:** 12-18 شهر  
**الفريق المطلوب:** 3-5 مطورين + 1 مدير مشروع
