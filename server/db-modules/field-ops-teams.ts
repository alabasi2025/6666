// Field Teams - الفرق الميدانية
export async function createFieldTeam(data: InsertFieldTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fieldTeams).values(data);
  return result[0].insertId;
}

export async function getFieldTeams(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: fieldTeams.id,
    businessId: fieldTeams.businessId,
    code: fieldTeams.code,
    nameAr: fieldTeams.nameAr,
    nameEn: fieldTeams.nameEn,
    teamType: fieldTeams.teamType,
    workingArea: fieldTeams.workingArea,
    maxMembers: fieldTeams.maxMembers,
    currentMembers: fieldTeams.currentMembers,
    status: fieldTeams.status,
    isActive: fieldTeams.isActive,
  }).from(fieldTeams)
    .where(eq(fieldTeams.businessId, businessId))
    .orderBy(asc(fieldTeams.nameAr));
}

export async function getFieldTeamById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: fieldTeams.id,
    businessId: fieldTeams.businessId,
    branchId: fieldTeams.branchId,
    code: fieldTeams.code,
    nameAr: fieldTeams.nameAr,
    nameEn: fieldTeams.nameEn,
    leaderId: fieldTeams.leaderId,
    status: fieldTeams.status,
    isActive: fieldTeams.isActive,
    createdAt: fieldTeams.createdAt,
    updatedAt: fieldTeams.updatedAt,
  }).from(fieldTeams).where(eq(fieldTeams.id, id));
  return result[0] || null;
}

export async function updateFieldTeam(id: number, data: Partial<InsertFieldTeam>) {
  const db = await getDb();
  if (!db) return;

  await db.update(fieldTeams).set(data).where(eq(fieldTeams.id, id));
}

// Field Workers - العاملين الميدانيين
export async function createFieldWorker(data: InsertFieldWorker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fieldWorkers).values(data);
  return result[0].insertId;
}

export async function getFieldWorkers(businessId: number, filters?: {
  teamId?: number;
  status?: string;
  workerType?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(fieldWorkers.businessId, businessId)];
  
  if (filters?.teamId) conditions.push(eq(fieldWorkers.teamId, filters.teamId));
  if (filters?.status) conditions.push(eq(fieldWorkers.status, filters.status as any));
  if (filters?.workerType) conditions.push(eq(fieldWorkers.workerType, filters.workerType as any));

  return await db.select({
    id: fieldWorkers.id,
    businessId: fieldWorkers.businessId,
    teamId: fieldWorkers.teamId,
    employeeId: fieldWorkers.employeeId,
    employeeNumber: fieldWorkers.employeeNumber,
    nameAr: fieldWorkers.nameAr,
    phone: fieldWorkers.phone,
    email: fieldWorkers.email,
    workerType: fieldWorkers.workerType,
    specialization: fieldWorkers.specialization,
    currentLocationLat: fieldWorkers.currentLocationLat,
    currentLocationLng: fieldWorkers.currentLocationLng,
    status: fieldWorkers.status,
    isActive: fieldWorkers.isActive,
  }).from(fieldWorkers)
    .where(and(...conditions))
    .orderBy(asc(fieldWorkers.nameAr));
}

export async function getFieldWorkerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: fieldWorkers.id,
    businessId: fieldWorkers.businessId,
    teamId: fieldWorkers.teamId,
    employeeId: fieldWorkers.employeeId,
    nameAr: fieldWorkers.nameAr,
    nameEn: fieldWorkers.nameEn,
    phone: fieldWorkers.phone,
    email: fieldWorkers.email,
    status: fieldWorkers.status,
    isActive: fieldWorkers.isActive,
    skills: fieldWorkers.skills,
    certifications: fieldWorkers.certifications,
    createdAt: fieldWorkers.createdAt,
    updatedAt: fieldWorkers.updatedAt,
  }).from(fieldWorkers).where(eq(fieldWorkers.id, id));
  return result[0] || null;
}

export async function updateFieldWorker(id: number, data: Partial<InsertFieldWorker>) {
  const db = await getDb();
  if (!db) return;

  await db.update(fieldWorkers).set(data).where(eq(fieldWorkers.id, id));
}

export async function updateWorkerLocation(workerId: number, lat: number, lng: number, operationId?: number) {
  const db = await getDb();
  if (!db) return;

  // Insert location history
  await db.insert(workerLocations).values({
    workerId,
    latitude: lat.toString(),
    longitude: lng.toString(),
    operationId,
  });

  // Update current location
  await db.update(fieldWorkers).set({
    currentLocationLat: lat.toString(),
    currentLocationLng: lng.toString(),
    lastLocationUpdate: new Date(),
  }).where(eq(fieldWorkers.id, workerId));
}

