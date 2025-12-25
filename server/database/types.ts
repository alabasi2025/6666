/**
 * @fileoverview أنواع TypeScript لنظام تحسين قاعدة البيانات
 * @module database/types
 */

/**
 * إعدادات Connection Pool
 */
export interface PoolConfig {
  /** الحد الأدنى للاتصالات */
  minConnections: number;
  /** الحد الأقصى للاتصالات */
  maxConnections: number;
  /** وقت انتظار الاتصال (بالمللي ثانية) */
  acquireTimeout: number;
  /** وقت الخمول قبل الإغلاق (بالمللي ثانية) */
  idleTimeout: number;
  /** فترة التحقق من الاتصالات (بالمللي ثانية) */
  healthCheckInterval: number;
}

/**
 * حالة الاتصال
 */
export interface ConnectionState {
  id: string;
  status: 'idle' | 'busy' | 'error';
  createdAt: Date;
  lastUsedAt: Date;
  queryCount: number;
}

/**
 * إحصائيات Pool
 */
export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  busyConnections: number;
  waitingRequests: number;
  totalQueriesExecuted: number;
  averageQueryTime: number;
}

/**
 * إعدادات Query Cache
 */
export interface CacheConfig {
  /** تفعيل الكاش */
  enabled: boolean;
  /** الحد الأقصى للعناصر */
  maxSize: number;
  /** وقت انتهاء الصلاحية الافتراضي (بالثواني) */
  defaultTTL: number;
  /** أنماط الاستعلامات المستثناة */
  excludePatterns: RegExp[];
}

/**
 * عنصر في الكاش
 */
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  size: number;
}

/**
 * إحصائيات الكاش
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
}

/**
 * نتيجة تحليل الاستعلام
 */
export interface QueryAnalysis {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexUsed: boolean;
  indexName?: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * إحصائيات الاستعلام
 */
export interface QueryStats {
  query: string;
  executionCount: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  lastExecutedAt: Date;
}

/**
 * حالة صحة قاعدة البيانات
 */
export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  activeConnections: number;
  maxConnections: number;
  uptime: number;
  version: string;
  lastCheckedAt: Date;
  issues: HealthIssue[];
}

/**
 * مشكلة صحية
 */
export interface HealthIssue {
  type: 'connection' | 'performance' | 'storage' | 'replication';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  detectedAt: Date;
}

/**
 * مقاييس المراقبة
 */
export interface MonitoringMetrics {
  timestamp: Date;
  queriesPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  connectionUtilization: number;
  cacheHitRate: number;
  slowQueries: number;
}
