// أرصدة الإجازات - Leave Balances
export async function getLeaveBalance(employeeId: number, leaveTypeId: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: leaveBalances.id,
    employeeId: leaveBalances.employeeId,
    leaveTypeId: leaveBalances.leaveTypeId,
    year: leaveBalances.year,
    entitlement: leaveBalances.entitlement,
    used: leaveBalances.used,
    remaining: leaveBalances.remaining,
  }).from(leaveBalances)
    .where(and(
      eq(leaveBalances.employeeId, employeeId),
      eq(leaveBalances.leaveTypeId, leaveTypeId),
      eq(leaveBalances.year, year)
    ));
  return result[0] || null;
}

export async function updateLeaveBalance(id: number, data: Partial<InsertLeaveBalance>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveBalances).set(data).where(eq(leaveBalances.id, id));
}

// تقييمات الأداء - Performance Evaluations
export async function getPerformanceEvaluations(businessId: number, employeeId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(performanceEvaluations.businessId, businessId)];
  if (employeeId) conditions.push(eq(performanceEvaluations.employeeId, employeeId));

  return await db.select({
    id: performanceEvaluations.id,
    businessId: performanceEvaluations.businessId,
    employeeId: performanceEvaluations.employeeId,
    evaluatorId: performanceEvaluations.evaluatorId,
    evaluationPeriod: performanceEvaluations.evaluationPeriod,
    overallScore: performanceEvaluations.overallScore,
    status: performanceEvaluations.status,
    createdAt: performanceEvaluations.createdAt,
  }).from(performanceEvaluations)
    .where(and(...conditions))
    .orderBy(desc(performanceEvaluations.createdAt));
}

export async function createPerformanceEvaluation(data: InsertPerformanceEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(performanceEvaluations).values(data);
  return result[0].insertId;
}

// إحصائيات الموارد البشرية
export async function getHRDashboardStats(businessId: number) {
  const db = await getDb();
  if (!db) return { totalEmployees: 0, activeEmployees: 0, pendingLeaves: 0, totalDepartments: 0 };

  const [totalEmployees] = await db.select({ count: count() }).from(employees).where(eq(employees.businessId, businessId));
  const [activeEmployees] = await db.select({ count: count() }).from(employees).where(and(eq(employees.businessId, businessId), eq(employees.status, "active")));
  const [pendingLeaves] = await db.select({ count: count() }).from(leaveRequests).where(and(eq(leaveRequests.businessId, businessId), eq(leaveRequests.status, "pending")));
  const [totalDepartments] = await db.select({ count: count() }).from(departments).where(eq(departments.businessId, businessId));

  return {
    totalEmployees: totalEmployees?.count || 0,
    activeEmployees: activeEmployees?.count || 0,
    pendingLeaves: pendingLeaves?.count || 0,
    totalDepartments: totalDepartments?.count || 0,
  };
}

