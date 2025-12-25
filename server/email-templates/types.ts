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
