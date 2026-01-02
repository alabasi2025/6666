  // ============================================
  journalEntries: router({
    /**
     * استرجاع قائمة القيود اليومية
     * 
     * @procedure list
     * @description يسترجع قائمة القيود اليومية مع إمكانية الفلترة
     * حسب الفترة المحاسبية، النوع، الحالة، أو نطاق التاريخ.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {string} [input.type] - نوع القيد
     * @param {string} [input.status] - حالة القيد
     * @param {string} [input.startDate] - تاريخ البداية للفلترة
     * @param {string} [input.endDate] - تاريخ النهاية للفلترة
     * @param {number} [input.limit=100] - الحد الأقصى للنتائج
     * 
     * @returns {Promise<JournalEntry[]>} قائمة القيود اليومية
     * 
     * @example
     * // استرجاع القيود لفترة محددة
     * const entries = await trpc.accounting.journalEntries.list({
     *   businessId: 1,
     *   periodId: 12,
     *   limit: 50
     * });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getJournalEntries(input.businessId || 1, input);
      }),

    /**
     * استرجاع قيد يومي بواسطة المعرف
     * 
     * @procedure getById
     * @description يسترجع بيانات قيد يومي محدد مع تفاصيل البنود.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.id - معرف القيد المطلوب
     * 
     * @returns {Promise<JournalEntry>} بيانات القيد مع البنود
     * 
     * @throws {TRPCError} NOT_FOUND - إذا كان القيد غير موجود
     * 
     * @example
     * // استرجاع قيد بمعرف محدد
     * const entry = await trpc.accounting.journalEntries.getById({ id: 1001 });
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const entry = await db.getJournalEntryById(input.id);
        if (!entry) {
          throw new TRPCError({ code: "NOT_FOUND", message: "القيد غير موجود" });
        }
        return entry;
      }),

    /**
     * إنشاء قيد يومي جديد
     * 
     * @procedure create
     * @description ينشئ قيد يومي جديد مع بنوده. يجب أن يكون القيد متوازن
     * (مجموع المدين = مجموع الدائن).
     * 
     * @param {object} input - بيانات القيد الجديد
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.branchId] - معرف الفرع
     * @param {string} input.entryDate - تاريخ القيد
     * @param {number} input.periodId - معرف الفترة المحاسبية
     * @param {string} [input.type] - نوع القيد (manual|auto|opening|closing|etc)
     * @param {string} [input.sourceModule] - الوحدة المصدر
     * @param {number} [input.sourceId] - معرف المستند المصدر
     * @param {string} [input.description] - وصف القيد
     * @param {Array} input.lines - بنود القيد
     * @param {number} input.lines[].accountId - معرف الحساب
     * @param {string} [input.lines[].debit] - المبلغ المدين
     * @param {string} [input.lines[].credit] - المبلغ الدائن
     * @param {string} [input.lines[].description] - وصف البند
     * @param {number} [input.lines[].costCenterId] - معرف مركز التكلفة
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف القيد
     * 
     * @throws {TRPCError} BAD_REQUEST - إذا كان القيد غير متوازن
     * 
     * @example
     * // إنشاء قيد يومي
     * const result = await trpc.accounting.journalEntries.create({
     *   entryDate: "2024-01-15",
     *   periodId: 1,
     *   description: "قيد مبيعات نقدية",
     *   lines: [
     *     { accountId: 1101, debit: "1000" },
     *     { accountId: 4101, credit: "1000" }
     *   ]
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        entryDate: z.string(),
        periodId: z.number(),
        type: z.enum([
          "manual", "auto", "opening", "closing", "adjustment",
          "invoice", "payment", "receipt", "transfer", "depreciation"
        ]).optional(),
        sourceModule: z.string().optional(),
        sourceId: z.number().optional(),
        description: z.string().optional(),
        lines: z.array(z.object({
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          description: z.string().optional(),
          costCenterId: z.number().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createJournalEntry({
          ...input,
          businessId: input.businessId || 1,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    /**
     * تحديث قيد يومي موجود
     * 
     * @procedure update
     * @description يحدث بيانات قيد يومي موجود. لا يمكن تحديث القيود المرحلة.
     * 
     * @param {object} input - بيانات التحديث
     * @param {number} input.id - معرف القيد المراد تحديثه
     * @param {string} [input.entryDate] - تاريخ القيد الجديد
     * @param {string} [input.description] - الوصف الجديد
     * @param {Array} [input.lines] - بنود القيد المحدثة
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} FORBIDDEN - إذا كان القيد مرحل
     * 
     * @example
     * // تحديث وصف قيد
     * await trpc.accounting.journalEntries.update({
     *   id: 1001,
     *   description: "قيد مبيعات نقدية - معدل"
     * });
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        entryDate: z.string().optional(),
        description: z.string().optional(),
        lines: z.array(z.object({
          id: z.number().optional(),
          accountId: z.number(),
          debit: z.string().optional(),
          credit: z.string().optional(),
          description: z.string().optional(),
          costCenterId: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateJournalEntry(id, data);
        return { success: true };
      }),

    /**
     * حذف قيد يومي
     * 
     * @procedure delete
     * @description يحذف قيد يومي. لا يمكن حذف القيود المرحلة.
     * 
     * @param {object} input - معاملات الحذف
     * @param {number} input.id - معرف القيد المراد حذفه
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} FORBIDDEN - إذا كان القيد مرحل
     * 
     * @example
     * // حذف قيد
     * await trpc.accounting.journalEntries.delete({ id: 1001 });
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteJournalEntry(input.id);
        return { success: true };
      }),

    /**
     * ترحيل قيد يومي
     * 
     * @procedure post
     * @description يرحل قيد يومي إلى دفتر الأستاذ. بعد الترحيل لا يمكن
     * تعديل أو حذف القيد.
     * 
     * @param {object} input - معاملات الترحيل
     * @param {number} input.id - معرف القيد المراد ترحيله
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @throws {TRPCError} BAD_REQUEST - إذا كان القيد مرحل مسبقاً
     * 
     * @example
     * // ترحيل قيد
     * await trpc.accounting.journalEntries.post({ id: 1001 });
     */
    post: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.postJournalEntry(input.id, ctx.user?.id || 1);
        return { success: true };
      }),

    /**
     * عكس قيد يومي
     * 
     * @procedure reverse
     * @description ينشئ قيد عكسي لقيد موجود. يستخدم لإلغاء أثر قيد مرحل.
     * 
     * @param {object} input - معاملات العكس
     * @param {number} input.id - معرف القيد المراد عكسه
     * @param {string} [input.reason] - سبب العكس
     * 
     * @returns {Promise<{success: boolean, newId: number}>} نتيجة العملية مع معرف القيد العكسي
     * 
     * @example
     * // عكس قيد
     * const result = await trpc.accounting.journalEntries.reverse({
     *   id: 1001,
     *   reason: "خطأ في تسجيل المبلغ"
     * });
     */
    reverse: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const newId = await db.reverseJournalEntry(input.id, ctx.user?.id || 1, input.reason);
        return { success: true, newId };
      }),
  }),

  // ============================================
  // Fiscal Periods - الفترات المحاسبية
  // ============================================
  fiscalPeriods: router({
    /**
     * استرجاع قائمة الفترات المحاسبية
     * 
     * @procedure list
     * @description يسترجع قائمة الفترات المحاسبية مع إمكانية الفلترة
     * حسب السنة أو الحالة.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.year] - السنة المالية
     * @param {string} [input.status] - حالة الفترة
     * 
     * @returns {Promise<FiscalPeriod[]>} قائمة الفترات المحاسبية
     * 
     * @example
     * // استرجاع فترات سنة 2024
     * const periods = await trpc.accounting.fiscalPeriods.list({
     *   businessId: 1,
     *   year: 2024
     * });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        year: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFiscalPeriods(input.businessId || 1, input);
      }),

    /**
     * إنشاء فترة محاسبية جديدة
     * 
     * @procedure create
     * @description ينشئ فترة محاسبية جديدة مع تحديد تواريخ البداية والنهاية.
     * 
     * @param {object} input - بيانات الفترة الجديدة
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} input.year - السنة المالية
     * @param {number} input.period - رقم الفترة
     * @param {string} input.nameAr - اسم الفترة بالعربية
     * @param {string} [input.nameEn] - اسم الفترة بالإنجليزية
     * @param {string} input.startDate - تاريخ بداية الفترة
     * @param {string} input.endDate - تاريخ نهاية الفترة
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الفترة
     * 
     * @example
     * // إنشاء فترة شهرية
     * const result = await trpc.accounting.fiscalPeriods.create({
     *   year: 2024,
     *   period: 1,
     *   nameAr: "يناير 2024",
     *   startDate: "2024-01-01",
     *   endDate: "2024-01-31"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        year: z.number(),
        period: z.number(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFiscalPeriod({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    /**
     * إغلاق فترة محاسبية
     * 
     * @procedure close
     * @description يغلق فترة محاسبية. بعد الإغلاق لا يمكن إضافة قيود جديدة للفترة.
     * 
     * @param {object} input - معاملات الإغلاق
     * @param {number} input.id - معرف الفترة المراد إغلاقها
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // إغلاق فترة
     * await trpc.accounting.fiscalPeriods.close({ id: 12 });
     */
    close: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.closeFiscalPeriod(input.id, ctx.user?.id || 1);
        return { success: true };
      }),

    /**
     * إعادة فتح فترة محاسبية
     * 
     * @procedure reopen
     * @description يعيد فتح فترة محاسبية مغلقة للسماح بإضافة قيود.
     * 
     * @param {object} input - معاملات إعادة الفتح
     * @param {number} input.id - معرف الفترة المراد إعادة فتحها
     * 
     * @returns {Promise<{success: boolean}>} نتيجة العملية
     * 
     * @example
     * // إعادة فتح فترة
     * await trpc.accounting.fiscalPeriods.reopen({ id: 12 });
     */
    reopen: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.reopenFiscalPeriod(input.id);
        return { success: true };
      }),
  }),

