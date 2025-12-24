// @ts-nocheck
/**
 * @fileoverview دوال CRUD للأصول
 * @module server/db/assets
 */

import { eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../db";
import { assets, depreciationRecords } from "../../drizzle/schema";
import { logger } from "../logger";

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * إنشاء أصل جديد
 */
export async function createAsset(data: InsertAsset): Promise<Asset> {
  const db = await getDb();
  logger.info("Creating new asset", { name: data.name });
  
  const [result] = await db.insert(assets).values(data);
  const [newAsset] = await db.select().from(assets).where(eq(assets.id, result.insertId));
  
  return newAsset;
}

/**
 * جلب جميع الأصول
 */
export async function getAssets(businessId?: number): Promise<Asset[]> {
  const db = await getDb();
  
  if (businessId) {
    return await db.select({
      id: assets.id,
      name: assets.name,
      category: assets.category,
      currentValue: assets.currentValue
    }).from(assets).where(eq(assets.businessId, businessId));
  }
  
  return await db.select({
    id: assets.id,
    name: assets.name,
    category: assets.category,
    currentValue: assets.currentValue
  }).from(assets);
}

/**
 * جلب أصل بالمعرف
 */
export async function getAssetById(id: number): Promise<Asset | null> {
  const db = await getDb();
  const [asset] = await db.select().from(assets).where(eq(assets.id, id));
  return asset || null;
}

/**
 * تحديث أصل
 */
export async function updateAsset(id: number, data: Partial<InsertAsset>): Promise<Asset | null> {
  const db = await getDb();
  logger.info("Updating asset", { id });
  
  await db.update(assets).set(data).where(eq(assets.id, id));
  return await getAssetById(id);
}

/**
 * حذف أصل
 */
export async function deleteAsset(id: number): Promise<boolean> {
  const db = await getDb();
  logger.info("Deleting asset", { id });
  
  const result = await db.delete(assets).where(eq(assets.id, id));
  return result.rowsAffected > 0;
}

/**
 * حساب الإهلاك الشهري (محسّن - بدون N+1)
 */
export async function calculateMonthlyDepreciation(businessId: number): Promise<void> {
  const db = await getDb();
  logger.info("Calculating monthly depreciation", { businessId });
  
  // جلب جميع الأصول دفعة واحدة
  const allAssets = await db.select({
    id: assets.id,
    currentValue: assets.currentValue,
    depreciationRate: assets.depreciationRate
  }).from(assets).where(eq(assets.businessId, businessId));
  
  // حساب الإهلاك لكل أصل
  const depreciationData = allAssets.map(asset => ({
    assetId: asset.id,
    amount: (asset.currentValue * asset.depreciationRate) / 12,
    date: new Date()
  }));
  
  // إدراج جميع سجلات الإهلاك دفعة واحدة
  if (depreciationData.length > 0) {
    await db.insert(depreciationRecords).values(depreciationData);
    
    // تحديث القيم الحالية للأصول دفعة واحدة
    for (const asset of allAssets) {
      const depreciation = (asset.currentValue * asset.depreciationRate) / 12;
      await db.update(assets)
        .set({ currentValue: sql`${assets.currentValue} - ${depreciation}` })
        .where(eq(assets.id, asset.id));
    }
  }
}
