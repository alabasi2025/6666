     * @param {number} [input.teamId] - معرف الفريق للفلترة
     * 
     * @returns {Promise<FieldEquipment[]>} قائمة المعدات
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        equipmentType: z.string().optional(),
        teamId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFieldEquipmentList(input.businessId, input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        equipmentCode: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        equipmentType: z.enum(["tool", "vehicle", "device", "safety", "measuring"]),
        serialNumber: z.string().optional(),
        model: z.string().optional(),
        brand: z.string().optional(),
        assignedTeamId: z.number().optional(),
        purchaseDate: z.string().optional(),
        purchaseCost: z.number().optional(),
        warrantyEnd: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFieldEquipmentItem({
          ...input,
          purchaseCost: input.purchaseCost?.toString(),
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
          warrantyEnd: input.warrantyEnd ? new Date(input.warrantyEnd) : undefined,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          status: z.enum(["available", "in_use", "maintenance", "retired", "lost"]).optional(),
          assignedTeamId: z.number().optional(),
          condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),
          notes: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateFieldEquipmentItem(input.id, input.data);
        return { success: true };
      }),

    recordMovement: protectedProcedure
      .input(z.object({
        equipmentId: z.number(),
        movementType: z.enum(["checkout", "return", "transfer", "maintenance", "retire"]),
        fromHolderId: z.number().optional(),
        toHolderId: z.number().optional(),
        operationId: z.number().optional(),
        conditionBefore: z.enum(["excellent", "good", "fair", "poor"]).optional(),
        conditionAfter: z.enum(["excellent", "good", "fair", "poor"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.recordEquipmentMovement({
          ...input,
          recordedBy: ctx.user.id,
        });
        return { id };
      }),
  }),

  /**
   * @namespace inspections
   * @description إدارة الفحوصات الميدانية - يتيح إنشاء وتتبع فحوصات
   * الجودة والسلامة والإنجاز للعمليات الميدانية.
   */
  // Inspections
  inspections: router({
    /**
     * استرجاع قائمة الفحوصات
     * 
     * @procedure list
     * @description يسترجع قائمة الفحوصات الميدانية مع إمكانية الفلترة
     * حسب العملية أو الحالة أو المفتش.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {number} [input.operationId] - معرف العملية للفلترة
     * @param {string} [input.status] - حالة الفحص للفلترة
     * @param {number} [input.inspectorId] - معرف المفتش للفلترة
     * 
     * @returns {Promise<Inspection[]>} قائمة الفحوصات
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        operationId: z.number().optional(),
        status: z.string().optional(),
        inspectorId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInspections(input.businessId, input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        operationId: z.number(),
        inspectionNumber: z.string(),
        inspectionType: z.enum(["quality", "safety", "completion", "periodic"]),
        inspectorId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createInspection({
          ...input,
          inspectorId: input.inspectorId || ctx.user.id,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["pending", "passed", "failed", "conditional"]).optional(),
          overallScore: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateInspection(input.id, {
          ...input.data,
          overallScore: input.data.overallScore?.toString(),
        });
        return { success: true };
      }),

    checklists: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        operationType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInspectionChecklists(input.businessId, input.operationType);
      }),
  }),

  /**
   * @namespace materials
   * @description إدارة طلبات المواد - يتيح إنشاء وتتبع طلبات المواد
   * للعمليات الميدانية من المستودعات.
   */
  // Material Requests
  materials: router({
    /**
     * استرجاع قائمة طلبات المواد
     * 
     * @procedure list
     * @description يسترجع قائمة طلبات المواد مع إمكانية الفلترة
     * حسب الحالة أو العامل أو الفريق.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {string} [input.status] - حالة الطلب للفلترة
     * @param {number} [input.workerId] - معرف العامل للفلترة
     * @param {number} [input.teamId] - معرف الفريق للفلترة
     * 
     * @returns {Promise<MaterialRequest[]>} قائمة طلبات المواد
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        workerId: z.number().optional(),
        teamId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getMaterialRequests(input.businessId, input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        requestNumber: z.string(),
        operationId: z.number().optional(),
        workerId: z.number().optional(),
        teamId: z.number().optional(),
        warehouseId: z.number().optional(),
        requestDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createMaterialRequest({
          ...input,
          requestDate: new Date(input.requestDate),
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["pending", "approved", "issued", "returned", "cancelled"]).optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData: any = { ...input.data };
        if (input.data.status === 'approved') {
          updateData.approvedBy = ctx.user.id;
          updateData.approvedAt = new Date();
        } else if (input.data.status === 'issued') {
          updateData.issuedBy = ctx.user.id;
          updateData.issuedAt = new Date();
        }
        await db.updateMaterialRequest(input.id, updateData);
        return { success: true };
      }),
  }),

  /**
   * @namespace settlements
   * @description إدارة التسويات الدورية - يتيح إنشاء وتتبع تسويات
   * العمال والفرق للفترات المحددة.
   */
  // Settlements
  settlements: router({
    /**
     * استرجاع قائمة التسويات
     * 
     * @procedure list
     * @description يسترجع قائمة التسويات الدورية للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * 
     * @returns {Promise<PeriodSettlement[]>} قائمة التسويات
     */
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPeriodSettlements(input.businessId);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        settlementNumber: z.string(),
        periodStart: z.string(),
        periodEnd: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createPeriodSettlement({
          ...input,
          periodStart: new Date(input.periodStart),
          periodEnd: new Date(input.periodEnd),
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["draft", "approved", "paid"]).optional(),
          totalOperations: z.number().optional(),
          totalAmount: z.number().optional(),
          totalBonuses: z.number().optional(),
          totalDeductions: z.number().optional(),
          netAmount: z.number().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData: any = {
          ...input.data,
          totalAmount: input.data.totalAmount?.toString(),
          totalBonuses: input.data.totalBonuses?.toString(),
          totalDeductions: input.data.totalDeductions?.toString(),
          netAmount: input.data.netAmount?.toString(),
        };
        if (input.data.status === 'approved') {
          updateData.approvedBy = ctx.user.id;
          updateData.approvedAt = new Date();
        }
        await db.updatePeriodSettlement(input.id, updateData);
        return { success: true };
      }),

    payments: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        workerId: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getOperationPayments(input.businessId, input);
      }),
  }),

  // Installation Details
  installation: router({
    getDetails: protectedProcedure
      .input(z.object({ operationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInstallationDetailsByOperation(input.operationId);
      }),

    saveDetails: protectedProcedure
      .input(z.object({
        operationId: z.number(),
        customerId: z.number().optional(),
        meterSerialNumber: z.string().optional(),
        meterType: z.enum(["smart", "traditional", "prepaid"]).optional(),
        sealNumber: z.string().optional(),
        sealColor: z.string().optional(),
        sealType: z.string().optional(),
        breakerType: z.string().optional(),
        breakerCapacity: z.string().optional(),
        breakerBrand: z.string().optional(),
        cableLength: z.number().optional(),
        cableType: z.string().optional(),
        cableSize: z.string().optional(),
        initialReading: z.number().optional(),
        installationDate: z.string().optional(),
        installationTime: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createInstallationDetails({
          ...input,
          cableLength: input.cableLength?.toString(),
          initialReading: input.initialReading?.toString(),
          installationDate: input.installationDate ? new Date(input.installationDate) : undefined,
          technicianId: ctx.user.id,
        });
        return { id };
      }),

    getPhotos: protectedProcedure
      .input(z.object({ operationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInstallationPhotos(input.operationId);
      }),

    addPhoto: protectedProcedure
      .input(z.object({
        operationId: z.number(),
        installationId: z.number().optional(),
        photoType: z.enum(["meter_front", "meter_reading", "seal", "breaker", "wiring", "location", "customer_premises", "before_installation", "after_installation"]).optional(),
        photoUrl: z.string(),
        caption: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.addInstallationPhoto({
          ...input,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          uploadedBy: ctx.user.id,
          capturedAt: new Date(),
        });
        return { id };
      }),
  }),

  // Seed Demo Data
  seedDemo: protectedProcedure
    .mutation(async () => {
      return await db.seedDemoTenants();
    }),
});
