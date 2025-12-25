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
          address: z.string().optional(),
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
