import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";

// ============================================
// نظام استهلاك الديزل - Diesel Consumption System
// ============================================

export const dieselRouter = router({
  // ============================================
  // موردي الديزل - Diesel Suppliers
  // ============================================
  
  suppliers: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselSuppliers(input?.businessId, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const supplier = await db.getDieselSupplierById(input.id);
        if (!supplier) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المورد غير موجود" });
        }
        return supplier;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        contactPerson: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return db.createDieselSupplier(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        contactPerson: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselSupplier(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselSupplier(input.id);
      }),
  }),

  // ============================================
  // الوايتات (صهاريج الديزل) - Diesel Tankers
  // ============================================
  
  tankers: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselTankers(input?.businessId, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tanker = await db.getDieselTankerById(input.id);
        if (!tanker) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الوايت غير موجود" });
        }
        return tanker;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        code: z.string().min(1),
        plateNumber: z.string().min(1),
        capacity: z.number(),
        compartment1Capacity: z.number().optional(),
        compartment2Capacity: z.number().optional(),
        driverName: z.string().optional(),
        driverPhone: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return db.createDieselTanker(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        plateNumber: z.string().optional(),
        capacity: z.number().optional(),
        compartment1Capacity: z.number().optional(),
        compartment2Capacity: z.number().optional(),
        driverName: z.string().optional(),
        driverPhone: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselTanker(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselTanker(input.id);
      }),
  }),

  // ============================================
  // خزانات المحطة - Station Tanks
  // ============================================
  
  tanks: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        type: z.enum(["receiving", "main", "rocket", "generator"]).optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDieselTanks(input?.businessId, input?.stationId, input?.type, input?.isActive);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tank = await db.getDieselTankById(input.id);
        if (!tank) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الخزان غير موجود" });
        }
        return tank;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        type: z.enum(["receiving", "main", "rocket", "generator"]),
        capacity: z.number(),
        currentLevel: z.number().default(0),
        minLevel: z.number().default(0),
        linkedGeneratorId: z.number().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return db.createDieselTank(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        type: z.enum(["receiving", "main", "rocket", "generator"]).optional(),
        capacity: z.number().optional(),
        currentLevel: z.number().optional(),
        minLevel: z.number().optional(),
        linkedGeneratorId: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselTank(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselTank(input.id);
      }),

    updateLevel: protectedProcedure
      .input(z.object({
        id: z.number(),
        newLevel: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateDieselTankLevel(input.id, input.newLevel);
      }),
  }),

  // ============================================
  // طرمبات العدادات - Pump Meters
  // ============================================
  
  pumpMeters: router({
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
        return db.createDieselPumpMeter(input);
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
        const { id, ...data } = input;
        return db.updateDieselPumpMeter(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselPumpMeter(input.id);
      }),
  }),

  // ============================================
  // مهام استلام الديزل - Diesel Receiving Tasks
  // ============================================
  
  receivingTasks: router({
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
        taskDate: z.string(),
        employeeId: z.number(),
        tankerId: z.number(),
        supplierId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createDieselReceivingTask({
          ...input,
          createdBy: ctx.user?.id,
        });
      }),

    // بدء المهمة (الموظف يغادر للمورد)
    startTask: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateDieselReceivingTaskStatus(input.id, "started", {
          startTime: new Date(),
        });
      }),

    // الوصول للمورد
    arriveAtSupplier: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateDieselReceivingTaskStatus(input.id, "at_supplier", {
          arrivalAtSupplierTime: new Date(),
        });
      }),

    // بدء التحميل - تسجيل قراءة الطرمبة قبل
    startLoading: protectedProcedure
      .input(z.object({
        id: z.number(),
        supplierPumpId: z.number(),
        supplierPumpReadingBefore: z.number(),
        supplierPumpReadingBeforeImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselReceivingTaskStatus(id, "loading", {
          loadingStartTime: new Date(),
          ...data,
        });
      }),

    // انتهاء التحميل - تسجيل قراءة الطرمبة بعد والفاتورة
    endLoading: protectedProcedure
      .input(z.object({
        id: z.number(),
        supplierPumpReadingAfter: z.number(),
        supplierPumpReadingAfterImage: z.string().optional(),
        supplierInvoiceNumber: z.string().optional(),
        supplierInvoiceImage: z.string().optional(),
        supplierInvoiceAmount: z.number().optional(),
        quantityFromSupplier: z.number(),
        compartment1Quantity: z.number().optional(),
        compartment2Quantity: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselReceivingTaskStatus(id, "returning", {
          loadingEndTime: new Date(),
          departureFromSupplierTime: new Date(),
          ...data,
        });
      }),

    // الوصول للمحطة
    arriveAtStation: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateDieselReceivingTaskStatus(input.id, "at_station", {
          arrivalAtStationTime: new Date(),
        });
      }),

    // بدء التفريغ - تسجيل قراءة طرمبة الدخول قبل
    startUnloading: protectedProcedure
      .input(z.object({
        id: z.number(),
        intakePumpId: z.number(),
        intakePumpReadingBefore: z.number(),
        intakePumpReadingBeforeImage: z.string().optional(),
        receivingTankId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselReceivingTaskStatus(id, "unloading", {
          unloadingStartTime: new Date(),
          ...data,
        });
      }),

    // انتهاء التفريغ وإتمام المهمة
    completeTask: protectedProcedure
      .input(z.object({
        id: z.number(),
        intakePumpReadingAfter: z.number(),
        intakePumpReadingAfterImage: z.string().optional(),
        quantityReceivedAtStation: z.number(),
        differenceNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // حساب الفرق
        const task = await db.getDieselReceivingTaskById(id);
        if (task) {
          const quantityDifference = Number(task.quantityFromSupplier || 0) - data.quantityReceivedAtStation;
          return db.updateDieselReceivingTaskStatus(id, "completed", {
            unloadingEndTime: new Date(),
            completionTime: new Date(),
            quantityDifference,
            ...data,
          });
        }
        
        return db.updateDieselReceivingTaskStatus(id, "completed", {
          unloadingEndTime: new Date(),
          completionTime: new Date(),
          ...data,
        });
      }),

    // إلغاء المهمة
    cancelTask: protectedProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.updateDieselReceivingTaskStatus(input.id, "cancelled", {
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        taskDate: z.string().optional(),
        employeeId: z.number().optional(),
        tankerId: z.number().optional(),
        supplierId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDieselReceivingTask(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselReceivingTask(input.id);
      }),
  }),

  // ============================================
  // قراءات الطرمبات - Pump Readings
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
        return db.createDieselPumpReading({
          ...input,
          recordedBy: ctx.user?.id,
        });
      }),
  }),

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
        return db.createDieselTankMovement({
          ...input,
          recordedBy: ctx.user?.id,
        });
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
        let consumptionRate: number | undefined;
        if (input.runningHours && input.runningHours > 0) {
          consumptionRate = input.quantityConsumed / input.runningHours;
        }
        
        return db.createGeneratorDieselConsumption({
          ...input,
          consumptionRate,
          recordedBy: ctx.user?.id,
        });
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
