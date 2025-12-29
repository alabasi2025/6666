/**
 * Authentication Middleware for Express Routes
 * يستخدم نفس منطق createContext لكن للـ Express routes
 */

import { Request, Response, NextFunction } from "express";
import type { User } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";

// مستخدم تجريبي للوضع التجريبي
const demoUser: User = {
  id: 1,
  openId: 'demo_user_001',
  name: 'مستخدم تجريبي',
  role: 'super_admin',
  email: null,
  phone: null,
  password: null,
  avatar: null,
  loginMethod: null,
  businessId: 1, // تحديث businessId إلى 1
  branchId: null,
  stationId: null,
  departmentId: null,
  jobTitle: null,
  isActive: true,
  employeeId: null,
  nameAr: null,
  lastSignedIn: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Express middleware للتحقق من المستخدم وتعيين req.user
 * يدعم الوضع التجريبي (DEMO_MODE) مثل context.ts
 */
export async function authenticateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // DEMO_MODE فقط إذا كان DATABASE_URL غير موجود أو DEMO_MODE=true صراحة
  const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;
  // في وضع التطوير، نستخدم demoUser كخيار احتياطي
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let user: User | null = null;
  
  // في وضع التطوير أو DEMO_MODE، نستخدم demoUser مباشرة
  if (DEMO_MODE || isDevelopment) {
    user = demoUser;
  } else {
    // في الإنتاج، نحاول المصادقة العادية
    try {
      user = await sdk.authenticateRequest(req);
    } catch (error) {
      // Authentication failed, user remains null
      user = null;
    }
  }
  
  // تعيين المستخدم في req.user
  (req as any).user = user;
  
  // Logging للتشخيص (يمكن إزالته لاحقاً)
  if (process.env.NODE_ENV === 'development' && req.path.includes('/currencies')) {
    console.log('[Auth Middleware]', {
      path: req.path,
      hasUser: !!user,
      businessId: user?.businessId,
      isDevelopment,
      DEMO_MODE
    });
  }
  
  next();
}




