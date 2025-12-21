import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const scadaRouter = router({
  // المعدات والأجهزة
  equipment: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getScadaEquipment(input.businessId, input.stationId, input.type);
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
        specifications: z.any().optional(),
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
          specifications: z.any().optional(),
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
        equipmentId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSensors(input.businessId, input.stationId, input.equipmentId);
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
        warningThreshold: z.number().optional(),
        criticalThreshold: z.number().optional(),
        status: z.string().optional(),
        location: z.string().optional(),
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
          warningThreshold: z.number().optional(),
          criticalThreshold: z.number().optional(),
          status: z.string().optional(),
          location: z.string().optional(),
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

    // قراءات المستشعرات
    readings: publicProcedure
      .input(z.object({
        sensorId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSensorReadings(input.sensorId, input.startDate, input.endDate, input.limit);
      }),

    // أحدث قراءة
    latestReading: publicProcedure
      .input(z.object({ sensorId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestSensorReading(input.sensorId);
      }),
  }),

  // التنبيهات
  alerts: router({
    list: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAlerts(input.businessId, input.stationId, input.type, input.status);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAlertById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        businessId: z.number(),
        stationId: z.number().optional(),
        equipmentId: z.number().optional(),
        sensorId: z.number().optional(),
        alertType: z.string(),
        title: z.string(),
        message: z.string().optional(),
        priority: z.string().optional(),
        status: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAlert(input);
      }),

    // تحديث حالة التنبيه
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
        acknowledgedBy: z.number().optional(),
        resolvedBy: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateAlertStatus(input.id, input.status, input.acknowledgedBy, input.resolvedBy, input.notes);
      }),

    // حذف تنبيه
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAlert(input.id);
      }),

    // إحصائيات التنبيهات
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
        status: z.string().optional(),
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
        ipAddress: z.string().optional(),
        port: z.number().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        streamUrl: z.string().optional(),
        location: z.string().optional(),
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
          ipAddress: z.string().optional(),
          port: z.number().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
          streamUrl: z.string().optional(),
          location: z.string().optional(),
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

  // لوحة المراقبة
  dashboard: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return await db.getScadaDashboard(input.businessId);
    }),

  // إحصائيات عامة
  stats: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return await db.getScadaStats(input.businessId);
    }),
});
