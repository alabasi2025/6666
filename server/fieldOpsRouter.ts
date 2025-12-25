import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

/**
 * @fileoverview Router لنظام العمليات الميدانية
 * @module fieldOpsRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بالعمليات الميدانية
 * بما في ذلك إدارة العمليات، الفرق، العمال، المعدات، الفحوصات،
 * طلبات المواد، التسويات، والتقارير.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

export const fieldOpsRouter = router({
  /**
   * @namespace dashboardStats
   * @description إحصائيات لوحة تحكم العمليات الميدانية
   */
  // Dashboard Stats
  /**
   * استرجاع إحصائيات لوحة التحكم
   * 
   * @procedure dashboardStats
   * @description يسترجع إحصائيات ملخصة للعمليات الميدانية تشمل
   * عدد العمليات والفرق والعمال والإنجازات.
   * 
   * @param {object} input - معاملات البحث
   * @param {number} input.businessId - معرف الشركة
   * 
   * @returns {Promise<FieldOpsDashboardStats>} إحصائيات لوحة التحكم
   */
  dashboardStats: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return await db.getFieldOperationsDashboardStats(input.businessId);
    }),

  /**
   * @namespace operations
   * @description إدارة العمليات الميدانية - يتيح إنشاء وتتبع العمليات
   * الميدانية مثل التركيب والصيانة والفحص والقراءات.
   */
  // Field Operations
  operations: router({
    /**
     * استرجاع قائمة العمليات الميدانية
     * 
     * @procedure list
     * @description يسترجع قائمة العمليات الميدانية مع إمكانية الفلترة
     * حسب الحالة أو النوع أو الفريق أو العامل أو الفترة الزمنية.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {string} [input.status] - حالة العملية للفلترة
     * @param {string} [input.operationType] - نوع العملية للفلترة
     * @param {number} [input.teamId] - معرف الفريق للفلترة
     * @param {number} [input.workerId] - معرف العامل للفلترة
     * @param {number} [input.customerId] - معرف العميل للفلترة
     * @param {string} [input.fromDate] - تاريخ البداية
     * @param {string} [input.toDate] - تاريخ النهاية
     * 
     * @returns {Promise<FieldOperation[]>} قائمة العمليات
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        operationType: z.string().optional(),
        teamId: z.number().optional(),
        workerId: z.number().optional(),
        customerId: z.number().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFieldOperations(input.businessId, input);
      }),

    /**
     * استرجاع عملية بواسطة المعرف
     * 
     * @procedure get
     * @description يسترجع بيانات عملية ميدانية محددة مع تفاصيلها الكاملة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.id - معرف العملية
     * 
     * @returns {Promise<FieldOperation>} بيانات العملية
     */
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFieldOperationById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        operationNumber: z.string(),
        operationType: z.enum(["installation", "maintenance", "inspection", "disconnection", "reconnection", "meter_reading", "collection", "repair", "replacement"]),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        title: z.string(),
        description: z.string().optional(),
        referenceType: z.string().optional(),
        referenceId: z.number().optional(),
        customerId: z.number().optional(),
        assetId: z.number().optional(),
        locationLat: z.number().optional(),
        locationLng: z.number().optional(),
        address: z.string().optional(),
        scheduledDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        assignedTeamId: z.number().optional(),
        assignedWorkerId: z.number().optional(),
        estimatedDuration: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createFieldOperation({
          ...input,
          locationLat: input.locationLat?.toString(),
          locationLng: input.locationLng?.toString(),
          scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
          createdBy: ctx.user.id,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          scheduledDate: z.string().optional(),
          scheduledTime: z.string().optional(),
          assignedTeamId: z.number().optional(),
          assignedWorkerId: z.number().optional(),
          estimatedDuration: z.number().optional(),
          notes: z.string().optional(),
          completionNotes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateFieldOperation(input.id, {
          ...input.data,
          scheduledDate: input.data.scheduledDate ? new Date(input.data.scheduledDate) : undefined,
        });
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "scheduled", "assigned", "in_progress", "waiting_customer", "on_hold", "completed", "cancelled", "rejected"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateOperationStatus(input.id, input.status, ctx.user.id, input.reason);
        return { success: true };
      }),
  }),

  /**
   * @namespace teams
   * @description إدارة الفرق الميدانية - يتيح إنشاء وتنظيم فرق العمل
   * الميدانية مع تحديد القادة والأعضاء ومناطق العمل.
   */
  // Field Teams
  teams: router({
    /**
     * استرجاع قائمة الفرق الميدانية
     * 
     * @procedure list
     * @description يسترجع قائمة الفرق الميدانية للشركة.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * 
     * @returns {Promise<FieldTeam[]>} قائمة الفرق
     */
    list: protectedProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFieldTeams(input.businessId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFieldTeamById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        branchId: z.number().optional(),
        code: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        teamType: z.enum(["installation", "maintenance", "inspection", "collection", "mixed"]).default("mixed"),
        leaderId: z.number().optional(),
        maxMembers: z.number().default(10),
        workingArea: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFieldTeam(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          teamType: z.enum(["installation", "maintenance", "inspection", "collection", "mixed"]).optional(),
          leaderId: z.number().optional(),
          maxMembers: z.number().optional(),
          status: z.enum(["active", "inactive", "on_leave"]).optional(),
          workingArea: z.string().optional(),
          notes: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateFieldTeam(input.id, input.data);
        return { success: true };
      }),
  }),

  /**
   * @namespace workers
   * @description إدارة العمال الميدانيين - يتيح تسجيل وتتبع العمال
   * مع مهاراتهم ومواقعهم وأدائهم.
   */
  // Field Workers
  workers: router({
    /**
     * استرجاع قائمة العمال الميدانيين
     * 
     * @procedure list
     * @description يسترجع قائمة العمال الميدانيين مع إمكانية الفلترة
     * حسب الفريق أو الحالة أو نوع العامل.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {number} [input.teamId] - معرف الفريق للفلترة
     * @param {string} [input.status] - حالة العامل للفلترة
     * @param {string} [input.workerType] - نوع العامل للفلترة
     * 
     * @returns {Promise<FieldWorker[]>} قائمة العمال
     */
    list: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        teamId: z.number().optional(),
        status: z.string().optional(),
        workerType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFieldWorkers(input.businessId, input);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFieldWorkerById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        userId: z.number().optional(),
        employeeNumber: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        teamId: z.number().optional(),
        workerType: z.enum(["technician", "engineer", "supervisor", "driver", "helper"]).default("technician"),
        specialization: z.string().optional(),
        skills: z.any().optional(),
        hireDate: z.string().optional(),
        dailyRate: z.number().optional(),
        operationRate: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFieldWorker({
          ...input,
          skills: input.skills ? JSON.stringify(input.skills) : null,
          dailyRate: input.dailyRate?.toString(),
          operationRate: input.operationRate?.toString(),
          hireDate: input.hireDate ? new Date(input.hireDate) : undefined,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          teamId: z.number().optional(),
          workerType: z.enum(["technician", "engineer", "supervisor", "driver", "helper"]).optional(),
          specialization: z.string().optional(),
          status: z.enum(["available", "busy", "on_leave", "inactive"]).optional(),
          dailyRate: z.number().optional(),
          operationRate: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateFieldWorker(input.id, {
          ...input.data,
          dailyRate: input.data.dailyRate?.toString(),
          operationRate: input.data.operationRate?.toString(),
        });
        return { success: true };
      }),

    updateLocation: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        lat: z.number(),
        lng: z.number(),
        operationId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateWorkerLocation(input.workerId, input.lat, input.lng, input.operationId);
        return { success: true };
      }),

    performance: protectedProcedure
      .input(z.object({ workerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkerPerformanceHistory(input.workerId);
      }),

    incentives: protectedProcedure
      .input(z.object({
        businessId: z.number(),
        workerId: z.number().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getWorkerIncentives(input.businessId, input);
      }),
  }),

  /**
   * @namespace equipment
   * @description إدارة المعدات الميدانية - يتيح تسجيل وتتبع المعدات
   * والأدوات المستخدمة في العمليات الميدانية.
   */
  // Field Equipment
  equipment: router({
    /**
     * استرجاع قائمة المعدات الميدانية
     * 
     * @procedure list
     * @description يسترجع قائمة المعدات الميدانية مع إمكانية الفلترة
     * حسب الحالة أو النوع أو الفريق.
     * 
     * @param {object} input - معاملات البحث
     * @param {number} input.businessId - معرف الشركة
     * @param {string} [input.status] - حالة المعدة للفلترة
     * @param {string} [input.equipmentType] - نوع المعدة للفلترة
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
