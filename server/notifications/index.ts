// server/notifications/index.ts

export * from './types';
export * from './templates';
export * from './notification-service';
export * from './channels/in-app';
export * from './channels/email';
export * from './channels/sms';

export { notificationService } from './notification-service';
