/**
 * @fileoverview إعدادات الأمان
 * @module server/middleware/security
 */

// رؤوس الأمان (Helmet-like)
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

// إعدادات CORS
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400 // 24 ساعة
};

/**
 * تطهير المدخلات من XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * التحقق من صحة Content-Type
 */
export function validateContentType(contentType: string | undefined): boolean {
  const allowedTypes = [
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data"
  ];
  
  if (!contentType) return false;
  return allowedTypes.some(type => contentType.includes(type));
}

/**
 * إنشاء CSRF Token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}
