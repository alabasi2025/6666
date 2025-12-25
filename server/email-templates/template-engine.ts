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
