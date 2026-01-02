// ============================================
// نظام الموارد البشرية - HR System
// ============================================

// الأقسام - Departments
export async function getDepartments(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: departments.id,
    businessId: departments.businessId,
    code: departments.code,
    nameAr: departments.nameAr,
    nameEn: departments.nameEn,
    parentId: departments.parentId,
    managerId: departments.managerId,
    isActive: departments.isActive,
  }).from(departments).where(eq(departments.businessId, businessId)).orderBy(asc(departments.nameAr));
}

export async function createDepartment(data: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(departments).values(data);
  const [created] = await db.select({
    id: departments.id,
    code: departments.code,
    nameAr: departments.nameAr,
  }).from(departments).where(eq(departments.code, data.code)).limit(1);
  return created;
}

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(departments).where(eq(departments.id, id));
}

// المسميات الوظيفية - Job Titles
export async function getJobTitles(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: jobTitles.id,
    businessId: jobTitles.businessId,
    code: jobTitles.code,
    titleAr: jobTitles.titleAr,
    titleEn: jobTitles.titleEn,
    departmentId: jobTitles.departmentId,
    gradeId: jobTitles.gradeId,
    isActive: jobTitles.isActive,
  }).from(jobTitles).where(eq(jobTitles.businessId, businessId)).orderBy(asc(jobTitles.titleAr));
}

export async function createJobTitle(data: InsertJobTitle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobTitles).values(data);
  const [created] = await db.select({
    id: jobTitles.id,
    code: jobTitles.code,
    titleAr: jobTitles.titleAr,
  }).from(jobTitles).where(eq(jobTitles.code, data.code)).limit(1);
  return created;
}

export async function updateJobTitle(id: number, data: Partial<InsertJobTitle>) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobTitles).set(data).where(eq(jobTitles.id, id));
}

export async function deleteJobTitle(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobTitles).where(eq(jobTitles.id, id));
}

// سلم الرواتب - Salary Grades
export async function getSalaryGrades(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: salaryGrades.id,
    businessId: salaryGrades.businessId,
    code: salaryGrades.code,
    nameAr: salaryGrades.nameAr,
    nameEn: salaryGrades.nameEn,
    minSalary: salaryGrades.minSalary,
    maxSalary: salaryGrades.maxSalary,
    isActive: salaryGrades.isActive,
  }).from(salaryGrades).where(eq(salaryGrades.businessId, businessId)).orderBy(asc(salaryGrades.code));
}

export async function createSalaryGrade(data: InsertSalaryGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(salaryGrades).values(data);
  return result[0].insertId;
}

// الموظفين - Employees
export async function getEmployees(businessId: number, filters?: {
  departmentId?: number;
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(employees.businessId, businessId)];
  if (filters?.departmentId) conditions.push(eq(employees.departmentId, filters.departmentId));
  if (filters?.status) conditions.push(eq(employees.status, filters.status as any));

  return await db.select({
    id: employees.id,
    businessId: employees.businessId,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
    departmentId: employees.departmentId,
    jobTitleId: employees.jobTitleId,
    status: employees.status,
  }).from(employees).where(and(...conditions)).orderBy(desc(employees.createdAt));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: employees.id,
    businessId: employees.businessId,
    branchId: employees.branchId,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
    nationalId: employees.nationalId,
    dateOfBirth: employees.dateOfBirth,
    gender: employees.gender,
    nationality: employees.nationality,
    phone: employees.phone,
    email: employees.email,
    address: employees.address,
    departmentId: employees.departmentId,
    jobTitleId: employees.jobTitleId,
    managerId: employees.managerId,
    hireDate: employees.hireDate,
    status: employees.status,
    userId: employees.userId,
    fieldWorkerId: employees.fieldWorkerId,
    createdAt: employees.createdAt,
    updatedAt: employees.updatedAt,
  }).from(employees).where(eq(employees.id, id));
  return result[0] || null;
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(employees).values(data);
  const [created] = await db.select({
    id: employees.id,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
  }).from(employees).where(eq(employees.employeeNumber, data.employeeNumber)).limit(1);
  return created;
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set(data).where(eq(employees.id, id));
  const [updated] = await db.select({
    id: employees.id,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
  }).from(employees).where(eq(employees.id, id)).limit(1);
  return updated;
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(employees).where(eq(employees.id, id));
}

export async function getUnlinkedEmployees(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: employees.id,
    employeeNumber: employees.employeeNumber,
    firstName: employees.firstName,
    lastName: employees.lastName,
    departmentId: employees.departmentId,
    jobTitleId: employees.jobTitleId,
  }).from(employees)
    .where(and(eq(employees.businessId, businessId), isNull(employees.fieldWorkerId)))
    .orderBy(asc(employees.firstName));
}

export async function linkEmployeeToFieldWorker(employeeId: number, fieldWorkerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set({ fieldWorkerId }).where(eq(employees.id, employeeId));
  await db.update(fieldWorkers).set({ employeeId }).where(eq(fieldWorkers.id, fieldWorkerId));
}

export async function unlinkEmployeeFromFieldWorker(employeeId: number) {
  const db = await getDb();
  if (!db) return;
  
  const emp = await getEmployeeById(employeeId);
  if (emp?.fieldWorkerId) {
    await db.update(fieldWorkers).set({ employeeId: null }).where(eq(fieldWorkers.id, emp.fieldWorkerId));
  }
  await db.update(employees).set({ fieldWorkerId: null }).where(eq(employees.id, employeeId));
}

// بيانات الراتب - Salary Details
export async function getSalaryDetailsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    id: salaryDetails.id,
    employeeId: salaryDetails.employeeId,
    basicSalary: salaryDetails.basicSalary,
    housingAllowance: salaryDetails.housingAllowance,
    transportAllowance: salaryDetails.transportAllowance,
    otherAllowances: salaryDetails.otherAllowances,
    effectiveDate: salaryDetails.effectiveDate,
    isActive: salaryDetails.isActive,
  }).from(salaryDetails)
    .where(and(eq(salaryDetails.employeeId, employeeId), eq(salaryDetails.isActive, true)));
  return result[0] || null;
}

export async function createSalaryDetails(data: InsertSalaryDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // إلغاء تفعيل الراتب السابق
  await db.update(salaryDetails)
    .set({ isActive: false, endDate: data.effectiveDate })
    .where(and(eq(salaryDetails.employeeId, data.employeeId), eq(salaryDetails.isActive, true)));
  
  const result = await db.insert(salaryDetails).values(data);
  return result[0].insertId;
}

