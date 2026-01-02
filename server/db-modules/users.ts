// ============================================
// User Management
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "nameAr", "email", "phone", "avatar", "loginMethod", "jobTitle"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    logger.error("[Database] Failed to upsert user", { error });
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select({
    id: users.id,
    openId: users.openId,
    employeeId: users.employeeId,
    name: users.name,
    nameAr: users.nameAr,
    email: users.email,
    phone: users.phone,
    avatar: users.avatar,
    loginMethod: users.loginMethod,
    role: users.role,
    businessId: users.businessId,
    branchId: users.branchId,
    stationId: users.stationId,
    departmentId: users.departmentId,
    jobTitle: users.jobTitle,
    isActive: users.isActive,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(businessId?: number) {
  const db = await getDb();
  if (!db) return [];

  if (businessId) {
    return await db.select({
      id: users.id,
      name: users.name,
      nameAr: users.nameAr,
      email: users.email,
      phone: users.phone,
      role: users.role,
      businessId: users.businessId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.businessId, businessId)).orderBy(desc(users.createdAt));
  }
  return await db.select({
    id: users.id,
    name: users.name,
    nameAr: users.nameAr,
    email: users.email,
    phone: users.phone,
    role: users.role,
    businessId: users.businessId,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot get user by phone: database not available");
    return undefined;
  }

  const result = await db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    nameAr: users.nameAr,
    email: users.email,
    phone: users.phone,
    password: users.password,
    avatar: users.avatar,
    loginMethod: users.loginMethod,
    role: users.role,
    businessId: users.businessId,
    isActive: users.isActive,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function createUserWithPhone(data: { phone: string; password: string; name?: string; role?: 'user' | 'admin' | 'super_admin' }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const openId = `phone_${data.phone}_${Date.now()}`;
  const result = await db.insert(users).values({
    openId,
    phone: data.phone,
    password: data.password,
    name: data.name || data.phone,
    role: data.role || 'user',
    loginMethod: 'phone',
  });
  
  return result[0].insertId;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select({
    id: users.id,
    openId: users.openId,
    employeeId: users.employeeId,
    name: users.name,
    nameAr: users.nameAr,
    email: users.email,
    phone: users.phone,
    avatar: users.avatar,
    loginMethod: users.loginMethod,
    role: users.role,
    businessId: users.businessId,
    branchId: users.branchId,
    stationId: users.stationId,
    departmentId: users.departmentId,
    jobTitle: users.jobTitle,
    isActive: users.isActive,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<{
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'super_admin';
  businessId: number | null;
  branchId: number | null;
  stationId: number | null;
  departmentId: number | null;
  jobTitle: string | null;
  isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Filter out undefined values
  const updateData: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value;
    }
  });

  if (Object.keys(updateData).length === 0) return;

  await db.update(users).set(updateData).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
}
