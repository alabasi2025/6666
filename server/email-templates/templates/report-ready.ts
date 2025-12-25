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
