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
