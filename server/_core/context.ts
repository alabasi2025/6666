import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

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

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // DEMO_MODE فقط إذا كان DATABASE_URL غير موجود أو DEMO_MODE=true صراحة
  // نفضل قاعدة البيانات الحقيقية حتى في development
  const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;
  
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    // في الوضع التجريبي فقط، نستخدم المستخدم التجريبي
    if (DEMO_MODE) {
      user = demoUser;
    } else {
      user = null;
    }
  }
  
  // في الوضع التجريبي فقط، إذا لم يكن هناك مستخدم، نستخدم المستخدم التجريبي
  if (!user && DEMO_MODE) {
    user = demoUser;
  }
  
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
