// ============================================
// Business Management
// ============================================

export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(businesses).values(data);
  return result[0].insertId;
}

export async function getBusinesses() {
  const db = await getDb();
  if (!db) {
    logger.warn("[DB] Database not available in getBusinesses");
    return [];
  }

  try {
    // Get all active businesses - try with boolean true first
    let result = await db.select({
      id: businesses.id,
      code: businesses.code,
      nameAr: businesses.nameAr,
      nameEn: businesses.nameEn,
      type: businesses.type,
      systemType: businesses.systemType,
      logo: businesses.logo,
      isActive: businesses.isActive,
      createdAt: businesses.createdAt,
    }).from(businesses).where(eq(businesses.isActive, true)).orderBy(asc(businesses.nameAr));
    logger.debug("[DB] getBusinesses (isActive=true) returned", { count: result.length });
    
    // If no results, try with number 1 (MySQL stores boolean as tinyint)
    if (result.length === 0) {
      logger.debug("[DB] Trying with isActive=1 (number)");
      result = await db.select({
        id: businesses.id,
        code: businesses.code,
        nameAr: businesses.nameAr,
        nameEn: businesses.nameEn,
        type: businesses.type,
        systemType: businesses.systemType,
        logo: businesses.logo,
        isActive: businesses.isActive,
        createdAt: businesses.createdAt,
      }).from(businesses).where(eq(businesses.isActive, 1)).orderBy(asc(businesses.nameAr));
      logger.debug("[DB] getBusinesses (isActive=1) returned", { count: result.length });
    }
    
    // If still no results, get all businesses
    if (result.length === 0) {
      logger.debug("[DB] Trying without filter - getting all businesses");
      result = await db.select({
        id: businesses.id,
        code: businesses.code,
        nameAr: businesses.nameAr,
        nameEn: businesses.nameEn,
        type: businesses.type,
        systemType: businesses.systemType,
        logo: businesses.logo,
        isActive: businesses.isActive,
        createdAt: businesses.createdAt,
      }).from(businesses).orderBy(asc(businesses.nameAr));
      logger.debug("[DB] getBusinesses (all) returned", { count: result.length });
    }
    
    if (result.length > 0) {
      logger.debug("[DB] First business", { id: result[0].id, code: result[0].code, nameAr: result[0].nameAr });
    }
    return result;
  } catch (error) {
    logger.error("[DB] Error in getBusinesses", { error });
    // Try without filter as fallback
    try {
      const allResult = await db.select({
        id: businesses.id,
        code: businesses.code,
        nameAr: businesses.nameAr,
        nameEn: businesses.nameEn,
        type: businesses.type,
        systemType: businesses.systemType,
        logo: businesses.logo,
        isActive: businesses.isActive,
        createdAt: businesses.createdAt,
      }).from(businesses).orderBy(asc(businesses.nameAr));
      logger.debug("[DB] getBusinesses (fallback) returned", { count: allResult.length });
      return allResult;
    } catch (fallbackError) {
      logger.error("[DB] Fallback query also failed", { error: fallbackError });
      return [];
    }
  }
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: businesses.id,
    code: businesses.code,
    nameAr: businesses.nameAr,
    nameEn: businesses.nameEn,
    type: businesses.type,
    systemType: businesses.systemType,
    parentId: businesses.parentId,
    logo: businesses.logo,
    address: businesses.address,
    phone: businesses.phone,
    email: businesses.email,
    website: businesses.website,
    taxNumber: businesses.taxNumber,
    commercialRegister: businesses.commercialRegister,
    currency: businesses.currency,
    fiscalYearStart: businesses.fiscalYearStart,
    timezone: businesses.timezone,
    isActive: businesses.isActive,
    settings: businesses.settings,
    createdAt: businesses.createdAt,
    updatedAt: businesses.updatedAt,
  }).from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0] || null;
}

export async function updateBusiness(id: number, data: Partial<InsertBusiness>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(businesses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(businesses.id, id));
  
  return id;
}

export async function deleteBusiness(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete - set isActive to false
  await db.update(businesses)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(businesses.id, id));
  
  return id;
}

// ============================================
// Branch Management
// ============================================

export async function createBranch(data: InsertBranch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(branches).values(data);
  return result[0].insertId;
}

export async function getBranches(businessId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (businessId) {
    return await db.select({
      id: branches.id,
      businessId: branches.businessId,
      code: branches.code,
      nameAr: branches.nameAr,
      nameEn: branches.nameEn,
      type: branches.type,
      city: branches.city,
      isActive: branches.isActive,
      createdAt: branches.createdAt,
    }).from(branches)
      .where(and(eq(branches.businessId, businessId), eq(branches.isActive, true)))
      .orderBy(asc(branches.nameAr));
  }
  return await db.select({
    id: branches.id,
    businessId: branches.businessId,
    code: branches.code,
    nameAr: branches.nameAr,
    nameEn: branches.nameEn,
    type: branches.type,
    city: branches.city,
    isActive: branches.isActive,
    createdAt: branches.createdAt,
  }).from(branches).orderBy(asc(branches.nameAr));
}

export async function updateBranch(id: number, data: Partial<InsertBranch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(branches).set(data).where(eq(branches.id, id));
  return { success: true };
}

export async function deleteBranch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(branches).set({ isActive: false }).where(eq(branches.id, id));
  return { success: true };
}

// ============================================
// Station Management
// ============================================

export async function createStation(data: InsertStation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(stations).values(data);
  return result[0].insertId;
}

export async function getStations(businessId?: number, branchId?: number) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(stations.isActive, true)];
  if (businessId) conditions.push(eq(stations.businessId, businessId));
  if (branchId) conditions.push(eq(stations.branchId, branchId));

  return await db.select({
    id: stations.id,
    businessId: stations.businessId,
    branchId: stations.branchId,
    code: stations.code,
    nameAr: stations.nameAr,
    nameEn: stations.nameEn,
    type: stations.type,
    status: stations.status,
    capacity: stations.capacity,
    isActive: stations.isActive,
  }).from(stations).where(and(...conditions)).orderBy(asc(stations.nameAr));
}

export async function getStationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: stations.id,
    businessId: stations.businessId,
    branchId: stations.branchId,
    code: stations.code,
    nameAr: stations.nameAr,
    nameEn: stations.nameEn,
    type: stations.type,
    status: stations.status,
    capacity: stations.capacity,
    capacityUnit: stations.capacityUnit,
    voltageLevel: stations.voltageLevel,
    address: stations.address,
    latitude: stations.latitude,
    longitude: stations.longitude,
    commissionDate: stations.commissionDate,
    managerId: stations.managerId,
    isActive: stations.isActive,
    metadata: stations.metadata,
    createdAt: stations.createdAt,
    updatedAt: stations.updatedAt,
  }).from(stations).where(eq(stations.id, id)).limit(1);
  return result[0] || null;
}

export async function updateStation(id: number, data: Partial<InsertStation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(stations).set(data).where(eq(stations.id, id));
  return { success: true };
}

export async function deleteStation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(stations).set({ isActive: false }).where(eq(stations.id, id));
  return { success: true };
}
