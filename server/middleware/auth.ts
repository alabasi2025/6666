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
  businessId: null,
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
  const isDevelopment = process.env.NODE_ENV === 'development';
  const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;
  
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(req);
  } catch (error) {
    // Authentication is optional for some routes.
    // في الوضع التجريبي، نستخدم المستخدم التجريبي
    if (isDevelopment || DEMO_MODE) {
      user = demoUser;
    } else {
      user = null;
    }
  }
  
  // في الوضع التجريبي، إذا لم يكن هناك مستخدم، نستخدم المستخدم التجريبي
  if (!user && (isDevelopment || DEMO_MODE)) {
    user = demoUser;
  }
  
  // تعيين المستخدم في req.user
  (req as any).user = user;
  
  next();
}

