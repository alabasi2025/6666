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
