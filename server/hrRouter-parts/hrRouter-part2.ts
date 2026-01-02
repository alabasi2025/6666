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
    /**
     * استرجاع قائمة مسيرات الرواتب
     * 
     * @procedure list
     * @description يسترجع قائمة مسيرات الرواتب الشهرية.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {number} [input.year] - السنة للفلترة
     * @param {number} [input.month] - الشهر للفلترة
     * 
     * @returns {Promise<PayrollRun[]>} قائمة مسيرات الرواتب
     */
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
  /**
   * @namespace attendance
   * @description إدارة الحضور والانصراف - يتيح تسجيل وتتبع
   * أوقات حضور وانصراف الموظفين.
   */
  // الحضور والانصراف - Attendance
  // ============================================
  attendance: router({
    /**
     * استرجاع سجلات الحضور
     * 
     * @procedure list
     * @description يسترجع سجلات حضور الموظفين مع إمكانية الفلترة
     * حسب الموظف أو الفترة الزمنية.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {number} [input.employeeId] - معرف الموظف للفلترة
     * @param {string} [input.fromDate] - تاريخ البداية
     * @param {string} [input.toDate] - تاريخ النهاية
     * 
     * @returns {Promise<AttendanceRecord[]>} سجلات الحضور
     */
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
  /**
   * @namespace leaves
   * @description إدارة الإجازات - يتيح تقديم واعتماد طلبات الإجازات
   * مع تتبع الرصيد المتبقي.
   */
  // الإجازات - Leaves
  // ============================================
  leaveTypes: router({
    /**
     * استرجاع قائمة أنواع الإجازات
     * 
     * @procedure list
     * @description يسترجع قائمة أنواع الإجازات المعرفة للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * 
     * @returns {Promise<LeaveType[]>} قائمة أنواع الإجازات
     */
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
    /**
     * استرجاع قائمة التقييمات
     * 
     * @procedure list
     * @description يسترجع قائمة تقييمات أداء الموظفين.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {number} [input.employeeId] - معرف الموظف للفلترة
     * 
     * @returns {Promise<EmployeeEvaluation[]>} قائمة التقييمات
     */
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
