/**
 * @fileoverview فحص صحة قاعدة البيانات
 * @module database/db-health
 */

import { DatabaseHealth, HealthIssue } from './types';
import { connectionPool } from './connection-pool';

/**
 * فاحص صحة قاعدة البيانات
 * @class DatabaseHealthChecker
 */
export class DatabaseHealthChecker {
  private lastHealth: DatabaseHealth | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * بدء الفحص الدوري
   */
  startPeriodicCheck(intervalMs = 30000): void {
    if (this.checkInterval) {
      this.stopPeriodicCheck();
    }

    this.checkInterval = setInterval(() => {
      this.check();
    }, intervalMs);

    // فحص فوري
    this.check();
  }

  /**
   * إيقاف الفحص الدوري
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * فحص صحة قاعدة البيانات
   */
  async check(): Promise<DatabaseHealth> {
    const issues: HealthIssue[] = [];
    const startTime = Date.now();

    // فحص الاتصال
    let connectionOk = false;
    try {
      const conn = await connectionPool.acquire();
      connectionPool.release(conn);
      connectionOk = true;
    } catch (error) {
      issues.push({
        type: 'connection',
        severity: 'critical',
        message: `فشل الاتصال بقاعدة البيانات: ${error}`,
        detectedAt: new Date(),
      });
    }

    const responseTime = Date.now() - startTime;

    // فحص وقت الاستجابة
    if (responseTime > 5000) {
      issues.push({
        type: 'performance',
        severity: 'critical',
        message: `وقت الاستجابة عالي جداً: ${responseTime}ms`,
        detectedAt: new Date(),
      });
    } else if (responseTime > 2000) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: `وقت الاستجابة عالي: ${responseTime}ms`,
        detectedAt: new Date(),
      });
    }

    // فحص Pool
    const poolStats = connectionPool.getStats();
    
    if (poolStats.waitingRequests > 10) {
      issues.push({
        type: 'connection',
        severity: 'error',
        message: `طلبات كثيرة منتظرة: ${poolStats.waitingRequests}`,
        detectedAt: new Date(),
      });
    }

    const utilization = poolStats.totalConnections > 0 
      ? poolStats.busyConnections / poolStats.totalConnections 
      : 0;
    if (utilization > 0.9) {
      issues.push({
        type: 'connection',
        severity: 'warning',
        message: `استخدام الاتصالات عالي: ${(utilization * 100).toFixed(0)}%`,
        detectedAt: new Date(),
      });
    }

    // تحديد الحالة العامة
    let status: DatabaseHealth['status'] = 'healthy';
    if (issues.some((i) => i.severity === 'critical')) {
      status = 'unhealthy';
    } else if (issues.some((i) => i.severity === 'error' || i.severity === 'warning')) {
      status = 'degraded';
    }

    const health: DatabaseHealth = {
      status,
      responseTime,
      activeConnections: poolStats.busyConnections,
      maxConnections: poolStats.totalConnections,
      uptime: process.uptime(),
      version: 'MySQL 8.0',
      lastCheckedAt: new Date(),
      issues,
    };

    this.lastHealth = health;
    return health;
  }

  /**
   * الحصول على آخر نتيجة فحص
   */
  getLastHealth(): DatabaseHealth | null {
    return this.lastHealth;
  }

  /**
   * التحقق من الصحة (للـ health endpoints)
   */
  async isHealthy(): Promise<boolean> {
    const health = await this.check();
    return health.status === 'healthy';
  }
}

// تصدير instance واحد
export const dbHealthChecker = new DatabaseHealthChecker();
