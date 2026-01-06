/**
 * محرك الإسناد الذكي
 * Smart Assignment Engine
 * 
 * محرك يُسند المهام الطارئة للفني الأقرب تلقائياً
 */

import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import { fieldWorkers, fieldOperations, workerLocations } from "../../drizzle/schemas/field-ops";
import { workOrders } from "../../drizzle/schemas/maintenance";
import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

export interface WorkerLocation {
  workerId: number;
  nameAr: string;
  latitude: number;
  longitude: number;
  status: "available" | "busy" | "on_leave" | "inactive";
  lastLocationUpdate?: Date;
  distance?: number; // المسافة من المهمة (بالكيلومتر)
}

export interface AssignmentResult {
  workerId: number;
  workerName: string;
  distance: number; // بالكيلومتر
  estimatedArrivalTime?: number; // بالدقائق
}

// ============================================
// Smart Assignment Engine Class
// ============================================

export class SmartAssignmentEngine {
  /**
   * إسناد مهمة طارئة للفني الأقرب
   */
  static async assignEmergencyTask(data: {
    businessId: number;
    operationId?: number;
    workOrderId?: number;
    taskLatitude: number;
    taskLongitude: number;
    taskType?: string;
    requiredSkills?: string[];
    maxDistance?: number; // الحد الأقصى للمسافة بالكيلومتر
  }): Promise<AssignmentResult | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // جلب الفنيين المتاحين
      const availableWorkers = await this.getAvailableWorkers(
        data.businessId,
        data.taskType,
        data.requiredSkills
      );

      if (availableWorkers.length === 0) {
        logger.warn("No available workers found", { businessId: data.businessId });
        return null;
      }

      // حساب المسافة لكل فني
      const workersWithDistance = availableWorkers
        .map((worker) => {
          if (!worker.latitude || !worker.longitude) return null;

          const distance = this.calculateDistance(
            data.taskLatitude,
            data.taskLongitude,
            parseFloat(worker.latitude.toString()),
            parseFloat(worker.longitude.toString())
          );

          return {
            ...worker,
            distance,
          };
        })
        .filter((w): w is WorkerLocation & { distance: number } => w !== null);

      // فلترة حسب المسافة القصوى
      const filteredWorkers = data.maxDistance
        ? workersWithDistance.filter((w) => w.distance <= data.maxDistance)
        : workersWithDistance;

      if (filteredWorkers.length === 0) {
        logger.warn("No workers within max distance", {
          businessId: data.businessId,
          maxDistance: data.maxDistance,
        });
        return null;
      }

      // ترتيب حسب المسافة (الأقرب أولاً)
      filteredWorkers.sort((a, b) => a.distance - b.distance);

      // اختيار الأقرب
      const nearestWorker = filteredWorkers[0];

      // إسناد المهمة
      if (data.operationId) {
        await this.assignToOperation(data.operationId, nearestWorker.workerId);
      } else if (data.workOrderId) {
        await this.assignToWorkOrder(data.workOrderId, nearestWorker.workerId);
      }

      // حساب وقت الوصول المتوقع (افتراضي: 2 دقيقة لكل كيلومتر)
      const estimatedArrivalTime = Math.round(nearestWorker.distance * 2);

      logger.info("Task assigned to nearest worker", {
        workerId: nearestWorker.workerId,
        workerName: nearestWorker.nameAr,
        distance: nearestWorker.distance.toFixed(2),
        estimatedArrivalTime,
      });

      return {
        workerId: nearestWorker.workerId,
        workerName: nearestWorker.nameAr,
        distance: nearestWorker.distance,
        estimatedArrivalTime,
      };
    } catch (error: any) {
      logger.error("Failed to assign emergency task", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * جلب الفنيين المتاحين
   */
  static async getAvailableWorkers(
    businessId: number,
    taskType?: string,
    requiredSkills?: string[]
  ): Promise<WorkerLocation[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      let conditions = [
        eq(fieldWorkers.businessId, businessId),
        eq(fieldWorkers.status, "available"),
        eq(fieldWorkers.isActive, true),
      ];

      // فلترة حسب نوع المهمة
      if (taskType) {
        // يمكن إضافة منطق أكثر تعقيداً هنا
      }

      const workers = await db
        .select({
          workerId: fieldWorkers.id,
          nameAr: fieldWorkers.nameAr,
          latitude: fieldWorkers.currentLocationLat,
          longitude: fieldWorkers.currentLocationLng,
          status: fieldWorkers.status,
          lastLocationUpdate: fieldWorkers.lastLocationUpdate,
        })
        .from(fieldWorkers)
        .where(and(...conditions));

      // فلترة حسب المهارات المطلوبة
      let filteredWorkers = workers;
      if (requiredSkills && requiredSkills.length > 0) {
        // TODO: تنفيذ فلترة حسب المهارات من حقل skills (JSON)
        // حالياً نرجع جميع العاملين المتاحين
      }

      // فلترة العاملين الذين لديهم موقع GPS
      return filteredWorkers
        .filter((w) => w.latitude && w.longitude)
        .map((w) => ({
          workerId: w.workerId,
          nameAr: w.nameAr,
          latitude: parseFloat(w.latitude?.toString() || "0"),
          longitude: parseFloat(w.longitude?.toString() || "0"),
          status: w.status as "available" | "busy" | "on_leave" | "inactive",
          lastLocationUpdate: w.lastLocationUpdate,
        }));
    } catch (error: any) {
      logger.error("Failed to get available workers", {
        error: error.message,
        businessId,
      });
      return [];
    }
  }

  /**
   * حساب المسافة بين نقطتين (Haversine formula)
   * النتيجة بالكيلومتر
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * تحويل الدرجات إلى راديان
   */
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * إسناد مهمة لعملية ميدانية
   */
  static async assignToOperation(operationId: number, workerId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      await db
        .update(fieldOperations)
        .set({
          assignedWorkerId: workerId,
          status: "assigned",
        })
        .where(eq(fieldOperations.id, operationId));

      // تحديث حالة العامل إلى "busy"
      await db
        .update(fieldWorkers)
        .set({ status: "busy" })
        .where(eq(fieldWorkers.id, workerId));

      logger.info("Operation assigned to worker", { operationId, workerId });
    } catch (error: any) {
      logger.error("Failed to assign operation", {
        error: error.message,
        operationId,
        workerId,
      });
      throw error;
    }
  }

  /**
   * إسناد مهمة لأمر عمل
   */
  static async assignToWorkOrder(workOrderId: number, workerId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      await db
        .update(workOrders)
        .set({
          assignedTo: workerId,
          status: "assigned",
        })
        .where(eq(workOrders.id, workOrderId));

      // تحديث حالة العامل إلى "busy"
      await db
        .update(fieldWorkers)
        .set({ status: "busy" })
        .where(eq(fieldWorkers.id, workerId));

      logger.info("Work order assigned to worker", { workOrderId, workerId });
    } catch (error: any) {
      logger.error("Failed to assign work order", {
        error: error.message,
        workOrderId,
        workerId,
      });
      throw error;
    }
  }

  /**
   * جلب الفنيين الأقرب لمهمة معينة (بدون إسناد)
   */
  static async getNearestWorkers(
    businessId: number,
    latitude: number,
    longitude: number,
    limit: number = 5
  ): Promise<Array<{ workerId: number; nameAr: string; distance: number }>> {
    const availableWorkers = await this.getAvailableWorkers(businessId);

    const workersWithDistance = availableWorkers
      .map((worker) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          worker.latitude,
          worker.longitude
        );

        return {
          workerId: worker.workerId,
          nameAr: worker.nameAr,
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return workersWithDistance;
  }

  /**
   * إعادة إسناد مهمة (عند رفض الفني أو عدم توفره)
   */
  static async reassignTask(
    operationId: number,
    reason: string,
    excludeWorkerId?: number
  ): Promise<AssignmentResult | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // جلب بيانات المهمة
      const [operation] = await db
        .select({
          id: fieldOperations.id,
          businessId: fieldOperations.businessId,
          latitude: fieldOperations.locationLat,
          longitude: fieldOperations.locationLng,
          operationType: fieldOperations.operationType,
        })
        .from(fieldOperations)
        .where(eq(fieldOperations.id, operationId))
        .limit(1);

      if (!operation || !operation.latitude || !operation.longitude) {
        throw new Error("المهمة لا تحتوي على موقع GPS");
      }

      // إعادة الإسناد (مع استثناء الفني السابق)
      const result = await this.assignEmergencyTask({
        businessId: operation.businessId,
        operationId,
        taskLatitude: parseFloat(operation.latitude.toString()),
        taskLongitude: parseFloat(operation.longitude.toString()),
        taskType: operation.operationType,
      });

      if (result) {
        logger.info("Task reassigned", {
          operationId,
          newWorkerId: result.workerId,
          reason,
        });
      }

      return result;
    } catch (error: any) {
      logger.error("Failed to reassign task", {
        error: error.message,
        operationId,
        reason,
      });
      throw error;
    }
  }
}

