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
