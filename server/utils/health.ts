/**
 * @fileoverview Health Checks و Monitoring
 * @module server/utils/health
 */
import { getDb } from "../db";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
  };
}

interface HealthCheck {
  status: "pass" | "fail" | "warn";
  message: string;
  duration?: number;
}

const startTime = Date.now();

/**
 * فحص صحة قاعدة البيانات
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const db = await getDb();
    if (!db) {
      return {
        status: "warn",
        message: "Database not configured (Demo Mode)",
        duration: Date.now() - start
      };
    }
    return {
      status: "pass",
      message: "Database connection successful",
      duration: Date.now() - start
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start
    };
  }
}

/**
 * فحص استخدام الذاكرة
 */
function checkMemory(): HealthCheck {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const percentage = Math.round((used.heapUsed / used.heapTotal) * 100);
  
  if (percentage > 90) {
    return {
      status: "fail",
      message: `Memory critical: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentage}%)`
    };
  } else if (percentage > 75) {
    return {
      status: "warn",
      message: `Memory high: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentage}%)`
    };
  }
  
  return {
    status: "pass",
    message: `Memory OK: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentage}%)`
  };
}

/**
 * فحص مساحة القرص (تقريبي)
 */
function checkDisk(): HealthCheck {
  // في بيئة الإنتاج، يجب استخدام مكتبة لفحص القرص
  return {
    status: "pass",
    message: "Disk check not implemented in this environment"
  };
}

/**
 * جلب حالة الصحة الكاملة
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const [database, memory, disk] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory()),
    Promise.resolve(checkDisk())
  ]);
  
  // تحديد الحالة العامة
  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  
  if (database.status === "fail" || memory.status === "fail") {
    status = "unhealthy";
  } else if (database.status === "warn" || memory.status === "warn") {
    status = "degraded";
  }
  
  return {
    status,
    timestamp: new Date(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database,
      memory,
      disk
    }
  };
}

/**
 * فحص سريع للـ liveness
 */
export function getLivenessStatus(): { status: "ok"; timestamp: Date } {
  return {
    status: "ok",
    timestamp: new Date()
  };
}

/**
 * فحص الجاهزية للـ readiness
 */
export async function getReadinessStatus(): Promise<{
  ready: boolean;
  timestamp: Date;
  database: boolean;
}> {
  const db = await getDb();
  return {
    ready: true,
    timestamp: new Date(),
    database: !!db
  };
}

/**
 * جمع المقاييس للـ Monitoring
 */
export function getMetrics(): {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  timestamp: Date;
} {
  return {
    uptime: Math.round((Date.now() - startTime) / 1000),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date()
  };
}
