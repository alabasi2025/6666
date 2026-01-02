// server/cache/cache-stats.ts

import { cacheManager } from './cache-manager';
import { CacheStats } from './types';
import { logger } from '../utils/logger';

interface DetailedStats extends CacheStats {
  uptime: number;
  lastCleanup: Date | null;
  namespaceStats: Record<string, number>;
}

class CacheStatsCollector {
  private startTime: Date = new Date();
  private lastCleanup: Date | null = null;

  /**
   * الحصول على إحصائيات مفصلة
   */
  getDetailedStats(): DetailedStats {
    const basicStats = cacheManager.getStats();
    
    return {
      ...basicStats,
      uptime: Date.now() - this.startTime.getTime(),
      lastCleanup: this.lastCleanup,
      namespaceStats: this.getNamespaceStats(),
    };
  }

  /**
   * الحصول على إحصائيات حسب namespace
   */
  private getNamespaceStats(): Record<string, number> {
    // يمكن تحسين هذا لاحقاً
    return {};
  }

  /**
   * تسجيل عملية تنظيف
   */
  recordCleanup(): void {
    this.lastCleanup = new Date();
  }

  /**
   * تصدير الإحصائيات كـ JSON
   */
  exportStats(): string {
    return JSON.stringify(this.getDetailedStats(), null, 2);
  }

  /**
   * طباعة الإحصائيات
   */
  printStats(): void {
    const stats = this.getDetailedStats();
    logger.info('=== Cache Statistics ===', {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
      size: `${stats.size} entries`,
      memory: `${(stats.memoryUsage / 1024).toFixed(2)} KB`,
      uptime: `${Math.floor(stats.uptime / 1000)}s`,
    });
  }
}

export const cacheStats = new CacheStatsCollector();
export { CacheStatsCollector };
