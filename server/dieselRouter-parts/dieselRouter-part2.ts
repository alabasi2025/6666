  // ============================================
  /**
   * @namespace pumpMeters
   * @description إدارة طرمبات العدادات - يتيح تسجيل عدادات الموردين
   * وعدادات الدخول والخروج مع تتبع القراءات.
   */
  // طرمبات العدادات - Pump Meters
  // ============================================
  
  pumpMeters: router({
    /**
     * استرجاع قائمة طرمبات العدادات
     * 
     * @procedure list
     * @description يسترجع قائمة عدادات الطرمبات مع قراءاتها الحالية.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {number} [input.stationId] - معرف المحطة للفلترة
     * @param {number} [input.supplierId] - معرف المورد للفلترة
     * @param {string} [input.type] - نوع العداد (supplier|intake|output)
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselPumpMeter[]>} قائمة العدادات
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        supplierId: z.number().optional(),
        type: z.enum(["supplier", "intake", "output"]).optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselPumpMeters(input?.businessId, input?.stationId, input?.supplierId, input?.type, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const pump = await db.getDieselPumpMeterById(input.id);
        if (!pump) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الطرمبة غير موجودة" });
        }
        return pump;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        supplierId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["supplier", "intake", "output"]),
        serialNumber: z.string().optional(),
        currentReading: z.number().default(0),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          currentReading: input.currentReading.toString(),
        };
        return db.createDieselPumpMeter(data as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        type: z.enum(["supplier", "intake", "output"]).optional(),
        serialNumber: z.string().optional(),
        currentReading: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, currentReading, ...rest } = input;
        const data: any = { ...rest };
        if (currentReading !== undefined) data.currentReading = currentReading.toString();
        return db.updateDieselPumpMeter(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselPumpMeter(input.id);
      }),
  }),

  // ============================================
  /**
   * @namespace receivingTasks
   * @description إدارة مهام استلام الديزل - يتيح إنشاء وتتبع مهام
   * استلام الديزل من الموردين مع تسجيل جميع المراحل والقراءات.
   */
  // مهام استلام الديزل - Diesel Receiving Tasks
  // ============================================
  
  receivingTasks: router({
    /**
     * استرجاع قائمة مهام استلام الديزل
     * 
     * @procedure list
     * @description يسترجع قائمة مهام استلام الديزل مع إمكانية الفلترة
     * حسب المحطة أو الموظف أو الحالة أو الفترة الزمنية.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {number} [input.stationId] - معرف المحطة للفلترة
     * @param {number} [input.employeeId] - معرف الموظف للفلترة
     * @param {string} [input.status] - حالة المهمة للفلترة
     * @param {string} [input.fromDate] - تاريخ البداية
     * @param {string} [input.toDate] - تاريخ النهاية
     * 
     * @returns {Promise<DieselReceivingTask[]>} قائمة المهام
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        employeeId: z.number().optional(),
        status: z.enum(["pending", "started", "at_supplier", "loading", "returning", "at_station", "unloading", "completed", "cancelled"]).optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselReceivingTasks(input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const task = await db.getDieselReceivingTaskById(input.id);
        if (!task) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المهمة غير موجودة" });
        }
        return task;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        taskNumber: z.string().min(1),
        taskDate: z.string(),
        employeeId: z.number(),
        tankerId: z.number(),
        supplierId: z.number(),
        status: z.enum(["pending", "started", "at_supplier", "loading", "returning", "at_station", "unloading", "completed", "cancelled"]).default("pending"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createDieselReceivingTask({
          ...input,
          createdBy: ctx.user?.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "started", "at_supplier", "loading", "returning", "at_station", "unloading", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
        // توقيتات
        startTime: z.string().optional(),
        arrivalAtSupplierTime: z.string().optional(),
        loadingStartTime: z.string().optional(),
        loadingEndTime: z.string().optional(),
        departureFromSupplierTime: z.string().optional(),
        arrivalAtStationTime: z.string().optional(),
        unloadingStartTime: z.string().optional(),
        unloadingEndTime: z.string().optional(),
        completionTime: z.string().optional(),
        // قراءات طرمبة المورد
        supplierPumpId: z.number().optional(),
        supplierPumpReadingBefore: z.number().optional(),
        supplierPumpReadingAfter: z.number().optional(),
        supplierPumpReadingBeforeImage: z.string().optional(),
        supplierPumpReadingAfterImage: z.string().optional(),
        // فاتورة المورد
        supplierInvoiceNumber: z.string().optional(),
        supplierInvoiceImage: z.string().optional(),
        supplierInvoiceAmount: z.number().optional(),
        // الكميات
        quantityFromSupplier: z.number().optional(),
        compartment1Quantity: z.number().optional(),
        compartment2Quantity: z.number().optional(),
        // قراءات طرمبة الدخول
        intakePumpId: z.number().optional(),
        intakePumpReadingBefore: z.number().optional(),
        intakePumpReadingAfter: z.number().optional(),
        intakePumpReadingBeforeImage: z.string().optional(),
        intakePumpReadingAfterImage: z.string().optional(),
        // الاستلام
        quantityReceivedAtStation: z.number().optional(),
        receivingTankId: z.number().optional(),
        // الفرق
        quantityDifference: z.number().optional(),
        differenceNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...inputData } = input;
        
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data: any = {};
        for (const [key, value] of Object.entries(inputData)) {
          if (value === undefined) continue;
          
          // الحقول الرقمية التي تحتاج تحويل
          const decimalFields = [
            'supplierPumpReadingBefore', 'supplierPumpReadingAfter',
            'supplierInvoiceAmount', 'quantityFromSupplier',
            'compartment1Quantity', 'compartment2Quantity',
            'intakePumpReadingBefore', 'intakePumpReadingAfter',
            'quantityReceivedAtStation', 'quantityDifference'
          ];
          
          if (decimalFields.includes(key) && typeof value === 'number') {
            data[key] = value.toString();
          } else {
            data[key] = value;
          }
        }
        
        return db.updateDieselReceivingTask(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselReceivingTask(input.id);
      }),

    // تحديث حالة المهمة
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "started", "at_supplier", "loading", "returning", "at_station", "unloading", "completed", "cancelled"]),
        timestamp: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const statusTimeMap: Record<string, string> = {
          started: "startTime",
          at_supplier: "arrivalAtSupplierTime",
          loading: "loadingStartTime",
          returning: "departureFromSupplierTime",
          at_station: "arrivalAtStationTime",
          unloading: "unloadingStartTime",
          completed: "completionTime",
        };

        const timeField = statusTimeMap[input.status];
        const updateData: any = { status: input.status };
        
        if (timeField && input.timestamp) {
          updateData[timeField] = input.timestamp;
        }

        return db.updateDieselReceivingTask(input.id, updateData);
      }),
  }),

  // ============================================
  // سجل قراءات الطرمبات - Pump Readings Log
  // ============================================
  
  pumpReadings: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        pumpMeterId: z.number().optional(),
        taskId: z.number().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselPumpReadings(input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        pumpMeterId: z.number(),
        taskId: z.number().optional(),
        readingDate: z.string(),
        readingValue: z.number(),
        readingType: z.enum(["before", "after"]),
        readingImage: z.string().optional(),
        quantity: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          readingValue: input.readingValue.toString(),
          quantity: input.quantity?.toString() ?? null,
          recordedBy: ctx.user?.id,
        };
        return db.createDieselPumpReading(data as any);
      }),
  }),

