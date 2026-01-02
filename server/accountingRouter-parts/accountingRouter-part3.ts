  // ============================================
  // Cost Centers - مراكز التكلفة
  // ============================================
  costCenters: router({
    /**
     * استرجاع قائمة مراكز التكلفة
     * 
     * @procedure list
     * @description يسترجع قائمة مراكز التكلفة للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * 
     * @returns {Promise<CostCenter[]>} قائمة مراكز التكلفة
     * 
     * @example
     * // استرجاع مراكز التكلفة
     * const centers = await trpc.accounting.costCenters.list({ businessId: 1 });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCostCenters(input.businessId || 1);
      }),

    /**
     * إنشاء مركز تكلفة جديد
     * 
     * @procedure create
     * @description ينشئ مركز تكلفة جديد مع إمكانية ربطه بمركز أب.
     * 
     * @param {object} input - بيانات مركز التكلفة الجديد
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} input.code - رمز مركز التكلفة
     * @param {string} input.nameAr - الاسم بالعربية
     * @param {string} [input.nameEn] - الاسم بالإنجليزية
     * @param {number} [input.parentId] - معرف المركز الأب
     * @param {string} [input.type] - نوع المركز
     * @param {number} [input.managerId] - معرف المدير المسؤول
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف المركز
     * 
     * @example
     * // إنشاء مركز تكلفة
     * const result = await trpc.accounting.costCenters.create({
     *   code: "CC001",
     *   nameAr: "قسم المبيعات",
     *   type: "department"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.string().optional(),
        managerId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCostCenter({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    /**
     * تحديث مركز تكلفة
     * 
     * @procedure update
     * @description يحدث بيانات مركز تكلفة موجود.
     * 
     * @param {object} input - بيانات التحديث
     * @param {number} input.id - معرف المركز المراد تحديثه
     * @param {string} [input.code] - الرمز الجديد
     * @param {string} [input.nameAr] - الاسم العربي الجديد
     * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
     * @param {number} [input.parentId] - معرف المركز الأب الجديد
     * @param {string} [input.type] - النوع الجديد
     * @param {number} [input.managerId] - معرف المدير الجديد
     * @param {boolean} [input.isActive] - حالة النشاط
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // تحديث مركز تكلفة
     * await trpc.accounting.costCenters.update({
     *   id: 1,
     *   nameAr: "قسم المبيعات والتسويق"
     * });
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        parentId: z.number().optional(),
        type: z.string().optional(),
        managerId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCostCenter(id, data);
        return { success: true };
      }),

    /**
     * حذف مركز تكلفة
     * 
     * @procedure delete
     * @description يحذف مركز تكلفة. يجب التأكد من عدم وجود قيود مرتبطة.
     * 
     * @param {object} input - معاملات الحذف
     * @param {number} input.id - معرف المركز المراد حذفه
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // حذف مركز تكلفة
     * await trpc.accounting.costCenters.delete({ id: 1 });
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCostCenter(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Reports - التقارير
  // ============================================
  reports: router({
    /**
     * تقرير ميزان المراجعة
     * 
     * @procedure trialBalance
     * @description يولد تقرير ميزان المراجعة الذي يعرض أرصدة جميع الحسابات
     * في تاريخ محدد أو لفترة محاسبية معينة.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {string} [input.asOfDate] - التاريخ المطلوب
     * 
     * @returns {Promise<TrialBalanceReport>} تقرير ميزان المراجعة
     * 
     * @example
     * // استخراج ميزان المراجعة
     * const report = await trpc.accounting.reports.trialBalance({
     *   businessId: 1,
     *   asOfDate: "2024-12-31"
     * });
     */
    trialBalance: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        asOfDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTrialBalance(input.businessId || 1, input);
      }),

    /**
     * تقرير دفتر الأستاذ العام
     * 
     * @procedure generalLedger
     * @description يولد تقرير دفتر الأستاذ العام الذي يعرض جميع الحركات
     * على حساب معين أو جميع الحسابات في فترة زمنية محددة.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.accountId] - معرف الحساب (اختياري لجميع الحسابات)
     * @param {string} [input.startDate] - تاريخ البداية
     * @param {string} [input.endDate] - تاريخ النهاية
     * 
     * @returns {Promise<GeneralLedgerReport>} تقرير دفتر الأستاذ
     * 
     * @example
     * // استخراج دفتر الأستاذ لحساب معين
     * const report = await trpc.accounting.reports.generalLedger({
     *   businessId: 1,
     *   accountId: 1101,
     *   startDate: "2024-01-01",
     *   endDate: "2024-12-31"
     * });
     */
    generalLedger: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        accountId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getGeneralLedger(input.businessId || 1, input);
      }),

    /**
     * تقرير قائمة الدخل
     * 
     * @procedure incomeStatement
     * @description يولد تقرير قائمة الدخل (الأرباح والخسائر) الذي يعرض
     * الإيرادات والمصروفات وصافي الربح لفترة محددة.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {string} [input.startDate] - تاريخ البداية
     * @param {string} [input.endDate] - تاريخ النهاية
     * 
     * @returns {Promise<IncomeStatementReport>} تقرير قائمة الدخل
     * 
     * @example
     * // استخراج قائمة الدخل
     * const report = await trpc.accounting.reports.incomeStatement({
     *   businessId: 1,
     *   startDate: "2024-01-01",
     *   endDate: "2024-12-31"
     * });
     */
    incomeStatement: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getIncomeStatement(input.businessId || 1, input);
      }),

    /**
     * تقرير الميزانية العمومية
     * 
     * @procedure balanceSheet
     * @description يولد تقرير الميزانية العمومية (قائمة المركز المالي)
     * الذي يعرض الأصول والخصوم وحقوق الملكية في تاريخ محدد.
     * 
     * @param {object} input - معاملات التقرير
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {string} [input.asOfDate] - التاريخ المطلوب
     * 
     * @returns {Promise<BalanceSheetReport>} تقرير الميزانية العمومية
     * 
     * @example
     * // استخراج الميزانية العمومية
     * const report = await trpc.accounting.reports.balanceSheet({
     *   businessId: 1,
     *   asOfDate: "2024-12-31"
     * });
     */
    balanceSheet: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        asOfDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getBalanceSheet(input.businessId || 1, input);
      }),
  }),

  // ============================================
  // Dashboard Stats - إحصائيات لوحة التحكم
  // ============================================
  /**
   * إحصائيات لوحة التحكم المحاسبية
   * 
   * @procedure dashboardStats
   * @description يسترجع إحصائيات ملخصة للنظام المحاسبي تشمل
   * إجمالي الأصول، الخصوم، الإيرادات، المصروفات، وصافي الربح.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
   * 
   * @returns {Promise<AccountingDashboardStats>} إحصائيات لوحة التحكم
   * 
   * @example
   * // استرجاع إحصائيات لوحة التحكم
   * const stats = await trpc.accounting.dashboardStats({ businessId: 1 });
   */
  dashboardStats: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAccountingDashboardStats(input.businessId || 1);
    }),
});
