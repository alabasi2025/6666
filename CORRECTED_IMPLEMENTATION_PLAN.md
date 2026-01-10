# 🔧 الخطة المُصححة للتنفيذ
## Corrected Implementation Plan

**تاريخ:** 2026-01-08  
**القاعدة الذهبية:** جميع التكاملات الخارجية عبر **نظام المطور (Developer System)**

---

## 📐 الهيكل الصحيح:

### ✅ القاعدة الأساسية:
```
جميع التكاملات الخارجية (Third-party Integrations) 
يجب أن تكون في: developer.integrations.*
```

### 🗂️ الهيكل الحالي:

```
server/
├── developer/
│   └── integrations/
│       ├── acrel-api-client.ts      ✅ موجود
│       ├── acrel-service.ts         ✅ موجود
│       ├── sts-api-client.ts        ✅ موجود
│       └── sts-service.ts           ✅ موجود
│
├── routers.ts                        ⚠️ يحتاج تحديث
│   └── developer: router({ ... })    ❌ غير موجود
│
├── stsRouter.ts                      ⚠️ يجب نقله إلى developer
├── paymentGatewaysRouter.ts          ⚠️ يجب نقله إلى developer
├── messagingRouter.ts                ⚠️ يجب نقله إلى developer
└── notifications/                    ⚠️ يجب نقلها إلى developer
    └── channels/
        ├── sms.ts                    ✅ موجود
        └── whatsapp.ts               ✅ موجود
```

---

## 🎯 الهيكل المطلوب:

```
server/
├── developer/
│   ├── developerRouter.ts            ❌ يجب إنشاؤه
│   │
│   └── integrations/
│       ├── acrel-api-client.ts       ✅ موجود
│       ├── acrel-service.ts          ✅ موجود
│       ├── sts-api-client.ts         ✅ موجود
│       ├── sts-service.ts            ✅ موجود
│       │
│       ├── payment-gateways/         ❌ يجب إنشاؤه
│       │   ├── moyasar.ts
│       │   ├── sadad.ts
│       │   └── index.ts
│       │
│       ├── messaging/                ❌ يجب إنشاؤه
│       │   ├── sms.ts                ← نقل من notifications/channels
│       │   ├── whatsapp.ts           ← نقل من notifications/channels
│       │   ├── email.ts              ❌ جديد
│       │   └── index.ts
│       │
│       └── external-apis/            ❌ يجب إنشاؤه (مستقبلاً)
│           ├── biometric.ts          (أجهزة البصمة)
│           ├── scada.ts              (DeepSea/ComAp)
│           └── index.ts
│
└── routers.ts
    └── developer: router({           ❌ يجب إضافته
          integrations: router({
            acrel: ...,
            sts: ...,
            paymentGateways: ...,
            messaging: ...
          })
        })
```

---

## 📋 الخطة المُصححة:

### المرحلة 1: إنشاء نظام المطور (Developer System)

#### ✅ المهمة 001: إنشاء Developer Router
**الملف:** `server/developer/developerRouter.ts` (جديد)

```typescript
import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

// Import integrations
import { acrelIntegrationRouter } from "./integrations/acrel-integration-router";
import { stsIntegrationRouter } from "./integrations/sts-integration-router";
import { messagingIntegrationRouter } from "./integrations/messaging-integration-router";
import { paymentGatewaysIntegrationRouter } from "./integrations/payment-gateways-integration-router";

export const developerRouter = router({
  integrations: router({
    acrel: acrelIntegrationRouter,
    sts: stsIntegrationRouter,
    messaging: messagingIntegrationRouter,
    paymentGateways: paymentGatewaysIntegrationRouter,
  }),
  
  // للمستقبل: أدوات المطور الأخرى
  tools: router({
    // Database tools, API testing, etc.
  }),
});
```

---

#### ✅ المهمة 002: إنشاء Messaging Integration Router
**الملف:** `server/developer/integrations/messaging-integration-router.ts` (جديد)

```typescript
import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { smsService } from "./messaging/sms";
import { whatsappService } from "./messaging/whatsapp";
import { emailService } from "./messaging/email";

export const messagingIntegrationRouter = router({
  // SMS
  sms: router({
    send: protectedProcedure
      .input(z.object({
        to: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await smsService.send(input.to, input.message);
      }),
    
    testConnection: protectedProcedure
      .query(async () => {
        return await smsService.testConnection();
      }),
  }),
  
  // WhatsApp
  whatsapp: router({
    send: protectedProcedure
      .input(z.object({
        to: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await whatsappService.send(input.to, input.message);
      }),
    
    sendWithMedia: protectedProcedure
      .input(z.object({
        to: z.string(),
        message: z.string(),
        mediaUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await whatsappService.sendWithMedia(input.to, input.message, input.mediaUrl);
      }),
  }),
  
  // Email
  email: router({
    send: protectedProcedure
      .input(z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        attachments: z.array(z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        return await emailService.send(input);
      }),
  }),
  
  // Unified Messaging (إرسال عبر جميع القنوات)
  sendAll: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      type: z.enum(['invoice', 'reminder', 'payment_confirmation']),
      data: z.any(),
    }))
    .mutation(async ({ input }) => {
      // إرسال عبر SMS + WhatsApp + Email
      const results = await Promise.all([
        smsService.sendInvoice(input.customerId, input.data),
        whatsappService.sendInvoice(input.customerId, input.data),
        emailService.sendInvoice(input.customerId, input.data),
      ]);
      return results;
    }),
});
```

---

#### ✅ المهمة 003: نقل وتحديث SMS Service
**الملف:** `server/developer/integrations/messaging/sms.ts` (نقل + تحديث)

```typescript
import { logger } from '../../../utils/logger';
import { getDb } from '../../../db';
import { messagingLogs } from '../../../../drizzle/schema';

interface SmsConfig {
  provider: 'twilio' | 'unifonic' | 'nexmo';
  apiKey: string;
  apiSecret: string;
  fromNumber: string;
}

class SmsService {
  private config: SmsConfig;
  private twilioClient: any;

  constructor() {
    this.config = {
      provider: (process.env.SMS_PROVIDER as any) || 'twilio',
      apiKey: process.env.SMS_API_KEY!,
      apiSecret: process.env.SMS_API_SECRET!,
      fromNumber: process.env.SMS_FROM_NUMBER!,
    };

    // Initialize Twilio
    if (this.config.provider === 'twilio' && this.config.apiKey && this.config.apiSecret) {
      const twilio = require('twilio');
      this.twilioClient = twilio(this.config.apiKey, this.config.apiSecret);
    }
  }

  async send(to: string, message: string): Promise<any> {
    try {
      if (!this.twilioClient) {
        logger.warn('SMS not configured - simulating send');
        return { success: true, simulated: true };
      }

      // إرسال فعلي عبر Twilio
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: to.startsWith('+') ? to : `+966${to}`,
      });

      // حفظ في قاعدة البيانات
      await this.logMessage({
        channel: 'sms',
        recipient: to,
        message,
        status: 'sent',
        messageId: result.sid,
        provider: this.config.provider,
      });

      logger.info('SMS sent successfully', { to, messageId: result.sid });
      return { success: true, messageId: result.sid };
    } catch (error: any) {
      logger.error('SMS send failed', { to, error: error.message });
      
      // حفظ الخطأ
      await this.logMessage({
        channel: 'sms',
        recipient: to,
        message,
        status: 'failed',
        error: error.message,
        provider: this.config.provider,
      });

      throw error;
    }
  }

  async testConnection(): Promise<any> {
    try {
      if (!this.twilioClient) {
        return { success: false, error: 'SMS not configured' };
      }

      // اختبار بسيط: محاولة جلب معلومات الحساب
      const account = await this.twilioClient.api.accounts(this.config.apiKey).fetch();
      return { success: true, accountSid: account.sid, status: account.status };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendInvoice(customerId: number, invoiceData: any): Promise<any> {
    // جلب بيانات العميل
    const db = await getDb();
    const customer = await db.query.customersEnhanced.findFirst({
      where: (customers, { eq }) => eq(customers.id, customerId),
    });

    if (!customer || !customer.phone) {
      throw new Error('Customer phone not found');
    }

    const message = `فاتورة رقم ${invoiceData.invoiceNumber} بمبلغ ${invoiceData.totalAmount} ريال. تاريخ الاستحقاق: ${invoiceData.dueDate}`;
    return await this.send(customer.phone, message);
  }

  private async logMessage(data: any): Promise<void> {
    try {
      const db = await getDb();
      await db.insert(messagingLogs).values({
        ...data,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log message', { error });
    }
  }
}

export const smsService = new SmsService();
```

---

#### ✅ المهمة 004: إنشاء جدول messaging_logs
**الملف:** `drizzle/schema.ts` (إضافة)

```typescript
// في قسم Developer/Integrations
export const messagingLogs = pgTable("messaging_logs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"),
  channel: varchar("channel", { length: 20 }).notNull(), // sms, whatsapp, email
  recipient: varchar("recipient", { length: 255 }).notNull(),
  message: text("message"),
  subject: varchar("subject", { length: 255 }), // للـ email
  status: varchar("status", { length: 20 }).notNull(), // sent, failed, pending, delivered
  messageId: varchar("message_id", { length: 255 }), // من المزود
  provider: varchar("provider", { length: 50 }), // twilio, unifonic, sendgrid
  cost: numeric("cost", { precision: 10, scale: 4 }), // التكلفة
  error: text("error"),
  metadata: jsonb("metadata"), // بيانات إضافية
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

#### ✅ المهمة 005: تحديث routers.ts
**الملف:** `server/routers.ts` (تحديث)

```typescript
// إضافة import
import { developerRouter } from "./developer/developerRouter";

// في appRouter
export const appRouter = router({
  system: systemRouter,
  auth: ...,
  
  // نظام المطور (Developer System)
  developer: developerRouter,  // ← إضافة هذا السطر
  
  // باقي الـ routers
  fieldOps: fieldOpsRouter,
  hr: hrRouter,
  // ...
});
```

---

### المرحلة 2: نقل التكاملات الموجودة

#### المهام 006-010: نقل وتحديث:
- ✅ **006:** نقل `stsRouter` → `developer.integrations.sts`
- ✅ **007:** نقل `paymentGatewaysRouter` → `developer.integrations.paymentGateways`
- ✅ **008:** نقل `messagingRouter` → `developer.integrations.messaging`
- ✅ **009:** تحديث `acrel` integration router
- ✅ **010:** تحديث جميع Frontend calls

---

## 🔄 الوصول من Frontend (بعد التصحيح):

### قبل (خطأ):
```typescript
// ❌ خطأ
const { data } = trpc.sts.charging.createCharge.useMutation();
const { data } = trpc.paymentGateways.list.useQuery();
const { data } = trpc.messaging.sendInvoice.useMutation();
```

### بعد (صحيح):
```typescript
// ✅ صحيح
const { data } = trpc.developer.integrations.sts.charging.createCharge.useMutation();
const { data } = trpc.developer.integrations.paymentGateways.list.useQuery();
const { data } = trpc.developer.integrations.messaging.sendInvoice.useMutation();
const { data } = trpc.developer.integrations.acrel.getMeterReading.useQuery();
```

---

## 📋 قائمة المهام المُصححة (001-050):

### نظام المطور (Developer System) - 50 مهمة

| # | المهمة | الحالة | الأولوية |
|---|--------|--------|----------|
| **001** | إنشاء `developerRouter.ts` | ❌ | 🔴 |
| **002** | إنشاء `messaging-integration-router.ts` | ❌ | 🔴 |
| **003** | نقل وتحديث `sms.ts` → `developer/integrations/messaging/` | ❌ | 🔴 |
| **004** | إنشاء جدول `messaging_logs` | ❌ | 🔴 |
| **005** | تحديث `routers.ts` لإضافة developer router | ❌ | 🔴 |
| **006** | نقل `whatsapp.ts` → `developer/integrations/messaging/` | ❌ | 🔴 |
| **007** | إنشاء `email.ts` في `developer/integrations/messaging/` | ❌ | 🔴 |
| **008** | إنشاء `payment-gateways-integration-router.ts` | ❌ | 🔴 |
| **009** | نقل `paymentGatewaysRouter` → developer | ❌ | 🔴 |
| **010** | إنشاء `moyasar.ts` في `payment-gateways/` | ❌ | 🔴 |
| **011** | إنشاء `sadad.ts` في `payment-gateways/` | ❌ | 🔴 |
| **012** | إنشاء `acrel-integration-router.ts` | ❌ | 🔴 |
| **013** | ربط `acrel-service` مع router | ❌ | 🔴 |
| **014** | إنشاء `sts-integration-router.ts` | ❌ | 🔴 |
| **015** | نقل `stsRouter` → developer | ❌ | 🔴 |
| **016-025** | تحديث Cron Jobs لاستخدام developer.integrations | ❌ | 🔴 |
| **026-035** | تحديث Frontend pages لاستخدام المسار الجديد | ❌ | 🔴 |
| **036-040** | اختبار جميع التكاملات | ❌ | 🔴 |
| **041-045** | توثيق نظام المطور | ❌ | 🟡 |
| **046-050** | إنشاء واجهة Developer Dashboard | ❌ | 🟢 |

---

## 🎯 الخطوة التالية:

**سأبدأ الآن بتنفيذ المهام 001-005 (إنشاء نظام المطور الأساسي)**

هل تريد المتابعة؟

---

**آخر تحديث:** 2026-01-08
