import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

/**
 * @fileoverview Router لنظام الموارد البشرية
 * @module hrRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام الموارد البشرية
 * بما في ذلك إدارة الأقسام، المسميات الوظيفية، سلم الرواتب، الموظفين،
 * الرواتب، الحضور، الإجازات، العقود، والتقييمات.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================
// HR Router - نظام الموارد البشرية
// ============================================

export const hrRouter = router({
  // ============================================
  /**
   * @namespace departments
   * @description إدارة الأقسام - يتيح إنشاء وتعديل وحذف الأقسام
   * مع دعم الهيكل الهرمي ومراكز التكلفة.
   */
  // الأقسام - Departments
  // ============================================
  departments: router({
    /**
     * استرجاع قائمة الأقسام
     * 
     * @procedure list
     * @description يسترجع قائمة أقسام الشركة مع الهيكل الهرمي.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * 
     * @returns {Promise<Department[]>} قائمة الأقسام
     */
    list: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDepartments(input.businessId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        managerId: z.number().optional(),
        costCenterId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createDepartment(input);
        return { id, ...input };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        managerId: z.number().optional(),
        costCenterId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateDepartment(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDepartment(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  /**
   * @namespace jobTitles
   * @description إدارة المسميات الوظيفية - يتيح تعريف الوظائف
   * مع المتطلبات والمسؤوليات والدرجات الوظيفية.
   */
  // المسميات الوظيفية - Job Titles
  // ============================================
  jobTitles: router({
    /**
     * استرجاع قائمة المسميات الوظيفية
     * 
     * @procedure list
     * @description يسترجع قائمة المسميات الوظيفية للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * 
     * @returns {Promise<JobTitle[]>} قائمة المسميات الوظيفية
     */
    list: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getJobTitles(input.businessId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string(),
        titleAr: z.string(),
        titleEn: z.string().optional(),
        departmentId: z.number().optional(),
        gradeId: z.number().optional(),
        level: z.number().optional(),
        description: z.string().optional(),
        responsibilities: z.string().optional(),
        requirements: z.string().optional(),
        headcount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createJobTitle(input);
        return { id, ...input };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        titleAr: z.string().optional(),
        titleEn: z.string().optional(),
        departmentId: z.number().optional(),
        gradeId: z.number().optional(),
        level: z.number().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateJobTitle(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJobTitle(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  /**
   * @namespace salaryGrades
   * @description إدارة سلم الرواتب - يتيح تعريف الدرجات الوظيفية
   * مع نطاقات الرواتب والبدلات.
   */
  // سلم الرواتب - Salary Grades
  // ============================================
  salaryGrades: router({
    /**
     * استرجاع قائمة درجات الرواتب
     * 
     * @procedure list
     * @description يسترجع قائمة درجات سلم الرواتب للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * 
     * @returns {Promise<SalaryGrade[]>} قائمة درجات الرواتب
     */
    list: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSalaryGrades(input.businessId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string(),
        name: z.string(),
        minSalary: z.string().optional(),
        maxSalary: z.string().optional(),
        housingAllowancePct: z.string().optional(),
        transportAllowance: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createSalaryGrade(input);
        return { id, ...input };
      }),
  }),

  // ============================================
  /**
   * @namespace employees
   * @description إدارة الموظفين - يتيح تسجيل وتعديل بيانات الموظفين
   * الشخصية والوظيفية مع ربطهم بالأقسام والعمال الميدانيين.
   */
  // الموظفين - Employees
  // ============================================
  employees: router({
    /**
     * استرجاع قائمة الموظفين
     * 
     * @procedure list
     * @description يسترجع قائمة موظفي الشركة مع إمكانية الفلترة
     * حسب القسم أو الحالة أو البحث النصي.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {number} [input.departmentId] - معرف القسم للفلترة
     * @param {string} [input.status] - حالة الموظف للفلترة
     * @param {string} [input.search] - نص البحث
     * 
     * @returns {Promise<Employee[]>} قائمة الموظفين
     */
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        departmentId: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getEmployees(input.businessId, input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployeeById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        employeeNumber: z.string(),
        firstName: z.string(),
        middleName: z.string().optional(),
        lastName: z.string(),
        fullNameAr: z.string().optional(),
        fullNameEn: z.string().optional(),
        idType: z.enum(["national_id", "passport", "residence"]).optional(),
        idNumber: z.string(),
        idExpiryDate: z.string().optional(),
        nationality: z.string().optional(),
        gender: z.enum(["male", "female"]).optional(),
        dateOfBirth: z.string().optional(),
        placeOfBirth: z.string().optional(),
        maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
        phone: z.string().optional(),
        mobile: z.string(),
        email: z.string().optional(),
        personalEmail: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        emergencyContactRelation: z.string().optional(),
        photoPath: z.string().optional(),
        hireDate: z.string(),
        probationEndDate: z.string().optional(),
        contractType: z.enum(["permanent", "contract", "temporary", "part_time"]).optional(),
        contractStartDate: z.string().optional(),
        contractEndDate: z.string().optional(),
        jobTitleId: z.number().optional(),
        departmentId: z.number().optional(),
        managerId: z.number().optional(),
        isManager: z.boolean().optional(),
        workLocation: z.string().optional(),
        stationId: z.number().optional(),
        branchId: z.number().optional(),
        workSchedule: z.enum(["full_time", "shift", "flexible"]).optional(),
        workingHoursPerWeek: z.string().optional(),
        fieldWorkerId: z.number().optional(),
        status: z.enum(["active", "inactive", "terminated", "suspended", "on_leave"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const insertData: any = { ...input };
        if (input.hireDate) insertData.hireDate = new Date(input.hireDate);
        if (input.dateOfBirth) insertData.dateOfBirth = new Date(input.dateOfBirth);
        if (input.idExpiryDate) insertData.idExpiryDate = new Date(input.idExpiryDate);
        if (input.probationEndDate) insertData.probationEndDate = new Date(input.probationEndDate);
        if (input.contractStartDate) insertData.contractStartDate = new Date(input.contractStartDate);
        if (input.contractEndDate) insertData.contractEndDate = new Date(input.contractEndDate);

        const id = await db.createEmployee(insertData);
        return { id, ...input };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        employeeNumber: z.string().optional(),
        firstName: z.string().optional(),
        middleName: z.string().optional(),
        lastName: z.string().optional(),
        fullNameAr: z.string().optional(),
        fullNameEn: z.string().optional(),
        idType: z.enum(["national_id", "passport", "residence"]).optional(),
        idNumber: z.string().optional(),
        nationality: z.string().optional(),
        gender: z.enum(["male", "female"]).optional(),
        maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        jobTitleId: z.number().optional(),
        departmentId: z.number().optional(),
        managerId: z.number().optional(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        fieldWorkerId: z.number().optional(),
        status: z.enum(["active", "inactive", "terminated", "suspended", "on_leave"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateEmployee(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEmployee(input.id);
        return { success: true };
      }),

    // ربط الموظف بالعامل الميداني
    linkToFieldWorker: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        fieldWorkerId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.linkEmployeeToFieldWorker(input.employeeId, input.fieldWorkerId);
        return { success: true };
      }),

    // إلغاء ربط الموظف بالعامل الميداني
    unlinkFromFieldWorker: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .mutation(async ({ input }) => {
        await db.unlinkEmployeeFromFieldWorker(input.employeeId);
        return { success: true };
      }),

    // الحصول على الموظفين غير المرتبطين بعاملين ميدانيين
    getUnlinked: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUnlinkedEmployees(input.businessId);
      }),
  }),

