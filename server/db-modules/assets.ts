// ============================================
// Asset Management
// ============================================

export async function createAsset(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // تنظيف البيانات قبل الإدراج
  const cleanData: any = {
    businessId: data.businessId,
    categoryId: data.categoryId,
    code: data.code,
    nameAr: data.nameAr,
    status: data.status || 'active',
  };
  
  // إضافة الحقول الاختيارية فقط إذا كانت موجودة
  if (data.branchId) cleanData.branchId = data.branchId;
  if (data.stationId) cleanData.stationId = data.stationId;
  if (data.nameEn) cleanData.nameEn = data.nameEn;
  if (data.description) cleanData.description = data.description;
  if (data.serialNumber) cleanData.serialNumber = data.serialNumber;
  if (data.model) cleanData.model = data.model;
  if (data.manufacturer) cleanData.manufacturer = data.manufacturer;
  if (data.purchaseDate) cleanData.purchaseDate = new Date(data.purchaseDate);
  if (data.purchaseCost) cleanData.purchaseCost = data.purchaseCost.toString();
  if (data.location) cleanData.location = data.location;
  if (data.createdBy) cleanData.createdBy = data.createdBy;

  const result = await db.insert(assets).values(cleanData);
  return result[0].insertId;
}

export async function getAssets(businessId: number, filters?: { stationId?: number; categoryId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(assets.businessId, businessId)];
  if (filters?.stationId) conditions.push(eq(assets.stationId, filters.stationId));
  if (filters?.categoryId) conditions.push(eq(assets.categoryId, filters.categoryId));
  if (filters?.status) conditions.push(eq(assets.status, filters.status as any));

  return await db.select({
    id: assets.id,
    businessId: assets.businessId,
    branchId: assets.branchId,
    stationId: assets.stationId,
    categoryId: assets.categoryId,
    code: assets.code,
    nameAr: assets.nameAr,
    status: assets.status,
    purchaseCost: assets.purchaseCost,
    currentValue: assets.currentValue,
    createdAt: assets.createdAt,
  }).from(assets).where(and(...conditions)).orderBy(desc(assets.createdAt));
}

export async function getAssetById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: assets.id,
    businessId: assets.businessId,
    branchId: assets.branchId,
    stationId: assets.stationId,
    categoryId: assets.categoryId,
    code: assets.code,
    nameAr: assets.nameAr,
    nameEn: assets.nameEn,
    description: assets.description,
    serialNumber: assets.serialNumber,
    model: assets.model,
    manufacturer: assets.manufacturer,
    purchaseDate: assets.purchaseDate,
    commissionDate: assets.commissionDate,
    purchaseCost: assets.purchaseCost,
    currentValue: assets.currentValue,
    accumulatedDepreciation: assets.accumulatedDepreciation,
    salvageValue: assets.salvageValue,
    usefulLife: assets.usefulLife,
    depreciationMethod: assets.depreciationMethod,
    status: assets.status,
    location: assets.location,
    latitude: assets.latitude,
    longitude: assets.longitude,
    warrantyExpiry: assets.warrantyExpiry,
    supplierId: assets.supplierId,
    qrCode: assets.qrCode,
    barcode: assets.barcode,
    image: assets.image,
    specifications: assets.specifications,
    createdBy: assets.createdBy,
    createdAt: assets.createdAt,
    updatedAt: assets.updatedAt,
  }).from(assets).where(eq(assets.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Asset Management Extended Functions
// ============================================

export async function getAssetCategories(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: assetCategories.id,
    businessId: assetCategories.businessId,
    code: assetCategories.code,
    nameAr: assetCategories.nameAr,
    nameEn: assetCategories.nameEn,
    parentId: assetCategories.parentId,
    depreciationMethod: assetCategories.depreciationMethod,
    usefulLife: assetCategories.usefulLife,
    isActive: assetCategories.isActive,
  }).from(assetCategories)
    .where(and(eq(assetCategories.businessId, businessId), eq(assetCategories.isActive, true)))
    .orderBy(asc(assetCategories.code));
}

export async function createAssetCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assetCategories).values(data);
  return result[0].insertId;
}

export async function updateAssetCategory(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(assetCategories).set(data).where(eq(assetCategories.id, id));
}

export async function deleteAssetCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assetCategories).set({ isActive: false }).where(eq(assetCategories.id, id));
}

export async function updateAsset(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(assets).set(data).where(eq(assets.id, id));
}

export async function deleteAsset(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assets).set({ status: "disposed" }).where(eq(assets.id, id));
}

export async function getAssetMovements(filters: { assetId?: number; businessId?: number; movementType?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions: any[] = [];
  if (filters.assetId) conditions.push(eq(assetMovements.assetId, filters.assetId));
  if (filters.movementType) conditions.push(eq(assetMovements.movementType, filters.movementType as any));
  
  if (conditions.length === 0) return [];
  
  return await db.select({
    id: assetMovements.id,
    assetId: assetMovements.assetId,
    movementType: assetMovements.movementType,
    movementDate: assetMovements.movementDate,
    amount: assetMovements.amount,
    description: assetMovements.description,
    createdAt: assetMovements.createdAt,
  }).from(assetMovements)
    .where(and(...conditions))
    .orderBy(desc(assetMovements.movementDate));
}

export async function createAssetMovement(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assetMovements).values(data);
  return result[0].insertId;
}

export async function calculateDepreciation(params: { businessId: number; periodId?: number; assetIds?: number[]; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get assets for depreciation
  let conditions = [eq(assets.businessId, params.businessId), eq(assets.status, "active")];
  if (params.assetIds && params.assetIds.length > 0) {
    conditions.push(inArray(assets.id, params.assetIds));
  }
  
  const assetsList = await db.select({
    id: assets.id,
    nameAr: assets.nameAr,
    purchaseCost: assets.purchaseCost,
    salvageValue: assets.salvageValue,
    usefulLife: assets.usefulLife,
    accumulatedDepreciation: assets.accumulatedDepreciation,
    currentValue: assets.currentValue,
  }).from(assets).where(and(...conditions));
  
  let totalDepreciation = 0;
  const results: any[] = [];
  
  for (const asset of assetsList) {
    if (!asset.purchaseCost || !asset.usefulLife) continue;
    
    const purchaseCost = parseFloat(asset.purchaseCost);
    const salvageValue = parseFloat(asset.salvageValue || "0");
    const usefulLife = asset.usefulLife;
    
    // Straight-line depreciation
    const annualDepreciation = (purchaseCost - salvageValue) / usefulLife;
    const monthlyDepreciation = annualDepreciation / 12;
    
    // Update accumulated depreciation
    const newAccumulated = parseFloat(asset.accumulatedDepreciation || "0") + monthlyDepreciation;
    const newCurrentValue = purchaseCost - newAccumulated;
    
    await db.update(assets).set({
      accumulatedDepreciation: newAccumulated.toFixed(2),
      currentValue: newCurrentValue.toFixed(2),
    }).where(eq(assets.id, asset.id));
    
    // Create movement record
    await db.insert(assetMovements).values({
      assetId: asset.id,
      movementType: "depreciation",
      movementDate: new Date().toISOString().split('T')[0],
      amount: monthlyDepreciation.toFixed(2),
      description: "إهلاك شهري",
      createdBy: params.userId,
    });
    
    totalDepreciation += monthlyDepreciation;
    results.push({
      assetId: asset.id,
      assetName: asset.nameAr,
      depreciation: monthlyDepreciation,
    });
  }
  
  return { totalDepreciation, count: results.length, results };
}

export async function getDepreciationHistory(filters: { assetId?: number; businessId?: number; year?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(assetMovements.movementType, "depreciation")];
  if (filters.assetId) conditions.push(eq(assetMovements.assetId, filters.assetId));
  
  return await db.select({
    id: assetMovements.id,
    assetId: assetMovements.assetId,
    movementType: assetMovements.movementType,
    movementDate: assetMovements.movementDate,
    amount: assetMovements.amount,
    description: assetMovements.description,
    createdAt: assetMovements.createdAt,
  }).from(assetMovements)
    .where(and(...conditions))
    .orderBy(desc(assetMovements.movementDate));
}

export async function getAssetDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalAssets: 0, activeAssets: 0, totalValue: 0, totalDepreciation: 0 };
  
  const [total] = await db.select({ count: count() }).from(assets).where(eq(assets.businessId, businessId));
  const [active] = await db.select({ count: count() }).from(assets).where(and(eq(assets.businessId, businessId), eq(assets.status, "active")));
  const [values] = await db.select({ 
    totalValue: sql<number>`COALESCE(SUM(current_value), 0)`,
    totalDepreciation: sql<number>`COALESCE(SUM(accumulated_depreciation), 0)`,
  }).from(assets).where(eq(assets.businessId, businessId));
  
  return {
    totalAssets: total?.count || 0,
    activeAssets: active?.count || 0,
    totalValue: values?.totalValue || 0,
    totalDepreciation: values?.totalDepreciation || 0,
  };
}
