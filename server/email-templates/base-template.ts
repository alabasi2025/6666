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
