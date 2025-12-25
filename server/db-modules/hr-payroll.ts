// مسيرات الرواتب - Payroll
export async function getPayrollRuns(businessId: number, year?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(payrollRuns.businessId, businessId)];
  if (year) conditions.push(eq(payrollRuns.periodYear, year));

  return await db.select({
    id: payrollRuns.id,
    businessId: payrollRuns.businessId,
    code: payrollRuns.code,
    periodYear: payrollRuns.periodYear,
    periodMonth: payrollRuns.periodMonth,
    status: payrollRuns.status,
    totalGross: payrollRuns.totalGross,
    totalDeductions: payrollRuns.totalDeductions,
    totalNet: payrollRuns.totalNet,
    createdAt: payrollRuns.createdAt,
  }).from(payrollRuns)
    .where(and(...conditions))
    .orderBy(desc(payrollRuns.periodYear), desc(payrollRuns.periodMonth));
}

export async function createPayrollRun(data: InsertPayrollRun) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(payrollRuns).values(data);
  const [created] = await db.select({
    id: payrollRuns.id,
    code: payrollRuns.code,
    periodYear: payrollRuns.periodYear,
    periodMonth: payrollRuns.periodMonth,
    status: payrollRuns.status,
  }).from(payrollRuns).where(eq(payrollRuns.code, data.code)).limit(1);
  return created;
}

export async function getPayrollItems(payrollRunId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: payrollItems.id,
    payrollRunId: payrollItems.payrollRunId,
    employeeId: payrollItems.employeeId,
    basicSalary: payrollItems.basicSalary,
    totalAllowances: payrollItems.totalAllowances,
    totalDeductions: payrollItems.totalDeductions,
    netSalary: payrollItems.netSalary,
    status: payrollItems.status,
  }).from(payrollItems).where(eq(payrollItems.payrollRunId, payrollRunId));
}

export async function createPayrollItem(data: InsertPayrollItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payrollItems).values(data);
  return result[0].insertId;
}

export async function updatePayrollRun(id: number, data: Partial<InsertPayrollRun>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payrollRuns).set(data).where(eq(payrollRuns.id, id));
}

// الحضور والانصراف - Attendance
export async function getAttendance(businessId: number, filters?: {
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(attendance.businessId, businessId)];
  if (filters?.employeeId) conditions.push(eq(attendance.employeeId, filters.employeeId));

  return await db.select({
    id: attendance.id,
    businessId: attendance.businessId,
    employeeId: attendance.employeeId,
    attendanceDate: attendance.attendanceDate,
    checkIn: attendance.checkIn,
    checkOut: attendance.checkOut,
    status: attendance.status,
    workHours: attendance.workHours,
  }).from(attendance)
    .where(and(...conditions))
    .orderBy(desc(attendance.attendanceDate));
}

export async function createAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(attendance).values(data);
  const [created] = await db.select({
    id: attendance.id,
    employeeId: attendance.employeeId,
    attendanceDate: attendance.attendanceDate,
    checkIn: attendance.checkIn,
    status: attendance.status,
  }).from(attendance)
    .where(and(eq(attendance.employeeId, data.employeeId), eq(attendance.attendanceDate, data.attendanceDate)))
    .limit(1);
  return created;
}

export async function updateAttendance(id: number, data: Partial<InsertAttendance>) {
  const db = await getDb();
  if (!db) return;
  await db.update(attendance).set(data).where(eq(attendance.id, id));
}

export async function getTodayAttendance(employeeId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: attendance.id,
    employeeId: attendance.employeeId,
    attendanceDate: attendance.attendanceDate,
    checkIn: attendance.checkIn,
    checkOut: attendance.checkOut,
    status: attendance.status,
  }).from(attendance)
    .where(and(eq(attendance.employeeId, employeeId), eq(attendance.attendanceDate, date)));
  return result[0] || null;
}

// أنواع الإجازات - Leave Types
export async function getLeaveTypes(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: leaveTypes.id,
    businessId: leaveTypes.businessId,
    code: leaveTypes.code,
    nameAr: leaveTypes.nameAr,
    nameEn: leaveTypes.nameEn,
    defaultDays: leaveTypes.defaultDays,
    isPaid: leaveTypes.isPaid,
    isActive: leaveTypes.isActive,
  }).from(leaveTypes).where(eq(leaveTypes.businessId, businessId)).orderBy(asc(leaveTypes.nameAr));
}

export async function createLeaveType(data: InsertLeaveType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaveTypes).values(data);
  const [created] = await db.select({
    id: leaveTypes.id,
    code: leaveTypes.code,
    nameAr: leaveTypes.nameAr,
  }).from(leaveTypes).where(eq(leaveTypes.code, data.code)).limit(1);
  return created;
}

// طلبات الإجازات - Leave Requests
export async function getLeaveRequests(businessId: number, filters?: {
  employeeId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(leaveRequests.businessId, businessId)];
  if (filters?.employeeId) conditions.push(eq(leaveRequests.employeeId, filters.employeeId));
  if (filters?.status) conditions.push(eq(leaveRequests.status, filters.status as any));

  return await db.select({
    id: leaveRequests.id,
    businessId: leaveRequests.businessId,
    employeeId: leaveRequests.employeeId,
    leaveTypeId: leaveRequests.leaveTypeId,
    startDate: leaveRequests.startDate,
    endDate: leaveRequests.endDate,
    totalDays: leaveRequests.totalDays,
    status: leaveRequests.status,
    createdAt: leaveRequests.createdAt,
  }).from(leaveRequests)
    .where(and(...conditions))
    .orderBy(desc(leaveRequests.createdAt));
}

export async function createLeaveRequest(data: InsertLeaveRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaveRequests).values(data);
  const [created] = await db.select({
    id: leaveRequests.id,
    employeeId: leaveRequests.employeeId,
    startDate: leaveRequests.startDate,
    status: leaveRequests.status,
  }).from(leaveRequests)
    .where(and(eq(leaveRequests.employeeId, data.employeeId), eq(leaveRequests.startDate, data.startDate)))
    .orderBy(desc(leaveRequests.id))
    .limit(1);
  return created;
}

export async function updateLeaveRequest(id: number, data: Partial<InsertLeaveRequest>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id));
}

export async function getLeaveRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: leaveRequests.id,
    businessId: leaveRequests.businessId,
    employeeId: leaveRequests.employeeId,
    leaveTypeId: leaveRequests.leaveTypeId,
    startDate: leaveRequests.startDate,
    endDate: leaveRequests.endDate,
    totalDays: leaveRequests.totalDays,
    reason: leaveRequests.reason,
    status: leaveRequests.status,
    approvedBy: leaveRequests.approvedBy,
    approvedAt: leaveRequests.approvedAt,
    createdAt: leaveRequests.createdAt,
  }).from(leaveRequests).where(eq(leaveRequests.id, id));
  return result[0] || null;
}

