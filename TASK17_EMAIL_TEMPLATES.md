# 📋 المهمة 17: إنشاء قوالب البريد الإلكتروني

## 🎯 الهدف
إنشاء نظام قوالب بريد إلكتروني متكامل يدعم اللغة العربية والإنجليزية.

## 📁 الفرع
```
feature/task17-email-templates
```

## ⏱️ الوقت المتوقع
2-3 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/email-templates/
├── types.ts              # أنواع TypeScript
├── base-template.ts      # القالب الأساسي
├── templates/
│   ├── welcome.ts        # ترحيب
│   ├── password-reset.ts # إعادة تعيين كلمة المرور
│   ├── voucher-created.ts # سند جديد
│   ├── payment-received.ts # دفعة مستلمة
│   └── report-ready.ts   # تقرير جاهز
├── template-engine.ts    # محرك القوالب
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/*Router.ts`
- `server/notifications/**/*` - لتجنب التعارض مع المهمة 14
- `client/src/**/*`

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task17-email-templates
```

### الخطوة 2: إنشاء المجلدات
```bash
mkdir -p server/email-templates/templates
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/email-templates/types.ts

export type Language = 'ar' | 'en';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: Record<Language, string>;
  body: Record<Language, string>;
  variables: string[];
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailStyles {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl?: string;
  companyName?: string;
}

export const DEFAULT_STYLES: EmailStyles = {
  primaryColor: '#4472C4',
  secondaryColor: '#1a1a2e',
  backgroundColor: '#f5f5f5',
  textColor: '#333333',
  fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
  companyName: 'نظام إدارة الطاقة',
};
```

### الخطوة 4: إنشاء ملف base-template.ts
```typescript
// server/email-templates/base-template.ts

import { EmailStyles, DEFAULT_STYLES } from './types';

export function createBaseTemplate(
  content: string,
  styles: EmailStyles = DEFAULT_STYLES,
  isRtl: boolean = true
): string {
  const direction = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' : 'left';

  return `<!DOCTYPE html>
<html dir="${direction}" lang="${isRtl ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${styles.companyName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${styles.fontFamily};
      background-color: ${styles.backgroundColor};
      direction: ${direction};
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: ${styles.secondaryColor};
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
      text-align: ${textAlign};
      color: ${styles.textColor};
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: ${styles.primaryColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: ${styles.secondaryColor};
    }
    .footer {
      background-color: #f0f0f0;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 20px 0;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .info-box {
      background-color: #e7f3ff;
      padding: 15px;
      border-radius: 5px;
      border-right: 4px solid ${styles.primaryColor};
      margin: 15px 0;
    }
    table.data {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    table.data th, table.data td {
      padding: 10px;
      border: 1px solid #e0e0e0;
      text-align: ${textAlign};
    }
    table.data th {
      background-color: ${styles.primaryColor};
      color: #ffffff;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .content {
        padding: 15px !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${styles.logoUrl ? `<img src="${styles.logoUrl}" alt="Logo" class="logo">` : ''}
      <h1>${styles.companyName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${styles.companyName}. جميع الحقوق محفوظة.</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
    </div>
  </div>
</body>
</html>`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
```

### الخطوة 5: إنشاء ملف templates/welcome.ts
```typescript
// server/email-templates/templates/welcome.ts

import { EmailTemplate } from '../types';

export const WelcomeTemplate: EmailTemplate = {
  id: 'welcome',
  name: 'Welcome Email',
  subject: {
    ar: 'مرحباً بك في {{companyName}}',
    en: 'Welcome to {{companyName}}',
  },
  body: {
    ar: `
      <h2>مرحباً {{userName}}!</h2>
      <p>نحن سعداء بانضمامك إلى {{companyName}}.</p>
      <p>تم إنشاء حسابك بنجاح ويمكنك الآن البدء في استخدام النظام.</p>
      
      <div class="info-box">
        <strong>معلومات حسابك:</strong>
        <ul>
          <li>البريد الإلكتروني: {{email}}</li>
          <li>اسم المستخدم: {{username}}</li>
        </ul>
      </div>
      
      <p>للبدء، يرجى تسجيل الدخول باستخدام بيانات اعتمادك:</p>
      
      <p style="text-align: center;">
        <a href="{{loginUrl}}" class="button">تسجيل الدخول</a>
      </p>
      
      <div class="divider"></div>
      
      <p>إذا كانت لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم.</p>
      
      <p>مع أطيب التحيات،<br>فريق {{companyName}}</p>
    `,
    en: `
      <h2>Hello {{userName}}!</h2>
      <p>We're excited to have you join {{companyName}}.</p>
      <p>Your account has been created successfully and you can now start using the system.</p>
      
      <div class="info-box">
        <strong>Your Account Information:</strong>
        <ul>
          <li>Email: {{email}}</li>
          <li>Username: {{username}}</li>
        </ul>
      </div>
      
      <p>To get started, please log in using your credentials:</p>
      
      <p style="text-align: center;">
        <a href="{{loginUrl}}" class="button">Log In</a>
      </p>
      
      <div class="divider"></div>
      
      <p>If you have any questions, feel free to contact our support team.</p>
      
      <p>Best regards,<br>{{companyName}} Team</p>
    `,
  },
  variables: ['userName', 'companyName', 'email', 'username', 'loginUrl'],
};
```

### الخطوة 6: إنشاء ملف templates/password-reset.ts
```typescript
// server/email-templates/templates/password-reset.ts

import { EmailTemplate } from '../types';

export const PasswordResetTemplate: EmailTemplate = {
  id: 'password-reset',
  name: 'Password Reset',
  subject: {
    ar: 'طلب إعادة تعيين كلمة المرور',
    en: 'Password Reset Request',
  },
  body: {
    ar: `
      <h2>إعادة تعيين كلمة المرور</h2>
      <p>مرحباً {{userName}}،</p>
      <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
      
      <div class="highlight">
        <strong>⚠️ تنبيه:</strong> إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
      </div>
      
      <p>لإعادة تعيين كلمة المرور، انقر على الزر أدناه:</p>
      
      <p style="text-align: center;">
        <a href="{{resetUrl}}" class="button">إعادة تعيين كلمة المرور</a>
      </p>
      
      <div class="info-box">
        <p><strong>ملاحظة:</strong> هذا الرابط صالح لمدة {{expiresIn}} فقط.</p>
      </div>
      
      <p>إذا لم يعمل الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
      <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>
      
      <div class="divider"></div>
      
      <p>مع أطيب التحيات،<br>فريق {{companyName}}</p>
    `,
    en: `
      <h2>Password Reset</h2>
      <p>Hello {{userName}},</p>
      <p>We received a request to reset your account password.</p>
      
      <div class="highlight">
        <strong>⚠️ Warning:</strong> If you did not request a password reset, please ignore this email.
      </div>
      
      <p>To reset your password, click the button below:</p>
      
      <p style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </p>
      
      <div class="info-box">
        <p><strong>Note:</strong> This link is valid for {{expiresIn}} only.</p>
      </div>
      
      <p>If the button doesn't work, copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>
      
      <div class="divider"></div>
      
      <p>Best regards,<br>{{companyName}} Team</p>
    `,
  },
  variables: ['userName', 'resetUrl', 'expiresIn', 'companyName'],
};
```

### الخطوة 7: إنشاء ملف templates/voucher-created.ts
```typescript
// server/email-templates/templates/voucher-created.ts

import { EmailTemplate } from '../types';

export const VoucherCreatedTemplate: EmailTemplate = {
  id: 'voucher-created',
  name: 'Voucher Created',
  subject: {
    ar: 'سند جديد رقم #{{voucherNumber}}',
    en: 'New Voucher #{{voucherNumber}}',
  },
  body: {
    ar: `
      <h2>تم إنشاء سند جديد</h2>
      <p>مرحباً {{userName}}،</p>
      <p>تم إنشاء سند {{voucherType}} جديد بنجاح.</p>
      
      <table class="data">
        <tr>
          <th>رقم السند</th>
          <td>{{voucherNumber}}</td>
        </tr>
        <tr>
          <th>النوع</th>
          <td>{{voucherType}}</td>
        </tr>
        <tr>
          <th>التاريخ</th>
          <td>{{date}}</td>
        </tr>
        <tr>
          <th>الطرف</th>
          <td>{{partyName}}</td>
        </tr>
        <tr>
          <th>المبلغ</th>
          <td style="font-weight: bold; color: #4472C4;">{{amount}}</td>
        </tr>
        <tr>
          <th>الوصف</th>
          <td>{{description}}</td>
        </tr>
      </table>
      
      <p style="text-align: center;">
        <a href="{{voucherUrl}}" class="button">عرض السند</a>
      </p>
      
      <div class="divider"></div>
      
      <p>مع أطيب التحيات،<br>فريق {{companyName}}</p>
    `,
    en: `
      <h2>New Voucher Created</h2>
      <p>Hello {{userName}},</p>
      <p>A new {{voucherType}} voucher has been created successfully.</p>
      
      <table class="data">
        <tr>
          <th>Voucher Number</th>
          <td>{{voucherNumber}}</td>
        </tr>
        <tr>
          <th>Type</th>
          <td>{{voucherType}}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>{{date}}</td>
        </tr>
        <tr>
          <th>Party</th>
          <td>{{partyName}}</td>
        </tr>
        <tr>
          <th>Amount</th>
          <td style="font-weight: bold; color: #4472C4;">{{amount}}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td>{{description}}</td>
        </tr>
      </table>
      
      <p style="text-align: center;">
        <a href="{{voucherUrl}}" class="button">View Voucher</a>
      </p>
      
      <div class="divider"></div>
      
      <p>Best regards,<br>{{companyName}} Team</p>
    `,
  },
  variables: ['userName', 'voucherNumber', 'voucherType', 'date', 'partyName', 'amount', 'description', 'voucherUrl', 'companyName'],
};
```

### الخطوة 8: إنشاء ملف templates/payment-received.ts
```typescript
// server/email-templates/templates/payment-received.ts

import { EmailTemplate } from '../types';

export const PaymentReceivedTemplate: EmailTemplate = {
  id: 'payment-received',
  name: 'Payment Received',
  subject: {
    ar: 'تأكيد استلام دفعة بمبلغ {{amount}}',
    en: 'Payment Confirmation - {{amount}}',
  },
  body: {
    ar: `
      <h2>تأكيد استلام الدفعة</h2>
      <p>مرحباً {{userName}}،</p>
      <p>نؤكد لك استلام الدفعة بنجاح.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">تفاصيل الدفعة</h3>
        <table style="width: 100%;">
          <tr>
            <td><strong>رقم المرجع:</strong></td>
            <td>{{referenceNumber}}</td>
          </tr>
          <tr>
            <td><strong>المبلغ:</strong></td>
            <td style="font-size: 18px; color: #28a745;">{{amount}}</td>
          </tr>
          <tr>
            <td><strong>التاريخ:</strong></td>
            <td>{{date}}</td>
          </tr>
          <tr>
            <td><strong>طريقة الدفع:</strong></td>
            <td>{{paymentMethod}}</td>
          </tr>
        </table>
      </div>
      
      <p>شكراً لك على ثقتك بنا.</p>
      
      <p style="text-align: center;">
        <a href="{{receiptUrl}}" class="button">تحميل الإيصال</a>
      </p>
      
      <div class="divider"></div>
      
      <p>مع أطيب التحيات،<br>فريق {{companyName}}</p>
    `,
    en: `
      <h2>Payment Confirmation</h2>
      <p>Hello {{userName}},</p>
      <p>We confirm that your payment has been received successfully.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">Payment Details</h3>
        <table style="width: 100%;">
          <tr>
            <td><strong>Reference Number:</strong></td>
            <td>{{referenceNumber}}</td>
          </tr>
          <tr>
            <td><strong>Amount:</strong></td>
            <td style="font-size: 18px; color: #28a745;">{{amount}}</td>
          </tr>
          <tr>
            <td><strong>Date:</strong></td>
            <td>{{date}}</td>
          </tr>
          <tr>
            <td><strong>Payment Method:</strong></td>
            <td>{{paymentMethod}}</td>
          </tr>
        </table>
      </div>
      
      <p>Thank you for your trust in us.</p>
      
      <p style="text-align: center;">
        <a href="{{receiptUrl}}" class="button">Download Receipt</a>
      </p>
      
      <div class="divider"></div>
      
      <p>Best regards,<br>{{companyName}} Team</p>
    `,
  },
  variables: ['userName', 'referenceNumber', 'amount', 'date', 'paymentMethod', 'receiptUrl', 'companyName'],
};
```

### الخطوة 9: إنشاء ملف templates/report-ready.ts
```typescript
// server/email-templates/templates/report-ready.ts

import { EmailTemplate } from '../types';

export const ReportReadyTemplate: EmailTemplate = {
  id: 'report-ready',
  name: 'Report Ready',
  subject: {
    ar: 'التقرير جاهز: {{reportName}}',
    en: 'Report Ready: {{reportName}}',
  },
  body: {
    ar: `
      <h2>التقرير جاهز للتحميل</h2>
      <p>مرحباً {{userName}}،</p>
      <p>التقرير الذي طلبته جاهز الآن للتحميل.</p>
      
      <table class="data">
        <tr>
          <th>اسم التقرير</th>
          <td>{{reportName}}</td>
        </tr>
        <tr>
          <th>نوع التقرير</th>
          <td>{{reportType}}</td>
        </tr>
        <tr>
          <th>الفترة</th>
          <td>{{period}}</td>
        </tr>
        <tr>
          <th>تاريخ الإنشاء</th>
          <td>{{generatedAt}}</td>
        </tr>
        <tr>
          <th>حجم الملف</th>
          <td>{{fileSize}}</td>
        </tr>
      </table>
      
      <div class="highlight">
        <strong>ملاحظة:</strong> رابط التحميل صالح لمدة {{expiresIn}}.
      </div>
      
      <p style="text-align: center;">
        <a href="{{downloadUrl}}" class="button">تحميل التقرير</a>
      </p>
      
      <div class="divider"></div>
      
      <p>مع أطيب التحيات،<br>فريق {{companyName}}</p>
    `,
    en: `
      <h2>Report Ready for Download</h2>
      <p>Hello {{userName}},</p>
      <p>The report you requested is now ready for download.</p>
      
      <table class="data">
        <tr>
          <th>Report Name</th>
          <td>{{reportName}}</td>
        </tr>
        <tr>
          <th>Report Type</th>
          <td>{{reportType}}</td>
        </tr>
        <tr>
          <th>Period</th>
          <td>{{period}}</td>
        </tr>
        <tr>
          <th>Generated At</th>
          <td>{{generatedAt}}</td>
        </tr>
        <tr>
          <th>File Size</th>
          <td>{{fileSize}}</td>
        </tr>
      </table>
      
      <div class="highlight">
        <strong>Note:</strong> Download link is valid for {{expiresIn}}.
      </div>
      
      <p style="text-align: center;">
        <a href="{{downloadUrl}}" class="button">Download Report</a>
      </p>
      
      <div class="divider"></div>
      
      <p>Best regards,<br>{{companyName}} Team</p>
    `,
  },
  variables: ['userName', 'reportName', 'reportType', 'period', 'generatedAt', 'fileSize', 'downloadUrl', 'expiresIn', 'companyName'],
};
```

### الخطوة 10: إنشاء ملف template-engine.ts
```typescript
// server/email-templates/template-engine.ts

import { EmailTemplate, Language, RenderedEmail, EmailStyles, DEFAULT_STYLES } from './types';
import { createBaseTemplate, stripHtml } from './base-template';
import { WelcomeTemplate } from './templates/welcome';
import { PasswordResetTemplate } from './templates/password-reset';
import { VoucherCreatedTemplate } from './templates/voucher-created';
import { PaymentReceivedTemplate } from './templates/payment-received';
import { ReportReadyTemplate } from './templates/report-ready';

class TemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();
  private styles: EmailStyles = DEFAULT_STYLES;

  constructor() {
    // تسجيل القوالب الافتراضية
    this.registerTemplate(WelcomeTemplate);
    this.registerTemplate(PasswordResetTemplate);
    this.registerTemplate(VoucherCreatedTemplate);
    this.registerTemplate(PaymentReceivedTemplate);
    this.registerTemplate(ReportReadyTemplate);
  }

  /**
   * تسجيل قالب جديد
   */
  registerTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * تعيين الأنماط
   */
  setStyles(styles: Partial<EmailStyles>): void {
    this.styles = { ...this.styles, ...styles };
  }

  /**
   * عرض قالب
   */
  render(
    templateId: string,
    variables: Record<string, string>,
    language: Language = 'ar'
  ): RenderedEmail {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // التحقق من المتغيرات المطلوبة
    this.validateVariables(template, variables);

    // استبدال المتغيرات
    const subject = this.replaceVariables(template.subject[language], variables);
    const bodyContent = this.replaceVariables(template.body[language], variables);
    
    // إنشاء HTML النهائي
    const html = createBaseTemplate(bodyContent, this.styles, language === 'ar');
    const text = stripHtml(bodyContent);

    return { subject, html, text };
  }

  /**
   * الحصول على قالب
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * الحصول على جميع القوالب
   */
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * التحقق من المتغيرات
   */
  private validateVariables(template: EmailTemplate, variables: Record<string, string>): void {
    const missing = template.variables.filter((v) => !(v in variables));
    if (missing.length > 0) {
      console.warn(`Missing variables for template ${template.id}: ${missing.join(', ')}`);
    }
  }

  /**
   * استبدال المتغيرات
   */
  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value);
    }
    return result;
  }
}

export const templateEngine = new TemplateEngine();
```

### الخطوة 11: إنشاء ملف index.ts
```typescript
// server/email-templates/index.ts

export * from './types';
export * from './base-template';
export * from './template-engine';
export * from './templates/welcome';
export * from './templates/password-reset';
export * from './templates/voucher-created';
export * from './templates/payment-received';
export * from './templates/report-ready';

export { templateEngine } from './template-engine';
```

### الخطوة 12: رفع التغييرات
```bash
git add server/email-templates/
git commit -m "feat(email): إضافة قوالب البريد الإلكتروني

- إضافة قالب أساسي مع دعم RTL
- إضافة قوالب: ترحيب، إعادة تعيين كلمة المرور، سند جديد، دفعة مستلمة، تقرير جاهز
- إضافة محرك قوالب مع دعم المتغيرات
- دعم اللغة العربية والإنجليزية"

git push origin feature/task17-email-templates
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/email-templates/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `base-template.ts`
- [ ] إنشاء ملف `templates/welcome.ts`
- [ ] إنشاء ملف `templates/password-reset.ts`
- [ ] إنشاء ملف `templates/voucher-created.ts`
- [ ] إنشاء ملف `templates/payment-received.ts`
- [ ] إنشاء ملف `templates/report-ready.ts`
- [ ] إنشاء ملف `template-engine.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
