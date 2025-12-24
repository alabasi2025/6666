// @ts-nocheck
/**
 * @fileoverview دوال CRUD للمستخدمين
 * @module server/db/users
 */

import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { logger } from "../logger";

// أنواع البيانات
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * إنشاء مستخدم جديد
 */
export async function createUser(data: InsertUser): Promise<User> {
  const db = await getDb();
  logger.info("Creating new user", { phone: data.phone });
  
  const [result] = await db.insert(users).values(data);
  const [newUser] = await db.select().from(users).where(eq(users.id, result.insertId));
  
  return newUser;
}

/**
 * جلب جميع المستخدمين
 */
export async function getUsers(businessId?: number): Promise<User[]> {
  const db = await getDb();
  
  if (businessId) {
    return await db.select({
      id: users.id,
      nameAr: users.nameAr,
      phone: users.phone,
      role: users.role
    }).from(users).where(eq(users.businessId, businessId));
  }
  
  return await db.select({
    id: users.id,
    nameAr: users.nameAr,
    phone: users.phone,
    role: users.role
  }).from(users);
}

/**
 * جلب مستخدم بالمعرف
 */
export async function getUserById(id: number): Promise<User | null> {
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

/**
 * تحديث مستخدم
 */
export async function updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
  const db = await getDb();
  logger.info("Updating user", { id });
  
  await db.update(users).set(data).where(eq(users.id, id));
  return await getUserById(id);
}

/**
 * حذف مستخدم
 */
export async function deleteUser(id: number): Promise<boolean> {
  const db = await getDb();
  logger.info("Deleting user", { id });
  
  const result = await db.delete(users).where(eq(users.id, id));
  return result.rowsAffected > 0;
}

/**
 * جلب مستخدمين متعددين بالمعرفات (تجنب N+1)
 */
export async function getUsersByIds(ids: number[]): Promise<User[]> {
  if (ids.length === 0) return [];
  
  const db = await getDb();
  return await db.select().from(users).where(inArray(users.id, ids));
}
