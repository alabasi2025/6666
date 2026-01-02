import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * @fileoverview Router لنظام إدارة استهلاك الديزل
 * @module dieselRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام استهلاك الديزل
 * بما في ذلك إدارة الموردين، الوايتات (الصهاريج)، خزانات المحطات،
 * طرمبات العدادات، مهام الاستلام، حركات التحويل، والتقارير.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * @requires ./storage - لتخزين الملفات والصور
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================
// نظام استهلاك الديزل - Diesel Consumption System
// ============================================

export const dieselRouter = router({
  // ============================================
  /**
   * @namespace suppliers
   * @description إدارة موردي الديزل - يتيح تسجيل وتعديل وحذف الموردين
   * مع تتبع بيانات الاتصال والموقع الجغرافي.
   */
  // موردي الديزل - Diesel Suppliers
  // ============================================
  
  suppliers: router({
    /**
     * استرجاع قائمة موردي الديزل
     * 
     * @procedure list
     * @description يسترجع قائمة موردي الديزل مع إمكانية الفلترة حسب حالة النشاط.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselSupplier[]>} قائمة الموردين
     */
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
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          latitude: input.latitude?.toString() ?? null,
          longitude: input.longitude?.toString() ?? null,
        };
        return db.createDieselSupplier(data as any);
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
        const { id, latitude, longitude, ...rest } = input;
        const data: any = { ...rest };
        if (latitude !== undefined) data.latitude = latitude.toString();
        if (longitude !== undefined) data.longitude = longitude.toString();
        return db.updateDieselSupplier(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselSupplier(input.id);
      }),
  }),

  // ============================================
  /**
   * @namespace tankers
   * @description إدارة الوايتات (صهاريج الديزل) - يتيح تسجيل الصهاريج
   * مع تحديد السعة والمقصورات وبيانات السائق.
   */
  // الوايتات (صهاريج الديزل) - Diesel Tankers
  // ============================================
  
  tankers: router({
    /**
     * استرجاع قائمة الوايتات (الصهاريج)
     * 
     * @procedure list
     * @description يسترجع قائمة صهاريج الديزل مع بيانات السعة والسائقين.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselTanker[]>} قائمة الصهاريج
     */
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
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          capacity: input.capacity.toString(),
          compartment1Capacity: input.compartment1Capacity?.toString() ?? null,
          compartment2Capacity: input.compartment2Capacity?.toString() ?? null,
        };
        return db.createDieselTanker(data as any);
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
        const { id, capacity, compartment1Capacity, compartment2Capacity, ...rest } = input;
        const data: any = { ...rest };
        if (capacity !== undefined) data.capacity = capacity.toString();
        if (compartment1Capacity !== undefined) data.compartment1Capacity = compartment1Capacity.toString();
        if (compartment2Capacity !== undefined) data.compartment2Capacity = compartment2Capacity.toString();
        return db.updateDieselTanker(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDieselTanker(input.id);
      }),
  }),

  // ============================================
  /**
   * @namespace tanks
   * @description إدارة خزانات المحطة - يتيح تسجيل خزانات الاستقبال والرئيسية
   * والروكت والمولدات مع تتبع المستويات والسعات.
   */
  // خزانات المحطة - Station Tanks
  // ============================================
  
  tanks: router({
    /**
     * استرجاع قائمة خزانات المحطة
     * 
     * @procedure list
     * @description يسترجع قائمة خزانات الديزل في المحطات مع مستوياتها الحالية.
     * 
     * @param {object} [input] - معاملات البحث
     * @param {number} [input.businessId] - معرف الشركة
     * @param {number} [input.stationId] - معرف المحطة للفلترة
     * @param {string} [input.type] - نوع الخزان (receiving|main|rocket|generator)
     * @param {boolean} [input.isActive] - حالة النشاط للفلترة
     * 
     * @returns {Promise<DieselTank[]>} قائمة الخزانات
     */
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
        // تحويل الأرقام إلى نصوص للحقول decimal
        const data = {
          ...input,
          capacity: input.capacity.toString(),
          currentLevel: input.currentLevel.toString(),
          minLevel: input.minLevel.toString(),
        };
        return db.createDieselTank(data as any);
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
        const { id, capacity, currentLevel, minLevel, ...rest } = input;
        const data: any = { ...rest };
        if (capacity !== undefined) data.capacity = capacity.toString();
        if (currentLevel !== undefined) data.currentLevel = currentLevel.toString();
        if (minLevel !== undefined) data.minLevel = minLevel.toString();
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
