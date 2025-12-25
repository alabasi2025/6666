// ============================================
// Projects
// ============================================

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjects(businessId: number, filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(projects.businessId, businessId)];
  if (filters?.status) conditions.push(eq(projects.status, filters.status as any));

  return await db.select({
    id: projects.id,
    businessId: projects.businessId,
    branchId: projects.branchId,
    stationId: projects.stationId,
    code: projects.code,
    nameAr: projects.nameAr,
    nameEn: projects.nameEn,
    type: projects.type,
    status: projects.status,
    startDate: projects.startDate,
    endDate: projects.endDate,
    budget: projects.budget,
    progress: projects.progress,
    createdAt: projects.createdAt,
  }).from(projects).where(and(...conditions)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: projects.id,
    businessId: projects.businessId,
    branchId: projects.branchId,
    stationId: projects.stationId,
    code: projects.code,
    nameAr: projects.nameAr,
    nameEn: projects.nameEn,
    description: projects.description,
    type: projects.type,
    status: projects.status,
    priority: projects.priority,
    startDate: projects.startDate,
    endDate: projects.endDate,
    actualStartDate: projects.actualStartDate,
    actualEndDate: projects.actualEndDate,
    budget: projects.budget,
    actualCost: projects.actualCost,
    progress: projects.progress,
    managerId: projects.managerId,
    costCenterId: projects.costCenterId,
    notes: projects.notes,
    createdBy: projects.createdBy,
    createdAt: projects.createdAt,
    updatedAt: projects.updatedAt,
  }).from(projects).where(eq(projects.id, id)).limit(1);
  return result[0] || null;
}

// ============================================
// Projects System Functions (Extended)
// ============================================

export async function updateProject(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  
  await db.update(projects).set(updateData).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(projectTasks).where(eq(projectTasks.projectId, id));
  await db.delete(projectPhases).where(eq(projectPhases.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectPhases(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: projectPhases.id,
    projectId: projectPhases.projectId,
    nameAr: projectPhases.nameAr,
    nameEn: projectPhases.nameEn,
    description: projectPhases.description,
    startDate: projectPhases.startDate,
    endDate: projectPhases.endDate,
    status: projectPhases.status,
    progress: projectPhases.progress,
    sortOrder: projectPhases.sortOrder,
  }).from(projectPhases)
    .where(eq(projectPhases.projectId, projectId))
    .orderBy(asc(projectPhases.sortOrder));
}

export async function createProjectPhase(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(projectPhases).values({
    projectId: data.projectId,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    description: data.description,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    status: data.status || "pending",
    progress: data.progress || 0,
    sortOrder: data.sortOrder || 0,
  });
  
  return result.insertId;
}

export async function updateProjectPhase(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  
  await db.update(projectPhases).set(updateData).where(eq(projectPhases.id, id));
}

export async function deleteProjectPhase(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(projectPhases).where(eq(projectPhases.id, id));
}

export async function getProjectTasks(projectId: number, phaseId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(projectTasks.projectId, projectId)];
  if (phaseId) conditions.push(eq(projectTasks.phaseId, phaseId));
  
  return await db.select({
    id: projectTasks.id,
    projectId: projectTasks.projectId,
    phaseId: projectTasks.phaseId,
    nameAr: projectTasks.nameAr,
    nameEn: projectTasks.nameEn,
    assigneeId: projectTasks.assigneeId,
    startDate: projectTasks.startDate,
    dueDate: projectTasks.dueDate,
    priority: projectTasks.priority,
    status: projectTasks.status,
    progress: projectTasks.progress,
  }).from(projectTasks)
    .where(and(...conditions))
    .orderBy(asc(projectTasks.dueDate));
}

export async function createProjectTask(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const [result] = await db.insert(projectTasks).values({
    projectId: data.projectId,
    phaseId: data.phaseId,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    description: data.description,
    assigneeId: data.assigneeId,
    startDate: data.startDate ? new Date(data.startDate) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    priority: data.priority || "medium",
    status: data.status || "pending",
    progress: data.progress || 0,
    estimatedHours: data.estimatedHours,
    actualHours: data.actualHours,
  });
  
  return result.insertId;
}

export async function updateProjectTask(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  
  await db.update(projectTasks).set(updateData).where(eq(projectTasks.id, id));
}

export async function deleteProjectTask(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(projectTasks).where(eq(projectTasks.id, id));
}

export async function getProjectsStats(businessId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, completed: 0, onHold: 0, totalBudget: 0 };
  
  const allProjects = await db.select({
    id: projects.id,
    status: projects.status,
    budget: projects.budget,
  }).from(projects).where(eq(projects.businessId, businessId));
  
  return {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === "in_progress").length,
    completed: allProjects.filter(p => p.status === "completed").length,
    onHold: allProjects.filter(p => p.status === "on_hold").length,
    planning: allProjects.filter(p => p.status === "planning").length,
    totalBudget: allProjects.reduce((sum, p) => sum + parseFloat(p.budget || "0"), 0),
  };
}

export async function getProjectGanttData(projectId: number) {
  const db = await getDb();
  if (!db) return { phases: [], tasks: [] };
  
  const phases = await getProjectPhases(projectId);
  const tasks = await getProjectTasks(projectId);
  
  return { phases, tasks };
}
