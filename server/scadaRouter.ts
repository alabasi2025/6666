import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

/**
 * @fileoverview Router لنظام SCADA للتحكم والمراقبة
 * @module scadaRouter
 * @description يوفر هذا الـ Router جميع العمليات المتعلقة بنظام SCADA
 * بما في ذلك إدارة المحطات، المولدات، الخزانات، المضخات،
 * القراءات، التنبيهات، والتقارير.
 * 
 * @requires zod - للتحقق من صحة البيانات المدخلة
 * @requires @trpc/server - لإنشاء الـ API endpoints
 * @requires ./db - للتعامل مع قاعدة البيانات
 * 
 * @author فريق التطوير
 * @version 1.0.0
 * @since 2024-01-01
 */

export const scadaRouter = router({
  // المعدات والأجهزة
  equipment: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getScadaEquipment(input.businessId, input.status);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getScadaEquipmentById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        code: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        type: z.string(),
        model: z.string().optional(),
        manufacturer: z.string().optional(),
        serialNumber: z.string().optional(),
        installationDate: z.string().optional(),
        status: z.string().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createScadaEquipment(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          stationId: z.number().optional(),
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          type: z.string().optional(),
          model: z.string().optional(),
          manufacturer: z.string().optional(),
          serialNumber: z.string().optional(),
          installationDate: z.string().optional(),
          status: z.string().optional(),
          location: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateScadaEquipment(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteScadaEquipment(input.id);
      }),
  }),

  // المستشعرات
  sensors: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSensors(input.businessId, input.stationId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSensorById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        equipmentId: z.number().optional(),
        code: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        type: z.string(),
        unit: z.string().optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        status: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createSensor(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          stationId: z.number().optional(),
          equipmentId: z.number().optional(),
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          type: z.string().optional(),
          unit: z.string().optional(),
          minValue: z.number().optional(),
          maxValue: z.number().optional(),
          status: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateSensor(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteSensor(input.id);
      }),

    readings: publicProcedure
      .input(z.object({
        sensorId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSensorReadings(input.sensorId, { limit: input.limit });
      }),
  }),

  // التنبيهات
  alerts: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        status: z.string().optional(),
        type: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAlerts(input.businessId, { status: input.status, type: input.type });
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAlertById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        businessId: z.number(),
        alertType: z.enum(["info", "warning", "critical", "emergency"]),
        title: z.string(),
        stationId: z.number().optional(),
        equipmentId: z.number().optional(),
        sensorId: z.number().optional(),
        message: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        status: z.enum(["active", "acknowledged", "resolved", "escalated"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAlert(input as any);
      }),

    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateAlertStatus(input.id, input.status);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAlert(input.id);
      }),

    stats: publicProcedure
      .input(z.object({ businessId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAlertsStats(input.businessId);
      }),
  }),

  // الكاميرات
  cameras: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCameras(input.businessId, input.stationId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCameraById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        code: z.string(),
        nameAr: z.string(),
        nameEn: z.string().optional(),
        type: z.string().optional(),
        streamUrl: z.string().optional(),
        status: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCamera(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          stationId: z.number().optional(),
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          type: z.string().optional(),
          streamUrl: z.string().optional(),
          status: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateCamera(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCamera(input.id);
      }),
  }),
});
