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
