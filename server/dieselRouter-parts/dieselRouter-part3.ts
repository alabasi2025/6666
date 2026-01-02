  // ============================================
  // حركات الديزل - Tank Movements
  // ============================================
  
  tankMovements: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        tankId: z.number().optional(),
        movementType: z.enum(["receiving", "transfer", "consumption", "adjustment"]).optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselTankMovements(input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        movementDate: z.string(),
        movementType: z.enum(["receiving", "transfer", "consumption", "adjustment"]),
        fromTankId: z.number().optional(),
        toTankId: z.number().optional(),
        quantity: z.number(),
        taskId: z.number().optional(),
        outputPumpId: z.number().optional(),
        outputPumpReadingBefore: z.number().optional(),
        outputPumpReadingAfter: z.number().optional(),
        generatorId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          quantity: input.quantity.toString(),
          outputPumpReadingBefore: input.outputPumpReadingBefore?.toString() ?? null,
          outputPumpReadingAfter: input.outputPumpReadingAfter?.toString() ?? null,
          recordedBy: ctx.user?.id,
        };
        return db.createDieselTankMovement(data as any);
      }),
  }),

  // ============================================
  // استهلاك المولدات - Generator Consumption
  // ============================================
  
  generatorConsumption: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        generatorId: z.number().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getGeneratorDieselConsumption(input);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        generatorId: z.number(),
        consumptionDate: z.string(),
        rocketTankId: z.number().optional(),
        startLevel: z.number().optional(),
        endLevel: z.number().optional(),
        quantityConsumed: z.number(),
        runningHours: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // حساب معدل الاستهلاك
        let consumptionRate: string | null = null;
        if (input.runningHours && input.runningHours > 0) {
          consumptionRate = (input.quantityConsumed / input.runningHours).toString();
        }
        
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          startLevel: input.startLevel?.toString() ?? null,
          endLevel: input.endLevel?.toString() ?? null,
          quantityConsumed: input.quantityConsumed.toString(),
          runningHours: input.runningHours?.toString() ?? null,
          consumptionRate,
          recordedBy: ctx.user?.id,
        };
        
        return db.createGeneratorDieselConsumption(data as any);
      }),

    getStatistics: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        generatorId: z.number().optional(),
        fromDate: z.string(),
        toDate: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getGeneratorConsumptionStatistics(input);
      }),
  }),

  // ============================================
  // التقارير والإحصائيات - Reports & Statistics
  // ============================================
  
  reports: router({
    // ملخص استهلاك الديزل
    consumptionSummary: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        fromDate: z.string(),
        toDate: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getDieselConsumptionSummary(input);
      }),

    // تقرير مهام الاستلام
    receivingTasksReport: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        supplierId: z.number().optional(),
        fromDate: z.string(),
        toDate: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getDieselReceivingTasksReport(input);
      }),

    // تقرير مستويات الخزانات
    tankLevelsReport: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselTankLevelsReport(input?.businessId, input?.stationId);
      }),
  }),

  // ============================================
  // أصول الديزل - Diesel Assets
  // ============================================
  
  assets: router({
    // المواصير
    pipes: router({
      list: protectedProcedure
        .input(z.object({
          businessId: z.number().optional(),
          stationId: z.number().optional(),
          isActive: z.boolean().optional(),
        }).optional())
        .query(async ({ input }) => {
          return db.getDieselPipes(input?.businessId, input?.stationId, input?.isActive);
        }),

      create: protectedProcedure
        .input(z.object({
          businessId: z.number(),
          stationId: z.number().optional(),
          code: z.string().min(1),
          nameAr: z.string().min(1),
          nameEn: z.string().optional(),
          material: z.enum(["steel", "plastic", "copper", "other"]),
          diameter: z.number(),
          length: z.number(),
          status: z.enum(["active", "maintenance", "inactive"]).default("active"),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const data = {
            ...input,
            diameter: input.diameter.toString(),
            length: input.length.toString(),
          };
          return db.createDieselPipe(data as any);
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          material: z.enum(["steel", "plastic", "copper", "other"]).optional(),
          diameter: z.number().optional(),
          length: z.number().optional(),
          status: z.enum(["active", "maintenance", "inactive"]).optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, diameter, length, ...rest } = input;
          const data: any = { ...rest };
          if (diameter !== undefined) data.diameter = diameter.toString();
          if (length !== undefined) data.length = length.toString();
          return db.updateDieselPipe(id, data);
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          return db.deleteDieselPipe(input.id);
        }),
    }),

    // فتحات الخزانات
    tankOpenings: router({
      list: protectedProcedure
        .input(z.object({ tankId: z.number() }))
        .query(async ({ input }) => {
          return db.getDieselTankOpenings(input.tankId);
        }),

      create: protectedProcedure
        .input(z.object({
          tankId: z.number(),
          openingNumber: z.number(),
          position: z.enum(["top", "bottom", "side"]),
          purpose: z.enum(["inlet", "outlet", "vent", "measurement", "drain", "other"]),
          diameter: z.number().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const data = {
            ...input,
            diameter: input.diameter?.toString() ?? null,
          };
          return db.createDieselTankOpening(data as any);
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          return db.deleteDieselTankOpening(input.id);
        }),
    }),
  }),

  // ============================================
  // تهيئة مخطط الديزل للمحطة - Station Diesel Configuration
  // ============================================
  
  stationConfig: router({
    get: protectedProcedure
      .input(z.object({ stationId: z.number() }))
      .query(async ({ input }) => {
        return db.getStationDieselConfig(input.stationId);
      }),

    save: protectedProcedure
      .input(z.object({
        stationId: z.number(),
        businessId: z.number(),
        config: z.object({
          receivingTanks: z.array(z.number()).optional(),
          mainTanks: z.array(z.number()).optional(),
          generatorTanks: z.array(z.number()).optional(),
          intakePipes: z.array(z.number()).optional(),
          outputPipes: z.array(z.number()).optional(),
          intakePumps: z.array(z.number()).optional(),
          outputPumps: z.array(z.number()).optional(),
          hasIntakePump: z.boolean().optional(),
          hasOutputPump: z.boolean().optional(),
          intakePumpHasMeter: z.boolean().optional(),
          outputPumpHasMeter: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.saveStationDieselConfig({
          stationId: input.stationId,
          businessId: input.businessId,
          config: JSON.stringify(input.config),
          updatedBy: ctx.user?.id,
        });
      }),
  }),

  // ============================================
  // رفع الصور - Image Upload
  // ============================================
  
  uploadImage: protectedProcedure
    .input(z.object({
      imageData: z.string(), // Base64 encoded image
      fileName: z.string(),
      folder: z.string().default("diesel"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Determine content type
        const extension = input.fileName.split(".").pop()?.toLowerCase() || "jpg";
        const contentTypeMap: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        const contentType = contentTypeMap[extension] || "image/jpeg";
        
        // Generate unique file path
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}_${input.fileName}`;
        const filePath = `${input.folder}/${uniqueFileName}`;
        
        // Upload to storage
        const result = await storagePut(filePath, buffer, contentType);
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل رفع الصورة: ${error.message}`,
        });
      }
    }),
});
