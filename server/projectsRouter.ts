import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const projectsRouter = router({
  // قائمة المشاريع
  list: publicProcedure
    .input(z.object({
      businessId: z.number(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getProjects(input.businessId, { status: input.status });
    }),

  // تفاصيل مشروع
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getProjectById(input.id);
    }),

  // إنشاء مشروع جديد
  create: publicProcedure
    .input(z.object({
      businessId: z.number(),
      code: z.string(),
      nameAr: z.string(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(["construction", "expansion", "maintenance", "upgrade", "installation", "decommission", "study"]),
      managerId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.string().optional(),
      status: z.enum(["planning", "in_progress", "on_hold", "completed", "cancelled", "delayed", "closed"]).optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      progress: z.number().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createProject(input as any);
    }),

  // تحديث مشروع
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        code: z.string().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        managerId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.string().optional(),
        status: z.enum(["planning", "in_progress", "on_hold", "completed", "cancelled", "delayed", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        progress: z.number().optional(),
        location: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return await db.updateProject(input.id, input.data as any);
    }),

  // حذف مشروع
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteProject(input.id);
    }),

  // مراحل المشروع
  phases: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectPhases(input.projectId);
      }),

    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        progress: z.number().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProjectPhase(input as any);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          status: z.string().optional(),
          progress: z.number().optional(),
          sortOrder: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateProjectPhase(input.id, input.data as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProjectPhase(input.id);
      }),
  }),

  // مهام المشروع
  tasks: router({
    list: publicProcedure
      .input(z.object({ 
        projectId: z.number().optional(),
        phaseId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getProjectTasks(input.projectId, input.phaseId);
      }),

    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        phaseId: z.number().optional(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        assigneeId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        progress: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProjectTask(input as any);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          assigneeId: z.number().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          status: z.string().optional(),
          priority: z.string().optional(),
          progress: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateProjectTask(input.id, input.data as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProjectTask(input.id);
      }),
  }),

  // إحصائيات المشاريع
  stats: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return await db.getProjectsStats(input.businessId);
    }),
});
