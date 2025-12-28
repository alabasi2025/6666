/**
 * Type declarations for Express Request
 * إضافة خاصية user إلى Request
 */

import type { User } from "../../drizzle/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

export {};




