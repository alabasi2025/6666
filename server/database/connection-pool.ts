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
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
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
    const entries = Array.from(this.connections.entries());
    for (const [id, state] of entries) {
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

    const values = Array.from(this.connections.values());
    for (const state of values) {
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

    const entries = Array.from(this.connections.entries());
    for (const [id, state] of entries) {
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
