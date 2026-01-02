# 📋 المهمة 11: تحسين أداء قاعدة البيانات (Database Performance Optimization)

## 🎯 الهدف
إنشاء نظام شامل لتحسين أداء قاعدة البيانات يشمل: Connection Pooling، Query Caching، Query Optimization، و Database Monitoring.

---

## 📁 الفرع
```
feature/task11-database-performance
```

---

## ✅ الملفات المسموح إنشاؤها (فقط)
```
server/database/connection-pool.ts (جديد)
server/database/query-cache.ts (جديد)
server/database/query-optimizer.ts (جديد)
server/database/db-monitor.ts (جديد)
server/database/db-health.ts (جديد)
server/database/index.ts (جديد)
server/database/types.ts (جديد)
```

---

## 🚫 الملفات الممنوع تعديلها
```
❌ drizzle/schema.ts
❌ server/db.ts (الملف الأصلي)
❌ server/*Router.ts
❌ client/**/*
❌ docs/**/*
```

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task11-database-performance
git pull origin feature/task11-database-performance
mkdir -p server/database
```

### الخطوة 2: إنشاء ملف الأنواع

**الملف:** `server/database/types.ts`

```typescript
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
```

### الخطوة 3: إنشاء Connection Pool Manager

**الملف:** `server/database/connection-pool.ts`

```typescript
/**
 * @fileoverview إدارة Connection Pool لقاعدة البيانات
 * @module database/connection-pool
 */

import { PoolConfig, PoolStats, ConnectionState } from './types';

/**
 * إعدادات افتراضية لـ Connection Pool
 */
const DEFAULT_POOL_CONFIG: PoolConfig = {
  minConnections: 5,
  maxConnections: 20,
  acquireTimeout: 30000,
  idleTimeout: 60000,
  healthCheckInterval: 30000,
};

/**
 * مدير Connection Pool
 * @class ConnectionPoolManager
 */
export class ConnectionPoolManager {
  private config: PoolConfig;
  private connections: Map<string, ConnectionState> = new Map();
  private waitingQueue: Array<{
    resolve: (conn: string) => void;
    reject: (err: Error) => void;
    timestamp: number;
  }> = [];
  private healthCheckTimer: NodeJS.Timer | null = null;
  private stats = {
    totalQueriesExecuted: 0,
    totalQueryTime: 0,
  };

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
  }

  /**
   * تهيئة Pool
   */
  async initialize(): Promise<void> {
    // إنشاء الحد الأدنى من الاتصالات
    for (let i = 0; i < this.config.minConnections; i++) {
      await this.createConnection();
    }

    // بدء فحص الصحة الدوري
    this.startHealthCheck();

    console.log(`[ConnectionPool] تم تهيئة Pool بـ ${this.connections.size} اتصال`);
  }

  /**
   * إنشاء اتصال جديد
   */
  private async createConnection(): Promise<string> {
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const state: ConnectionState = {
      id,
      status: 'idle',
      createdAt: new Date(),
      lastUsedAt: new Date(),
      queryCount: 0,
    };

    this.connections.set(id, state);
    return id;
  }

  /**
   * الحصول على اتصال من Pool
   */
  async acquire(): Promise<string> {
    // البحث عن اتصال خامل
    for (const [id, state] of this.connections) {
      if (state.status === 'idle') {
        state.status = 'busy';
        state.lastUsedAt = new Date();
        return id;
      }
    }

    // إنشاء اتصال جديد إذا لم نصل للحد الأقصى
    if (this.connections.size < this.config.maxConnections) {
      const id = await this.createConnection();
      const state = this.connections.get(id)!;
      state.status = 'busy';
      return id;
    }

    // الانتظار في الطابور
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(
          (item) => item.resolve === resolve
        );
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('انتهى وقت انتظار الاتصال'));
      }, this.config.acquireTimeout);

      this.waitingQueue.push({
        resolve: (conn) => {
          clearTimeout(timeout);
          resolve(conn);
        },
        reject,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * إرجاع اتصال إلى Pool
   */
  release(connectionId: string): void {
    const state = this.connections.get(connectionId);
    if (!state) return;

    // التحقق من وجود طلبات منتظرة
    if (this.waitingQueue.length > 0) {
      const waiting = this.waitingQueue.shift()!;
      state.lastUsedAt = new Date();
      waiting.resolve(connectionId);
      return;
    }

    state.status = 'idle';
    state.lastUsedAt = new Date();
  }

  /**
   * تسجيل تنفيذ استعلام
   */
  recordQuery(connectionId: string, executionTime: number): void {
    const state = this.connections.get(connectionId);
    if (state) {
      state.queryCount++;
    }
    this.stats.totalQueriesExecuted++;
    this.stats.totalQueryTime += executionTime;
  }

  /**
   * الحصول على إحصائيات Pool
   */
  getStats(): PoolStats {
    let idleCount = 0;
    let busyCount = 0;

    for (const state of this.connections.values()) {
      if (state.status === 'idle') idleCount++;
      else if (state.status === 'busy') busyCount++;
    }

    return {
      totalConnections: this.connections.size,
      idleConnections: idleCount,
      busyConnections: busyCount,
      waitingRequests: this.waitingQueue.length,
      totalQueriesExecuted: this.stats.totalQueriesExecuted,
      averageQueryTime:
        this.stats.totalQueriesExecuted > 0
          ? this.stats.totalQueryTime / this.stats.totalQueriesExecuted
          : 0,
    };
  }

  /**
   * بدء فحص الصحة الدوري
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * تنفيذ فحص الصحة
   */
  private async performHealthCheck(): Promise<void> {
    const now = Date.now();

    for (const [id, state] of this.connections) {
      // إغلاق الاتصالات الخاملة لفترة طويلة
      if (
        state.status === 'idle' &&
        now - state.lastUsedAt.getTime() > this.config.idleTimeout &&
        this.connections.size > this.config.minConnections
      ) {
        this.connections.delete(id);
        console.log(`[ConnectionPool] تم إغلاق اتصال خامل: ${id}`);
      }
    }
  }

  /**
   * إغلاق Pool
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // رفض جميع الطلبات المنتظرة
    for (const waiting of this.waitingQueue) {
      waiting.reject(new Error('تم إغلاق Pool'));
    }
    this.waitingQueue = [];

    // إغلاق جميع الاتصالات
    this.connections.clear();

    console.log('[ConnectionPool] تم إغلاق Pool');
  }
}

// تصدير instance واحد
export const connectionPool = new ConnectionPoolManager();
```

### الخطوة 4: إنشاء Query Cache

**الملف:** `server/database/query-cache.ts`

```typescript
/**
 * @fileoverview نظام تخزين مؤقت للاستعلامات
 * @module database/query-cache
 */

import { CacheConfig, CacheEntry, CacheStats } from './types';

/**
 * إعدادات افتراضية للكاش
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  maxSize: 1000,
  defaultTTL: 300, // 5 دقائق
  excludePatterns: [
    /INSERT/i,
    /UPDATE/i,
    /DELETE/i,
    /CREATE/i,
    /DROP/i,
    /ALTER/i,
  ],
};

/**
 * مدير Query Cache
 * @class QueryCacheManager
 */
export class QueryCacheManager {
  private config: CacheConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  /**
   * توليد مفتاح الكاش
   */
  private generateKey(query: string, params?: unknown[]): string {
    const normalizedQuery = query.trim().toLowerCase();
    const paramsHash = params ? JSON.stringify(params) : '';
    return `${normalizedQuery}:${paramsHash}`;
  }

  /**
   * التحقق من إمكانية تخزين الاستعلام
   */
  private isCacheable(query: string): boolean {
    if (!this.config.enabled) return false;

    for (const pattern of this.config.excludePatterns) {
      if (pattern.test(query)) return false;
    }

    return true;
  }

  /**
   * الحصول على قيمة من الكاش
   */
  get<T>(query: string, params?: unknown[]): T | null {
    if (!this.isCacheable(query)) return null;

    const key = this.generateKey(query, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.missCount++;
      return null;
    }

    // التحقق من انتهاء الصلاحية
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.missCount++;
      return null;
    }

    entry.hitCount++;
    this.stats.hitCount++;
    return entry.value as T;
  }

  /**
   * تخزين قيمة في الكاش
   */
  set<T>(query: string, params: unknown[] | undefined, value: T, ttl?: number): void {
    if (!this.isCacheable(query)) return;

    const key = this.generateKey(query, params);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl || this.config.defaultTTL) * 1000);

    // التحقق من الحجم وإزالة العناصر القديمة إذا لزم الأمر
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      hitCount: 0,
      size: this.estimateSize(value),
    };

    this.cache.set(key, entry);
  }

  /**
   * إزالة أقدم عنصر
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      const score = entry.createdAt.getTime() - entry.hitCount * 1000;
      if (score < oldestTime) {
        oldestTime = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictionCount++;
    }
  }

  /**
   * تقدير حجم القيمة
   */
  private estimateSize(value: unknown): number {
    return JSON.stringify(value).length * 2; // تقريبي بالبايت
  }

  /**
   * إبطال الكاش لجدول معين
   */
  invalidateTable(tableName: string): void {
    const pattern = new RegExp(tableName, 'i');
    
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * مسح الكاش بالكامل
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * الحصول على إحصائيات الكاش
   */
  getStats(): CacheStats {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }

    const totalRequests = this.stats.hitCount + this.stats.missCount;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate: totalRequests > 0 ? this.stats.hitCount / totalRequests : 0,
      evictionCount: this.stats.evictionCount,
    };
  }
}

// تصدير instance واحد
export const queryCache = new QueryCacheManager();
```

### الخطوة 5: إنشاء Query Optimizer

**الملف:** `server/database/query-optimizer.ts`

```typescript
/**
 * @fileoverview محلل ومحسن الاستعلامات
 * @module database/query-optimizer
 */

import { QueryAnalysis, QueryStats } from './types';

/**
 * محسن الاستعلامات
 * @class QueryOptimizer
 */
export class QueryOptimizer {
  private queryStats: Map<string, QueryStats> = new Map();
  private slowQueryThreshold = 1000; // 1 ثانية

  /**
   * تحليل استعلام
   */
  analyzeQuery(
    query: string,
    executionTime: number,
    rowsExamined: number,
    rowsReturned: number,
    indexUsed: boolean,
    indexName?: string
  ): QueryAnalysis {
    const suggestions: string[] = [];
    let severity: QueryAnalysis['severity'] = 'low';

    // تحليل وقت التنفيذ
    if (executionTime > 5000) {
      severity = 'critical';
      suggestions.push('الاستعلام بطيء جداً - يحتاج تحسين فوري');
    } else if (executionTime > 2000) {
      severity = 'high';
      suggestions.push('الاستعلام بطيء - يُنصح بالتحسين');
    } else if (executionTime > 1000) {
      severity = 'medium';
      suggestions.push('الاستعلام أبطأ من المتوسط');
    }

    // تحليل استخدام الفهرس
    if (!indexUsed) {
      if (severity === 'low') severity = 'medium';
      suggestions.push('الاستعلام لا يستخدم فهرس - أضف فهرساً للأعمدة المستخدمة في WHERE');
    }

    // تحليل نسبة الصفوف
    if (rowsExamined > 0 && rowsReturned > 0) {
      const ratio = rowsExamined / rowsReturned;
      if (ratio > 100) {
        suggestions.push(`نسبة الصفوف المفحوصة عالية (${ratio.toFixed(0)}:1) - راجع الفهارس`);
      }
    }

    // تحليل SELECT *
    if (/SELECT\s+\*/i.test(query)) {
      suggestions.push('تجنب SELECT * - حدد الأعمدة المطلوبة فقط');
    }

    // تحليل LIKE مع wildcard في البداية
    if (/LIKE\s+['"]%/i.test(query)) {
      suggestions.push('LIKE مع % في البداية يمنع استخدام الفهرس');
    }

    // تحليل OR متعدد
    const orCount = (query.match(/\sOR\s/gi) || []).length;
    if (orCount > 3) {
      suggestions.push('استخدام OR كثير قد يبطئ الاستعلام - فكر في استخدام IN أو UNION');
    }

    // تحليل subqueries
    if (/SELECT.*SELECT/i.test(query)) {
      suggestions.push('الاستعلامات الفرعية قد تكون بطيئة - فكر في استخدام JOIN');
    }

    // تسجيل الإحصائيات
    this.recordQueryStats(query, executionTime);

    return {
      query,
      executionTime,
      rowsExamined,
      rowsReturned,
      indexUsed,
      indexName,
      suggestions,
      severity,
    };
  }

  /**
   * تسجيل إحصائيات الاستعلام
   */
  private recordQueryStats(query: string, executionTime: number): void {
    const normalizedQuery = this.normalizeQuery(query);
    const existing = this.queryStats.get(normalizedQuery);

    if (existing) {
      existing.executionCount++;
      existing.totalTime += executionTime;
      existing.averageTime = existing.totalTime / existing.executionCount;
      existing.minTime = Math.min(existing.minTime, executionTime);
      existing.maxTime = Math.max(existing.maxTime, executionTime);
      existing.lastExecutedAt = new Date();
    } else {
      this.queryStats.set(normalizedQuery, {
        query: normalizedQuery,
        executionCount: 1,
        totalTime: executionTime,
        averageTime: executionTime,
        minTime: executionTime,
        maxTime: executionTime,
        lastExecutedAt: new Date(),
      });
    }
  }

  /**
   * تطبيع الاستعلام (إزالة القيم المحددة)
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/'[^']*'/g, '?')
      .replace(/\d+/g, '?')
      .trim();
  }

  /**
   * الحصول على الاستعلامات البطيئة
   */
  getSlowQueries(limit = 10): QueryStats[] {
    return Array.from(this.queryStats.values())
      .filter((stats) => stats.averageTime > this.slowQueryThreshold)
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit);
  }

  /**
   * الحصول على الاستعلامات الأكثر تكراراً
   */
  getMostFrequentQueries(limit = 10): QueryStats[] {
    return Array.from(this.queryStats.values())
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, limit);
  }

  /**
   * الحصول على جميع إحصائيات الاستعلامات
   */
  getAllStats(): QueryStats[] {
    return Array.from(this.queryStats.values());
  }

  /**
   * مسح الإحصائيات
   */
  clearStats(): void {
    this.queryStats.clear();
  }

  /**
   * تعيين حد الاستعلام البطيء
   */
  setSlowQueryThreshold(ms: number): void {
    this.slowQueryThreshold = ms;
  }

  /**
   * اقتراح فهارس
   */
  suggestIndexes(): string[] {
    const suggestions: string[] = [];
    const slowQueries = this.getSlowQueries(20);

    for (const stats of slowQueries) {
      // استخراج الأعمدة من WHERE
      const whereMatch = stats.query.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/i);
      if (whereMatch) {
        const columns = whereMatch[1]
          .split(/AND|OR/i)
          .map((part) => {
            const colMatch = part.match(/(\w+)\s*[=<>]/);
            return colMatch ? colMatch[1] : null;
          })
          .filter(Boolean);

        if (columns.length > 0) {
          suggestions.push(
            `CREATE INDEX idx_${columns.join('_')} ON table_name (${columns.join(', ')})`
          );
        }
      }
    }

    return [...new Set(suggestions)];
  }
}

// تصدير instance واحد
export const queryOptimizer = new QueryOptimizer();
```

### الخطوة 6: إنشاء Database Monitor

**الملف:** `server/database/db-monitor.ts`

```typescript
/**
 * @fileoverview نظام مراقبة قاعدة البيانات
 * @module database/db-monitor
 */

import { MonitoringMetrics } from './types';
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
  private collectionInterval: NodeJS.Timer | null = null;
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

    console.log(`[DatabaseMonitor] بدأت المراقبة بفاصل ${intervalMs}ms`);
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
```

### الخطوة 7: إنشاء Database Health Checker

**الملف:** `server/database/db-health.ts`

```typescript
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
  private checkInterval: NodeJS.Timer | null = null;

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

    const utilization = poolStats.busyConnections / poolStats.totalConnections;
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
```

### الخطوة 8: إنشاء ملف التصدير الرئيسي

**الملف:** `server/database/index.ts`

```typescript
/**
 * @fileoverview تصدير جميع مكونات نظام تحسين قاعدة البيانات
 * @module database
 */

// Types
export * from './types';

// Connection Pool
export { ConnectionPoolManager, connectionPool } from './connection-pool';

// Query Cache
export { QueryCacheManager, queryCache } from './query-cache';

// Query Optimizer
export { QueryOptimizer, queryOptimizer } from './query-optimizer';

// Database Monitor
export { DatabaseMonitor, dbMonitor } from './db-monitor';

// Database Health
export { DatabaseHealthChecker, dbHealthChecker } from './db-health';

/**
 * تهيئة نظام قاعدة البيانات
 */
export async function initializeDatabase(): Promise<void> {
  // تهيئة Connection Pool
  await connectionPool.initialize();

  // بدء المراقبة
  dbMonitor.start();

  // بدء فحص الصحة
  dbHealthChecker.startPeriodicCheck();

  console.log('[Database] تم تهيئة نظام قاعدة البيانات');
}

/**
 * إغلاق نظام قاعدة البيانات
 */
export async function shutdownDatabase(): Promise<void> {
  // إيقاف المراقبة
  dbMonitor.stop();

  // إيقاف فحص الصحة
  dbHealthChecker.stopPeriodicCheck();

  // إغلاق Pool
  await connectionPool.shutdown();

  console.log('[Database] تم إغلاق نظام قاعدة البيانات');
}
```

### الخطوة 9: التحقق والرفع
```bash
# التحقق من TypeScript
npx tsc --noEmit

# إضافة الملفات
git add server/database/

# Commit
git commit -m "feat(database): إضافة نظام شامل لتحسين أداء قاعدة البيانات

- Connection Pool Manager للتحكم في الاتصالات
- Query Cache لتخزين نتائج الاستعلامات
- Query Optimizer لتحليل وتحسين الاستعلامات
- Database Monitor للمراقبة المستمرة
- Database Health Checker لفحص الصحة"

# رفع التغييرات
git push origin feature/task11-database-performance
```

---

## 📊 معايير القبول

| المعيار | الحالة |
|:---|:---:|
| types.ts مكتمل | ⬜ |
| connection-pool.ts مكتمل | ⬜ |
| query-cache.ts مكتمل | ⬜ |
| query-optimizer.ts مكتمل | ⬜ |
| db-monitor.ts مكتمل | ⬜ |
| db-health.ts مكتمل | ⬜ |
| index.ts للتصدير | ⬜ |
| تعليقات JSDoc | ⬜ |
| لا أخطاء TypeScript | ⬜ |

---

## ⏱️ الوقت المتوقع
4-5 ساعات

---

## 📞 عند الانتهاء
أخبر المنسق بأن المهمة 11 جاهزة للدمج.
