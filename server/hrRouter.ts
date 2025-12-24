import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

// ============================================
// HR Router - نظام الموارد البشرية
// ============================================

export const hrRouter = router({
  // ============================================
  // الأقسام - Departments
  // ============================================
  departments: router({
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
  // المسميات الوظيفية - Job Titles
  // ============================================
  jobTitles: router({
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
  // سلم الرواتب - Salary Grades
  // ============================================
  salaryGrades: router({
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
  // الموظفين - Employees
  // ============================================
  employees: router({
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

  // ============================================
  // بيانات الراتب - Salary Details
  // ============================================
  salaryDetails: router({
    getByEmployee: publicProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSalaryDetailsByEmployee(input.employeeId);
      }),

    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        basicSalary: z.string(),
        currency: z.string().optional(),
        housingAllowance: z.string().optional(),
        transportAllowance: z.string().optional(),
        foodAllowance: z.string().optional(),
        phoneAllowance: z.string().optional(),
        otherAllowances: z.string().optional(),
        paymentMethod: z.enum(["bank_transfer", "cash", "check"]).optional(),
        bankName: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        iban: z.string().optional(),
        effectiveDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        // حساب إجمالي الراتب
        const totalSalary = (
          parseFloat(input.basicSalary || "0") +
          parseFloat(input.housingAllowance || "0") +
          parseFloat(input.transportAllowance || "0") +
          parseFloat(input.foodAllowance || "0") +
          parseFloat(input.phoneAllowance || "0") +
          parseFloat(input.otherAllowances || "0")
        ).toString();

        const insertData: any = {
          ...input,
          totalSalary,
          effectiveDate: new Date(input.effectiveDate),
        };

        const id = await db.createSalaryDetails(insertData);
        return { id, ...input };
      }),
  }),

  // ============================================
  // مسيرات الرواتب - Payroll
  // ============================================
  payroll: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        year: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPayrollRuns(input.businessId, input.year);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string(),
        periodYear: z.number(),
        periodMonth: z.number(),
        periodStartDate: z.string(),
        periodEndDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const insertData: any = {
          ...input,
          periodStartDate: new Date(input.periodStartDate),
          periodEndDate: new Date(input.periodEndDate),
        };

        const id = await db.createPayrollRun(insertData);
        return { id, ...input };
      }),

    calculate: protectedProcedure
      .input(z.object({ payrollRunId: z.number(), businessId: z.number() }))
      .mutation(async ({ input }) => {
        // الحصول على الموظفين النشطين
        const activeEmployees = await db.getEmployees(input.businessId, { status: "active" });

        let totalBasic = 0;
        let totalAllowances = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        for (const emp of activeEmployees) {
          // الحصول على بيانات الراتب
          const salary = await db.getSalaryDetailsByEmployee(emp.id);
          if (!salary) continue;

          const basicSalary = parseFloat(salary.basicSalary || "0");
          const allowances = parseFloat(salary.housingAllowance || "0") + parseFloat(salary.transportAllowance || "0") + parseFloat(salary.otherAllowances || "0");
          const deductions = 0;
          const netSalary = basicSalary + allowances - deductions;

          // إنشاء بند مسير الراتب
          await db.createPayrollItem({
            payrollRunId: input.payrollRunId,
            employeeId: emp.id,
            basicSalary: salary.basicSalary,
            housingAllowance: salary.housingAllowance,
            transportAllowance: salary.transportAllowance,
            otherAllowances: salary.otherAllowances,
            totalAllowances: allowances.toString(),
            totalDeductions: deductions.toString(),
            grossSalary: (basicSalary + allowances).toString(),
            netSalary: netSalary.toString(),
          });

          totalBasic += basicSalary;
          totalAllowances += allowances;
          totalDeductions += deductions;
          totalNet += netSalary;
        }

        // تحديث مسير الرواتب
        await db.updatePayrollRun(input.payrollRunId, {
          totalBasicSalary: totalBasic.toString(),
          totalAllowances: totalAllowances.toString(),
          totalDeductions: totalDeductions.toString(),
          totalNetSalary: totalNet.toString(),
          employeeCount: activeEmployees.length,
          status: "calculated",
          calculatedAt: new Date(),
        });

        return { success: true, employeeCount: activeEmployees.length };
      }),

    getItems: publicProcedure
      .input(z.object({ payrollRunId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPayrollItems(input.payrollRunId);
      }),
  }),

  // ============================================
  // الحضور والانصراف - Attendance
  // ============================================
  attendance: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        employeeId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAttendance(input.businessId, {
          employeeId: input.employeeId,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
      }),

    checkIn: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        businessId: z.number(),
        checkInLocation: z.string().optional(),
        checkInLatitude: z.string().optional(),
        checkInLongitude: z.string().optional(),
        checkInMethod: z.enum(["manual", "biometric", "gps", "qr_code"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // التحقق من عدم وجود تسجيل حضور اليوم
        const existing = await db.getTodayAttendance(input.employeeId, today);
        if (existing) {
          throw new Error("تم تسجيل الحضور مسبقاً لهذا اليوم");
        }

        const id = await db.createAttendance({
          employeeId: input.employeeId,
          businessId: input.businessId,
          attendanceDate: today,
          checkInTime: new Date(),
          checkInLocation: input.checkInLocation,
          checkInLatitude: input.checkInLatitude,
          checkInLongitude: input.checkInLongitude,
          checkInMethod: input.checkInMethod || "manual",
          status: "present",
        });

        return { id, success: true };
      }),

    checkOut: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        checkOutLocation: z.string().optional(),
        checkOutLatitude: z.string().optional(),
        checkOutLongitude: z.string().optional(),
        checkOutMethod: z.enum(["manual", "biometric", "gps", "qr_code"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await db.getTodayAttendance(input.employeeId, today);
        if (!record) {
          throw new Error("لم يتم تسجيل الحضور لهذا اليوم");
        }

        if (record.checkOut) {
          throw new Error("تم تسجيل الانصراف مسبقاً");
        }

        const checkOutTime = new Date();
        const checkInTime = new Date(record.checkIn!);
        const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        await db.updateAttendance(record.id, {
          checkOutTime,
          checkOutLocation: input.checkOutLocation,
          checkOutLatitude: input.checkOutLatitude,
          checkOutLongitude: input.checkOutLongitude,
          checkOutMethod: input.checkOutMethod || "manual",
          totalHours: totalHours.toFixed(2),
        });

        return { success: true, totalHours: totalHours.toFixed(2) };
      }),
  }),

  // ============================================
  // الإجازات - Leaves
  // ============================================
  leaveTypes: router({
    list: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLeaveTypes(input.businessId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        annualBalance: z.number().optional(),
        isPaid: z.boolean().optional(),
        requiresApproval: z.boolean().optional(),
        allowsCarryOver: z.boolean().optional(),
        maxCarryOverDays: z.number().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createLeaveType(input);
        return { id, ...input };
      }),
  }),

  leaveRequests: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        employeeId: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getLeaveRequests(input.businessId, input);
      }),

    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        businessId: z.number(),
        leaveTypeId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        totalDays: z.number(),
        reason: z.string().optional(),
        attachmentPath: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const insertData: any = {
          ...input,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        };

        const id = await db.createLeaveRequest(insertData);
        return { id, ...input };
      }),

    approve: protectedProcedure
      .input(z.object({
        id: z.number(),
        approvedBy: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateLeaveRequest(input.id, {
          status: "approved",
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
        });

        // تحديث رصيد الإجازات
        const request = await db.getLeaveRequestById(input.id);
        if (request) {
          const year = new Date().getFullYear();
          const balance = await db.getLeaveBalance(request.employeeId, request.leaveTypeId, year);
          if (balance) {
            await db.updateLeaveBalance(balance.id, {
              usedBalance: parseFloat(balance.used || "0") + request.totalDays,
              remainingBalance: parseFloat(balance.remaining || "0") - request.totalDays,
            });
          }
        }

        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({
        id: z.number(),
        rejectionReason: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateLeaveRequest(input.id, {
          status: "rejected",
          rejectionReason: input.rejectionReason,
        });

        return { success: true };
      }),
  }),

  // ============================================
  // تقييمات الأداء - Performance Evaluations
  // ============================================
  evaluations: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPerformanceEvaluations(input.businessId, input.employeeId);
      }),

    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        businessId: z.number(),
        evaluationPeriod: z.string(),
        periodStartDate: z.string(),
        periodEndDate: z.string(),
        overallScore: z.string().optional(),
        performanceRating: z.enum(["exceptional", "exceeds", "meets", "needs_improvement", "unsatisfactory"]).optional(),
        qualityScore: z.string().optional(),
        productivityScore: z.string().optional(),
        attendanceScore: z.string().optional(),
        teamworkScore: z.string().optional(),
        initiativeScore: z.string().optional(),
        strengths: z.string().optional(),
        areasForImprovement: z.string().optional(),
        goals: z.string().optional(),
        managerComments: z.string().optional(),
        evaluatedBy: z.number(),
      }))
      .mutation(async ({ input }) => {
        const insertData: any = {
          ...input,
          periodStartDate: new Date(input.periodStartDate),
          periodEndDate: new Date(input.periodEndDate),
          evaluatedAt: new Date(),
        };

        const id = await db.createPerformanceEvaluation(insertData);
        return { id, ...input };
      }),
  }),

  // ============================================
  // الإحصائيات - Statistics
  // ============================================
  stats: router({
    dashboard: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getHRDashboardStats(input.businessId);
      }),
  }),
});
