// ============================================
// Maintenance Extended Functions
// ============================================

export async function updateWorkOrder(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrders).set(data).where(eq(workOrders.id, id));
}

export async function completeWorkOrder(data: { id: number; actualHours?: string; actualCost?: string; laborCost?: string; partsCost?: string; completionNotes?: string; failureCode?: string; rootCause?: string; userId: number }) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(workOrders).set({
    status: "completed",
    actualEnd: new Date(),
    actualHours: data.actualHours,
    actualCost: data.actualCost,
    laborCost: data.laborCost,
    partsCost: data.partsCost,
    completionNotes: data.completionNotes,
    failureCode: data.failureCode,
    rootCause: data.rootCause,
  }).where(eq(workOrders.id, data.id));
}

export async function deleteWorkOrder(id: number) {
  const db = await getDb();
  if (!db) return;
  
  // Only delete draft work orders
  const [order] = await db.select({
    id: workOrders.id,
    status: workOrders.status,
  }).from(workOrders).where(eq(workOrders.id, id));
  if (order?.status !== "draft") {
    throw new Error("لا يمكن حذف أمر عمل غير مسودة");
  }
  
  await db.delete(workOrderTasks).where(eq(workOrderTasks.workOrderId, id));
  await db.delete(workOrders).where(eq(workOrders.id, id));
}

export async function getWorkOrderTasks(workOrderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: workOrderTasks.id,
    workOrderId: workOrderTasks.workOrderId,
    taskNumber: workOrderTasks.taskNumber,
    description: workOrderTasks.description,
    estimatedHours: workOrderTasks.estimatedHours,
    actualHours: workOrderTasks.actualHours,
    status: workOrderTasks.status,
    assignedTo: workOrderTasks.assignedTo,
  }).from(workOrderTasks)
    .where(eq(workOrderTasks.workOrderId, workOrderId))
    .orderBy(asc(workOrderTasks.taskNumber));
}

export async function createWorkOrderTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get next task number
  const [lastTask] = await db.select({ maxNum: sql<number>`MAX(task_number)` })
    .from(workOrderTasks)
    .where(eq(workOrderTasks.workOrderId, data.workOrderId));
  
  const taskNumber = (lastTask?.maxNum || 0) + 1;
  
  const result = await db.insert(workOrderTasks).values({
    ...data,
    taskNumber,
    status: "pending",
  });
  
  return result[0].insertId;
}

export async function updateWorkOrderTask(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrderTasks).set(data).where(eq(workOrderTasks.id, id));
}

export async function completeWorkOrderTask(id: number, data: { actualHours?: string; notes?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(workOrderTasks).set({
    status: "completed",
    actualHours: data.actualHours,
    notes: data.notes,
    completedAt: new Date(),
  }).where(eq(workOrderTasks.id, id));
}

export async function deleteWorkOrderTask(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(workOrderTasks).where(eq(workOrderTasks.id, id));
}

export async function getMaintenancePlans(businessId: number, filters?: any) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(maintenancePlans.businessId, businessId)];
  if (filters?.assetCategoryId) conditions.push(eq(maintenancePlans.assetCategoryId, filters.assetCategoryId));
  if (filters?.frequency) conditions.push(eq(maintenancePlans.frequency, filters.frequency as any));
  if (filters?.isActive !== undefined) conditions.push(eq(maintenancePlans.isActive, filters.isActive));
  
  return await db.select({
    id: maintenancePlans.id,
    businessId: maintenancePlans.businessId,
    code: maintenancePlans.code,
    nameAr: maintenancePlans.nameAr,
    nameEn: maintenancePlans.nameEn,
    frequency: maintenancePlans.frequency,
    assetCategoryId: maintenancePlans.assetCategoryId,
    estimatedHours: maintenancePlans.estimatedHours,
    estimatedCost: maintenancePlans.estimatedCost,
    isActive: maintenancePlans.isActive,
  }).from(maintenancePlans)
    .where(and(...conditions))
    .orderBy(asc(maintenancePlans.nameAr));
}

export async function getMaintenancePlanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({
    id: maintenancePlans.id,
    businessId: maintenancePlans.businessId,
    code: maintenancePlans.code,
    nameAr: maintenancePlans.nameAr,
    nameEn: maintenancePlans.nameEn,
    description: maintenancePlans.description,
    frequency: maintenancePlans.frequency,
    assetCategoryId: maintenancePlans.assetCategoryId,
    estimatedHours: maintenancePlans.estimatedHours,
    estimatedCost: maintenancePlans.estimatedCost,
    tasks: maintenancePlans.tasks,
    isActive: maintenancePlans.isActive,
    createdAt: maintenancePlans.createdAt,
  }).from(maintenancePlans).where(eq(maintenancePlans.id, id));
  return result || null;
}

export async function createMaintenancePlan(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(maintenancePlans).values(data);
  return result[0].insertId;
}

export async function updateMaintenancePlan(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(maintenancePlans).set(data).where(eq(maintenancePlans.id, id));
}

export async function deleteMaintenancePlan(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(maintenancePlans).set({ isActive: false }).where(eq(maintenancePlans.id, id));
}

export async function generateWorkOrdersFromPlan(data: { planId: number; assetIds?: number[]; scheduledDate?: string; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const plan = await getMaintenancePlanById(data.planId);
  if (!plan) throw new Error("خطة الصيانة غير موجودة");
  
  // Get assets for this plan
  let assetConditions = [eq(assets.businessId, plan.businessId), eq(assets.status, "active")];
  if (plan.assetCategoryId) assetConditions.push(eq(assets.categoryId, plan.assetCategoryId));
  if (data.assetIds && data.assetIds.length > 0) assetConditions.push(inArray(assets.id, data.assetIds));
  
  const assetsList = await db.select({
    id: assets.id,
    businessId: assets.businessId,
    branchId: assets.branchId,
    stationId: assets.stationId,
    nameAr: assets.nameAr,
    categoryId: assets.categoryId,
  }).from(assets).where(and(...assetConditions));
  
  const createdOrders: number[] = [];
  
  for (const asset of assetsList) {
    const orderNumber = `WO-${Date.now()}-${asset.id}`;
    
    const result = await db.insert(workOrders).values({
      businessId: plan.businessId,
      branchId: asset.branchId,
      stationId: asset.stationId,
      orderNumber,
      type: "preventive",
      priority: "medium",
      status: "pending",
      assetId: asset.id,
      title: `${plan.nameAr} - ${asset.nameAr}`,
      description: plan.description,
      scheduledStart: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
      estimatedHours: plan.estimatedHours,
      estimatedCost: plan.estimatedCost,
      createdBy: data.userId,
    });
    
    createdOrders.push(result[0].insertId);
    
    // Create tasks from plan
    if (plan.tasks) {
      const tasks = typeof plan.tasks === "string" ? JSON.parse(plan.tasks) : plan.tasks;
      for (let i = 0; i < tasks.length; i++) {
        await db.insert(workOrderTasks).values({
          workOrderId: result[0].insertId,
          taskNumber: i + 1,
          description: tasks[i].description,
          estimatedHours: tasks[i].estimatedHours,
          status: "pending",
        });
      }
    }
  }
  
  return { count: createdOrders.length, orderIds: createdOrders };
}

// Technicians (using employees or field workers)
export async function getTechnicians(businessId: number, filters?: any) {
  const db = await getDb();
  if (!db) return [];
  
  // Return employees who can be technicians
  return await db.select({
    id: employees.id,
    businessId: employees.businessId,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
    phone: employees.phone,
    email: employees.email,
    status: employees.status,
  }).from(employees)
    .where(and(eq(employees.businessId, businessId), eq(employees.status, "active")))
    .orderBy(asc(employees.firstName));
}

export async function getTechnicianById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select({
    id: employees.id,
    businessId: employees.businessId,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
    phone: employees.phone,
    email: employees.email,
    status: employees.status,
  }).from(employees).where(eq(employees.id, id));
  return result || null;
}

export async function createTechnician(data: any) {
  // Create as employee
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(employees).values({
    businessId: data.businessId,
    employeeNumber: data.code,
    firstName: data.nameAr,
    lastName: "",
    phone: data.phone,
    email: data.email,
    status: "active",
  });
  
  return result[0].insertId;
}

export async function updateTechnician(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  if (data.nameAr) updateData.firstName = data.nameAr;
  if (data.phone) updateData.phone = data.phone;
  if (data.email) updateData.email = data.email;
  if (data.isActive !== undefined) updateData.status = data.isActive ? "active" : "inactive";
  
  await db.update(employees).set(updateData).where(eq(employees.id, id));
}

export async function deleteTechnician(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set({ status: "inactive" }).where(eq(employees.id, id));
}

export async function getTechnicianWorkload(data: { technicianId: number; startDate?: string; endDate?: string }) {
  const db = await getDb();
  if (!db) return { assignedOrders: 0, completedOrders: 0, totalHours: 0 };
  
  const [assigned] = await db.select({ count: count() }).from(workOrders)
    .where(and(eq(workOrders.assignedTo, data.technicianId), ne(workOrders.status, "completed"), ne(workOrders.status, "cancelled")));
  
  const [completed] = await db.select({ count: count() }).from(workOrders)
    .where(and(eq(workOrders.assignedTo, data.technicianId), eq(workOrders.status, "completed")));
  
  const [hours] = await db.select({ total: sql<number>`COALESCE(SUM(actual_hours), 0)` }).from(workOrders)
    .where(eq(workOrders.assignedTo, data.technicianId));
  
  return {
    assignedOrders: assigned?.count || 0,
    completedOrders: completed?.count || 0,
    totalHours: hours?.total || 0,
  };
}

export async function getWorkOrderSpareParts(workOrderId: number) {
  // See GitHub Issue #6
  return [];
}

export async function addSparePartToWorkOrder(data: any) {
  // See GitHub Issue #6
  return 0;
}

export async function removeSparePartFromWorkOrder(id: number) {
  // See GitHub Issue #6
}

export async function getMaintenanceDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalWorkOrders: 0, pendingOrders: 0, completedOrders: 0, activePlans: 0 };
  
  const [total] = await db.select({ count: count() }).from(workOrders).where(eq(workOrders.businessId, businessId));
  const [pending] = await db.select({ count: count() }).from(workOrders).where(and(eq(workOrders.businessId, businessId), eq(workOrders.status, "pending")));
  const [completed] = await db.select({ count: count() }).from(workOrders).where(and(eq(workOrders.businessId, businessId), eq(workOrders.status, "completed")));
  const [plans] = await db.select({ count: count() }).from(maintenancePlans).where(and(eq(maintenancePlans.businessId, businessId), eq(maintenancePlans.isActive, true)));
  
  return {
    totalWorkOrders: total?.count || 0,
    pendingOrders: pending?.count || 0,
    completedOrders: completed?.count || 0,
    activePlans: plans?.count || 0,
  };
}

export async function getWorkOrderSummaryReport(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    status: workOrders.status,
    count: count(),
  }).from(workOrders)
    .where(eq(workOrders.businessId, businessId))
    .groupBy(workOrders.status);
}

export async function getMaintenanceCostsReport(businessId: number, filters: any) {
  const db = await getDb();
  if (!db) return { totalCost: 0, laborCost: 0, partsCost: 0 };
  
  const [costs] = await db.select({
    totalCost: sql<number>`COALESCE(SUM(actual_cost), 0)`,
    laborCost: sql<number>`COALESCE(SUM(labor_cost), 0)`,
    partsCost: sql<number>`COALESCE(SUM(parts_cost), 0)`,
  }).from(workOrders)
    .where(and(eq(workOrders.businessId, businessId), eq(workOrders.status, "completed")));
  
  return costs || { totalCost: 0, laborCost: 0, partsCost: 0 };
}

export async function getEquipmentDowntimeReport(businessId: number, filters: any) {
  // See GitHub Issue #7
  return [];
}


