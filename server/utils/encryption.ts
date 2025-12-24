/**
 * @fileoverview دوال التشفير للبيانات الحساسة
 * @module server/utils/encryption
 */
import crypto from "crypto";
import { logger } from './logger';

// مفتاح التشفير (يجب تخزينه في متغيرات البيئة في الإنتاج)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * تشفير نص
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * فك تشفير نص
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error', { error: error instanceof Error ? error.message : error });
    return encryptedText;
  }
}

/**
 * تشفير رقم الهوية الوطنية
 */
export function encryptNationalId(nationalId: string): string {
  return encrypt(nationalId);
}

/**
 * فك تشفير رقم الهوية الوطنية
 */
export function decryptNationalId(encryptedId: string): string {
  return decrypt(encryptedId);
}

/**
 * تشفير رقم الحساب البنكي
 */
export function encryptBankAccount(accountNumber: string): string {
  return encrypt(accountNumber);
}

/**
 * فك تشفير رقم الحساب البنكي
 */
export function decryptBankAccount(encryptedAccount: string): string {
  return decrypt(encryptedAccount);
}

/**
 * إخفاء جزء من النص (للعرض)
 */
export function maskSensitiveData(text: string, visibleChars: number = 4): string {
  if (!text || text.length <= visibleChars) return text;
  
  const visible = text.slice(-visibleChars);
  const masked = '*'.repeat(text.length - visibleChars);
  return masked + visible;
}

/**
 * إنشاء hash للمقارنة
 */
export function createHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * التحقق من hash
 */
export function verifyHash(text: string, hash: string): boolean {
  return createHash(text) === hash;
}
