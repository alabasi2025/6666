import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const maintenanceRouter = router({
  // ============================================
  // Work Orders - أوامر العمل
  // ============================================
  workOrders: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        stationId: z.number().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        priority: z.string().optional(),
        assignedTo: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await db.getWorkOrders(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const workOrder = await db.getWorkOrderById(input.id);
        if (!workOrder) {
          throw new TRPCError({ code: "NOT_FOUND", message: "أمر العمل غير موجود" });
        }
        return workOrder;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        type: z.enum(["preventive", "corrective", "emergency", "inspection", "calibration"]),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assetId: z.number().optional(),
        equipmentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledStart: z.string().optional(),
        scheduledEnd: z.string().optional(),
        assignedTo: z.number().optional(),
        teamId: z.number().optional(),
        estimatedHours: z.string().optional(),
        estimatedCost: z.string().optional(),
        tasks: z.array(z.object({
          description: z.string(),
          estimatedHours: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createWorkOrder({
          ...input,
          businessId: input.businessId || 1,
          requestedBy: ctx.user?.id || 1,
          requestedDate: new Date(),
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        branchId: z.number().optional(),
        stationId: z.number().optional(),
        type: z.enum(["preventive", "corrective", "emergency", "inspection", "calibration"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assetId: z.number().optional(),
        equipmentId: z.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        scheduledStart: z.string().optional(),
        scheduledEnd: z.string().optional(),
        assignedTo: z.number().optional(),
        teamId: z.number().optional(),
        estimatedHours: z.string().optional(),
        estimatedCost: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateWorkOrder(id, data);
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum([
          "draft", "pending", "approved", "assigned", "in_progress",
          "on_hold", "completed", "cancelled", "closed"
        ]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateWorkOrderStatus(input.id, input.status, ctx.user?.id || 1);
        return { success: true };
      }),

    complete: protectedProcedure
      .input(z.object({
        id: z.number(),
        actualHours: z.string().optional(),
        actualCost: z.string().optional(),
        laborCost: z.string().optional(),
        partsCost: z.string().optional(),
        completionNotes: z.string().optional(),
        failureCode: z.string().optional(),
        rootCause: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.completeWorkOrder({
          ...input,
          userId: ctx.user?.id || 1,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWorkOrder(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Work Order Tasks - مهام أوامر العمل
  // ============================================
  tasks: router({
    list: protectedProcedure
      .input(z.object({
        workOrderId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getWorkOrderTasks(input.workOrderId);
      }),

    create: protectedProcedure
      .input(z.object({
        workOrderId: z.number(),
        description: z.string().min(1),
        assignedTo: z.number().optional(),
        estimatedHours: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createWorkOrderTask(input);
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
        assignedTo: z.number().optional(),
        actualHours: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateWorkOrderTask(id, data);
        return { success: true };
      }),

    complete: protectedProcedure
      .input(z.object({
        id: z.number(),
        actualHours: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.completeWorkOrderTask(input.id, input);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWorkOrderTask(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Maintenance Plans - خطط الصيانة الوقائية
  // ============================================
  plans: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        assetCategoryId: z.number().optional(),
        frequency: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getMaintenancePlans(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const plan = await db.getMaintenancePlanById(input.id);
        if (!plan) {
          throw new TRPCError({ code: "NOT_FOUND", message: "خطة الصيانة غير موجودة" });
        }
        return plan;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        assetCategoryId: z.number().optional(),
        frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "semi_annual", "annual"]),
        intervalDays: z.number().optional(),
        basedOn: z.enum(["calendar", "meter", "condition"]).optional(),
        meterType: z.string().optional(),
        meterInterval: z.string().optional(),
        estimatedHours: z.string().optional(),
        estimatedCost: z.string().optional(),
        tasks: z.array(z.object({
          description: z.string(),
          estimatedHours: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createMaintenancePlan({
          ...input,
          businessId: input.businessId || 1,
          tasks: input.tasks ? JSON.stringify(input.tasks) : null,
          createdBy: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        assetCategoryId: z.number().optional(),
        frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "semi_annual", "annual"]).optional(),
        intervalDays: z.number().optional(),
        basedOn: z.enum(["calendar", "meter", "condition"]).optional(),
        meterType: z.string().optional(),
        meterInterval: z.string().optional(),
        estimatedHours: z.string().optional(),
        estimatedCost: z.string().optional(),
        tasks: z.array(z.object({
          description: z.string(),
          estimatedHours: z.string().optional(),
        })).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tasks, ...data } = input;
        await db.updateMaintenancePlan(id, {
          ...data,
          tasks: tasks ? JSON.stringify(tasks) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMaintenancePlan(input.id);
        return { success: true };
      }),

    generateWorkOrders: protectedProcedure
      .input(z.object({
        planId: z.number(),
        assetIds: z.array(z.number()).optional(),
        scheduledDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.generateWorkOrdersFromPlan({
          ...input,
          userId: ctx.user?.id || 1,
        });
        return { success: true, ...result };
      }),
  }),

  // ============================================
  // Technicians - الفنيين
  // ============================================
  technicians: router({
    list: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        specialization: z.string().optional(),
        isAvailable: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTechnicians(input.businessId || 1, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const technician = await db.getTechnicianById(input.id);
        if (!technician) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الفني غير موجود" });
        }
        return technician;
      }),

    create: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        employeeId: z.number().optional(),
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        specialization: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        hourlyRate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createTechnician({
          ...input,
          businessId: input.businessId || 1,
        });
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        employeeId: z.number().optional(),
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        specialization: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        hourlyRate: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTechnician(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTechnician(input.id);
        return { success: true };
      }),

    getWorkload: protectedProcedure
      .input(z.object({
        technicianId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTechnicianWorkload(input);
      }),
  }),

  // ============================================
  // Spare Parts Usage - استخدام قطع الغيار
  // ============================================
  spareParts: router({
    getByWorkOrder: protectedProcedure
      .input(z.object({
        workOrderId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getWorkOrderSpareParts(input.workOrderId);
      }),

    add: protectedProcedure
      .input(z.object({
        workOrderId: z.number(),
        itemId: z.number(),
        quantity: z.string(),
        unitCost: z.string().optional(),
        warehouseId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.addSparePartToWorkOrder({
          ...input,
          userId: ctx.user?.id || 1,
        });
        return { success: true, id };
      }),

    remove: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.removeSparePartFromWorkOrder(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // Dashboard Stats - إحصائيات لوحة التحكم
  // ============================================
  dashboardStats: protectedProcedure
    .input(z.object({
      businessId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getMaintenanceDashboardStats(input.businessId || 1);
    }),

  // ============================================
  // Reports - التقارير
  // ============================================
  reports: router({
    workOrderSummary: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        groupBy: z.enum(["status", "type", "priority", "technician", "asset"]).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getWorkOrderSummaryReport(input.businessId || 1, input);
      }),

    maintenanceCosts: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        assetId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getMaintenanceCostsReport(input.businessId || 1, input);
      }),

    equipmentDowntime: protectedProcedure
      .input(z.object({
        businessId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getEquipmentDowntimeReport(input.businessId || 1, input);
      }),
  }),
});
