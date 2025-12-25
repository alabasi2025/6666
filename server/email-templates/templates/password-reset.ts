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
