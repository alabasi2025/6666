   * تحديث بيانات أصل ثابت
   * 
   * @procedure update
   * @description يحدث بيانات أصل ثابت موجود. يمكن تحديث أي من الحقول المتاحة.
   * 
   * @param {object} input - بيانات التحديث
   * @param {number} input.id - معرف الأصل المراد تحديثه
   * @param {number} [input.branchId] - معرف الفرع الجديد
   * @param {number} [input.stationId] - معرف المحطة الجديد
   * @param {number} [input.categoryId] - معرف الفئة الجديد
   * @param {string} [input.code] - الرمز الجديد
   * @param {string} [input.nameAr] - الاسم العربي الجديد
   * @param {string} [input.nameEn] - الاسم الإنجليزي الجديد
   * @param {string} [input.description] - الوصف الجديد
   * @param {string} [input.serialNumber] - الرقم التسلسلي الجديد
   * @param {string} [input.model] - الموديل الجديد
   * @param {string} [input.manufacturer] - الشركة المصنعة الجديدة
   * @param {string} [input.purchaseDate] - تاريخ الشراء الجديد
   * @param {string} [input.commissionDate] - تاريخ التشغيل الجديد
   * @param {string} [input.purchaseCost] - تكلفة الشراء الجديدة
   * @param {string} [input.currentValue] - القيمة الحالية الجديدة
   * @param {string} [input.salvageValue] - القيمة المتبقية الجديدة
   * @param {number} [input.usefulLife] - العمر الإنتاجي الجديد
   * @param {string} [input.depreciationMethod] - طريقة الإهلاك الجديدة
   * @param {string} [input.status] - الحالة الجديدة
   * @param {string} [input.location] - الموقع الجديد
   * @param {string} [input.warrantyExpiry] - تاريخ انتهاء الضمان الجديد
   * @param {number} [input.supplierId] - معرف المورد الجديد
   * @param {string} [input.image] - الصورة الجديدة
   * @param {object} [input.specifications] - المواصفات الفنية الجديدة
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   * 
   * @example
   * await trpc.assets.update({
   *   id: 101,
   *   status: "maintenance"
   * });
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      branchId: z.number().optional(),
      stationId: z.number().optional(),
      categoryId: z.number().optional(),
      code: z.string().optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.string().optional(),
      commissionDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      currentValue: z.string().optional(),
      salvageValue: z.string().optional(),
      usefulLife: z.number().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      status: z.enum(["active", "maintenance", "disposed", "transferred", "idle"]).optional(),
      location: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      supplierId: z.number().optional(),
      image: z.string().optional(),
      specifications: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAsset(id, data);
      return { success: true };
    }),

  /**
   * حذف أصل ثابت
   * 
   * @procedure delete
   * @description يحذف أصل ثابت من النظام. يفضل استخدام التصرف (disposal)
   * بدلاً من الحذف للحفاظ على السجلات التاريخية.
   * 
   * @param {object} input - معاملات الحذف
   * @param {number} input.id - معرف الأصل المراد حذفه
   * 
   * @returns {Promise<{success: boolean}>} نتيجة العملية
   * 
   * @example
   * await trpc.assets.delete({ id: 101 });
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteAsset(input.id);
      return { success: true };
    }),

  // ============================================
  // Asset Movements - حركات الأصول
  // ============================================
  movements: router({
    /**
     * استرجاع قائمة حركات الأصول
     * 
     * @procedure list
     * @description يسترجع سجل حركات الأصول مع إمكانية الفلترة حسب الأصل
     * أو نوع الحركة.
     * 
     * @param {object} input - معاملات الفلترة
     * @param {number} [input.assetId] - معرف الأصل للفلترة
     * @param {number} [input.businessId] - معرف الشركة
     * @param {string} [input.movementType] - نوع الحركة للفلترة
     * 
     * @returns {Promise<AssetMovement[]>} قائمة حركات الأصول
     * 
     * @example
     * const movements = await trpc.assets.movements.list({
     *   assetId: 101
     * });
     */
    list: protectedProcedure
      .input(z.object({
        assetId: z.number().optional(),
        businessId: z.number().optional(),
        movementType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAssetMovements(input);
      }),

    /**
     * تسجيل حركة أصل جديدة
     * 
     * @procedure create
     * @description يسجل حركة جديدة على أصل مثل النقل، الصيانة، إعادة التقييم،
     * أو التصرف.
     * 
     * @param {object} input - بيانات الحركة
     * @param {number} input.assetId - معرف الأصل
     * @param {string} input.movementType - نوع الحركة (purchase|transfer|maintenance|upgrade|revaluation|impairment|disposal|depreciation)
     * @param {string} input.movementDate - تاريخ الحركة
     * @param {number} [input.fromBranchId] - معرف الفرع المصدر
     * @param {number} [input.toBranchId] - معرف الفرع الهدف
     * @param {number} [input.fromStationId] - معرف المحطة المصدر
     * @param {number} [input.toStationId] - معرف المحطة الهدف
     * @param {string} [input.amount] - قيمة الحركة
     * @param {string} [input.description] - وصف الحركة
     * @param {string} [input.referenceType] - نوع المرجع
     * @param {number} [input.referenceId] - معرف المرجع
     * 
     * @returns {Promise<{success: boolean, id: number}>} نتيجة العملية مع معرف الحركة
     * 
     * @example
     * const result = await trpc.assets.movements.create({
     *   assetId: 101,
     *   movementType: "transfer",
     *   movementDate: "2024-06-01",
     *   fromStationId: 1,
     *   toStationId: 2,
     *   description: "نقل السيارة للمحطة الجديدة"
     * });
     */
    create: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        movementType: z.enum([
          "purchase", "transfer", "maintenance", "upgrade",
          "revaluation", "impairment", "disposal", "depreciation"
        ]),
        movementDate: z.string(),
        fromBranchId: z.number().optional(),
        toBranchId: z.number().optional(),
        fromStationId: z.number().optional(),
        toStationId: z.number().optional(),
        amount: z.string().optional(),
        description: z.string().optional(),
        referenceType: z.string().optional(),
        referenceId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAssetMovement({
          ...input,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),
  }),

  // ============================================
  // Depreciation - الإهلاك
  // ============================================
  depreciation: router({
    /**
     * حساب الإهلاك للأصول
     * 
     * @procedure calculate
     * @description يحسب الإهلاك الدوري للأصول المحددة أو جميع الأصول
     * وينشئ قيود الإهلاك المحاسبية.
     * 
     * @param {object} input - معاملات الحساب
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * @param {number} [input.periodId] - معرف الفترة المحاسبية
     * @param {number[]} [input.assetIds] - قائمة معرفات الأصول المحددة
     * 
     * @returns {Promise<DepreciationResult>} نتيجة حساب الإهلاك
     * 
     * @example
     * const result = await trpc.assets.depreciation.calculate({
     *   businessId: 1,
     *   periodId: 12
     * });
     */
    calculate: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        periodId: z.number().optional(),
        assetIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.calculateDepreciation({
          businessId: input.businessId || 1,
          periodId: input.periodId,
          assetIds: input.assetIds,
          userId: ctx.user?.id || 1,
        });
        return result;
      }),

    /**
     * استرجاع سجل الإهلاك
     * 
     * @procedure getHistory
     * @description يسترجع سجل الإهلاك التاريخي لأصل محدد أو جميع الأصول.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.assetId] - معرف الأصل
     * @param {number} [input.businessId] - معرف الشركة
     * @param {number} [input.year] - السنة المالية
     * 
     * @returns {Promise<DepreciationHistory[]>} سجل الإهلاك
     * 
     * @example
     * const history = await trpc.assets.depreciation.getHistory({
     *   assetId: 101,
     *   year: 2024
     * });
     */
    getHistory: protectedProcedure
      .input(z.object({
        assetId: z.number().optional(),
        businessId: z.number().optional(),
        year: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getDepreciationHistory(input);
      }),
  }),

  // ============================================
  // Dashboard Stats - إحصائيات لوحة التحكم
  // ============================================
  /**
   * إحصائيات لوحة تحكم الأصول
   * 
   * @procedure dashboardStats
   * @description يسترجع إحصائيات ملخصة لنظام الأصول تشمل إجمالي الأصول،
   * القيمة الدفترية، الإهلاك المتراكم، وتوزيع الأصول حسب الحالة.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
   * 
   * @returns {Promise<AssetDashboardStats>} إحصائيات لوحة التحكم
   * 
   * @example
   * const stats = await trpc.assets.dashboardStats({ businessId: 1 });
   */
  dashboardStats: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getAssetDashboardStats(input.businessId || 1);
    }),

  // ============================================
  // Stations - المحطات (للقوائم المنسدلة)
  // ============================================
  stations: router({
    /**
     * استرجاع قائمة المحطات
     * 
     * @procedure list
     * @description يسترجع قائمة المحطات المتاحة لاستخدامها في القوائم المنسدلة
     * عند تسجيل أو نقل الأصول.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة (افتراضي: 1)
     * 
     * @returns {Promise<Station[]>} قائمة المحطات
     * 
     * @example
     * const stations = await trpc.assets.stations.list({ businessId: 1 });
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStations(input.businessId || 1);
      }),
  }),
});
