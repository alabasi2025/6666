/**
 * @fileoverview دوال CRUD للأصول
 * @module server/db/assets
 */
import { eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { assets } from "../../drizzle/schema";
import { logger } from "../logger";

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * إنشاء أصل جديد
 */
export async function createAsset(data: InsertAsset): Promise<Asset> {
  const db = await getDb();
  logger.info("Creating new asset", { nameAr: data.nameAr });
  
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
    return await db.select().from(assets).where(eq(assets.businessId, businessId));
  }
  
  return await db.select().from(assets);
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
  return (result as any).rowsAffected > 0;
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
    usefulLife: assets.usefulLife,
    purchaseCost: assets.purchaseCost,
    salvageValue: assets.salvageValue
  }).from(assets).where(eq(assets.businessId, businessId));
  
  // حساب وتحديث الإهلاك لكل أصل
  for (const asset of allAssets) {
    if (asset.usefulLife && asset.usefulLife > 0) {
      const currentValue = Number(asset.currentValue) || 0;
      const purchaseCost = Number(asset.purchaseCost) || 0;
      const salvageValue = Number(asset.salvageValue) || 0;
      
      // حساب الإهلاك الشهري (القسط الثابت)
      const annualDepreciation = (purchaseCost - salvageValue) / asset.usefulLife;
      const monthlyDepreciation = annualDepreciation / 12;
      
      const newValue = Math.max(currentValue - monthlyDepreciation, salvageValue);
      const newAccumulated = purchaseCost - newValue;
      
      await db.update(assets)
        .set({ 
          currentValue: newValue.toFixed(2),
          accumulatedDepreciation: newAccumulated.toFixed(2)
        })
        .where(eq(assets.id, asset.id));
    }
  }
}
