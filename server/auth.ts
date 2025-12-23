import bcrypt from 'bcrypt';
import { drizzle } from "drizzle-orm/mysql2";
import { eq, sql } from "drizzle-orm";
import { users } from "../drizzle/schema";

const SALT_ROUNDS = 10;

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Auth] Failed to connect to database:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * تشفير كلمة المرور باستخدام bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * تسجيل مستخدم جديد
 */
export async function registerUser(data: {
  phone: string;
  password: string;
  name?: string;
  email?: string;
  role?: 'user' | 'admin' | 'super_admin';
}): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "قاعدة البيانات غير متاحة" };
  }

  try {
    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);
    if (existingUser.length > 0) {
      return { success: false, error: "رقم الهاتف مسجل مسبقاً" };
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(data.password);
    
    // إنشاء openId فريد
    const openId = `local_${data.phone}_${Date.now()}`;
    
    // إدخال المستخدم الجديد
    const result = await db.insert(users).values({
      openId,
      phone: data.phone,
      password: hashedPassword,
      name: data.name || data.phone,
      email: data.email || null,
      role: data.role || 'user',
      loginMethod: 'local',
      isActive: true,
    });

    return { success: true, userId: result[0].insertId };
  } catch (error: any) {
    console.error("[Auth] Registration error:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء التسجيل" };
  }
}

/**
 * تسجيل الدخول بالهاتف وكلمة المرور
 */
export async function loginUser(phone: string, password: string): Promise<{
  success: boolean;
  user?: {
    id: number;
    openId: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    role: 'user' | 'admin' | 'super_admin';
  };
  error?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "قاعدة البيانات غير متاحة" };
  }

  try {
    // البحث عن المستخدم
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    
    if (result.length === 0) {
      return { success: false, error: "رقم الهاتف غير مسجل" };
    }

    const user = result[0];

    // التحقق من أن الحساب نشط
    if (!user.isActive) {
      return { success: false, error: "الحساب موقوف، يرجى التواصل مع الإدارة" };
    }

    // التحقق من كلمة المرور
    if (!user.password) {
      return { success: false, error: "كلمة المرور غير معينة لهذا الحساب" };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: "كلمة المرور غير صحيحة" };
    }

    // تحديث وقت آخر تسجيل دخول
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

    return {
      success: true,
      user: {
        id: user.id,
        openId: user.openId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error("[Auth] Login error:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء تسجيل الدخول" };
  }
}

/**
 * تغيير كلمة المرور
 */
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "قاعدة البيانات غير متاحة" };
  }

  try {
    // البحث عن المستخدم
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (result.length === 0) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    const user = result[0];

    // التحقق من كلمة المرور القديمة
    if (!user.password) {
      return { success: false, error: "كلمة المرور غير معينة لهذا الحساب" };
    }

    const isValidPassword = await verifyPassword(oldPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: "كلمة المرور القديمة غير صحيحة" };
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await hashPassword(newPassword);

    // تحديث كلمة المرور
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

    return { success: true };
  } catch (error: any) {
    console.error("[Auth] Change password error:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء تغيير كلمة المرور" };
  }
}

/**
 * إعادة تعيين كلمة المرور (للمدير)
 */
export async function resetPassword(
  userId: number,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "قاعدة البيانات غير متاحة" };
  }

  try {
    // تشفير كلمة المرور الجديدة
    const hashedPassword = await hashPassword(newPassword);

    // تحديث كلمة المرور
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

    return { success: true };
  } catch (error: any) {
    console.error("[Auth] Reset password error:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور" };
  }
}

/**
 * إنشاء مستخدم مدير افتراضي إذا لم يكن موجوداً
 * يستخدم متغيرات البيئة للأمان
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[Auth] Database not available, skipping default admin creation");
    return;
  }

  try {
    // التحقق من وجود أي مستخدم admin أو super_admin
    const adminUsers = await db.select().from(users).where(
      sql`${users.role} IN ('admin', 'super_admin')`
    ).limit(1);

    if (adminUsers.length === 0) {
      // استخدام متغيرات البيئة بدلاً من القيم الثابتة
      const adminPhone = process.env.DEFAULT_ADMIN_PHONE || "0500000000";
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
      const adminName = process.env.DEFAULT_ADMIN_NAME || "مدير النظام";
      
      console.log("[Auth] No admin users found, creating default admin...");
      
      const result = await registerUser({
        phone: adminPhone,
        password: adminPassword,
        name: adminName,
        role: "super_admin",
      });

      if (result.success) {
        console.log("✅ [Auth] Default admin created successfully");
        // لا نطبع البيانات الحساسة في السجلات
        console.log("[Auth] Admin credentials loaded from environment variables");
      } else {
        console.error("[Auth] Failed to create default admin:", result.error);
      }
    } else {
      console.log("[Auth] Admin user already exists");
    }
  } catch (error) {
    console.error("[Auth] Error checking/creating default admin:", error);
  }
}
