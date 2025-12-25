/**
 * @fileoverview نظام مراقبة قاعدة البيانات
 * @module database/db-monitor
 */

import { MonitoringMetrics } from './types';
import { logger } from '../utils/logger';
import { connectionPool } from './connection-pool';
import { queryCache } from './query-cache';
import { queryOptimizer } from './query-optimizer';

/**
 * مراقب قاعدة البيانات
 * @class DatabaseMonitor
 */
export class DatabaseMonitor {
  private metricsHistory: MonitoringMetrics[] = [];
  private maxHistorySize = 1000;
  private collectionInterval: ReturnType<typeof setInterval> | null = null;
  private errorCount = 0;
  private queryCount = 0;
  private lastCollectionTime = Date.now();

  /**
   * بدء المراقبة
   */
  start(intervalMs = 60000): void {
    if (this.collectionInterval) {
      this.stop();
    }

    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    logger.debug(`[DatabaseMonitor] بدأت المراقبة بفاصل ${intervalMs}ms`);
  }

  /**
   * إيقاف المراقبة
   */
  stop(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
  }

  /**
   * جمع المقاييس
   */
  private collectMetrics(): void {
    const now = Date.now();
    const timeDiff = (now - this.lastCollectionTime) / 1000;

    const poolStats = connectionPool.getStats();
    const cacheStats = queryCache.getStats();
    const slowQueries = queryOptimizer.getSlowQueries(100);

    const metrics: MonitoringMetrics = {
      timestamp: new Date(),
      queriesPerSecond: this.queryCount / timeDiff,
      averageResponseTime: poolStats.averageQueryTime,
      errorRate: this.queryCount > 0 ? this.errorCount / this.queryCount : 0,
      connectionUtilization:
        poolStats.totalConnections > 0
          ? poolStats.busyConnections / poolStats.totalConnections
          : 0,
      cacheHitRate: cacheStats.hitRate,
      slowQueries: slowQueries.length,
    };

    this.metricsHistory.push(metrics);

    // الحفاظ على حجم السجل
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // إعادة تعيين العدادات
    this.queryCount = 0;
    this.errorCount = 0;
    this.lastCollectionTime = now;
  }

  /**
   * تسجيل استعلام
   */
  recordQuery(): void {
    this.queryCount++;
  }

  /**
   * تسجيل خطأ
   */
  recordError(): void {
    this.errorCount++;
  }

  /**
   * الحصول على المقاييس الحالية
   */
  getCurrentMetrics(): MonitoringMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  /**
   * الحصول على سجل المقاييس
   */
  getMetricsHistory(limit?: number): MonitoringMetrics[] {
    if (limit) {
      return this.metricsHistory.slice(-limit);
    }
    return [...this.metricsHistory];
  }

  /**
   * الحصول على ملخص الأداء
   */
  getPerformanceSummary(): {
    averageQPS: number;
    averageResponseTime: number;
    averageErrorRate: number;
    averageCacheHitRate: number;
    peakQPS: number;
    peakResponseTime: number;
  } {
    if (this.metricsHistory.length === 0) {
      return {
        averageQPS: 0,
        averageResponseTime: 0,
        averageErrorRate: 0,
        averageCacheHitRate: 0,
        peakQPS: 0,
        peakResponseTime: 0,
      };
    }

    let totalQPS = 0;
    let totalResponseTime = 0;
    let totalErrorRate = 0;
    let totalCacheHitRate = 0;
    let peakQPS = 0;
    let peakResponseTime = 0;

    for (const metrics of this.metricsHistory) {
      totalQPS += metrics.queriesPerSecond;
      totalResponseTime += metrics.averageResponseTime;
      totalErrorRate += metrics.errorRate;
      totalCacheHitRate += metrics.cacheHitRate;
      peakQPS = Math.max(peakQPS, metrics.queriesPerSecond);
      peakResponseTime = Math.max(peakResponseTime, metrics.averageResponseTime);
    }

    const count = this.metricsHistory.length;

    return {
      averageQPS: totalQPS / count,
      averageResponseTime: totalResponseTime / count,
      averageErrorRate: totalErrorRate / count,
      averageCacheHitRate: totalCacheHitRate / count,
      peakQPS,
      peakResponseTime,
    };
  }

  /**
   * تصدير التقرير
   */
  exportReport(): string {
    const summary = this.getPerformanceSummary();
    const poolStats = connectionPool.getStats();
    const cacheStats = queryCache.getStats();
    const slowQueries = queryOptimizer.getSlowQueries(5);

    return `
# تقرير أداء قاعدة البيانات
التاريخ: ${new Date().toISOString()}

## ملخص الأداء
- متوسط الاستعلامات/ثانية: ${summary.averageQPS.toFixed(2)}
- متوسط وقت الاستجابة: ${summary.averageResponseTime.toFixed(2)}ms
- معدل الأخطاء: ${(summary.averageErrorRate * 100).toFixed(2)}%
- معدل إصابة الكاش: ${(summary.averageCacheHitRate * 100).toFixed(2)}%

## Connection Pool
- إجمالي الاتصالات: ${poolStats.totalConnections}
- الاتصالات النشطة: ${poolStats.busyConnections}
- الاتصالات الخاملة: ${poolStats.idleConnections}
- الطلبات المنتظرة: ${poolStats.waitingRequests}

## Query Cache
- العناصر المخزنة: ${cacheStats.totalEntries}
- الحجم: ${(cacheStats.totalSize / 1024).toFixed(2)} KB
- الإصابات: ${cacheStats.hitCount}
- الإخفاقات: ${cacheStats.missCount}

## أبطأ 5 استعلامات
${slowQueries.map((q, i) => `${i + 1}. ${q.query.substring(0, 50)}... (${q.averageTime.toFixed(2)}ms)`).join('\n')}
    `.trim();
  }
}

// تصدير instance واحد
export const dbMonitor = new DatabaseMonitor();
