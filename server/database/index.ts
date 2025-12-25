/**
 * @fileoverview تصدير جميع مكونات نظام تحسين قاعدة البيانات
 * @module database
 */

// Types
export * from './types';

// Connection Pool
import { ConnectionPoolManager, connectionPool as _connectionPool } from './connection-pool';
export { ConnectionPoolManager };
export const connectionPool = _connectionPool;

// Query Cache
import { QueryCacheManager, queryCache as _queryCache } from './query-cache';
export { QueryCacheManager };
export const queryCache = _queryCache;

// Query Optimizer
import { QueryOptimizer, queryOptimizer as _queryOptimizer } from './query-optimizer';
export { QueryOptimizer };
export const queryOptimizer = _queryOptimizer;

// Database Monitor
import { DatabaseMonitor, dbMonitor as _dbMonitor } from './db-monitor';
export { DatabaseMonitor };
export const dbMonitor = _dbMonitor;

// Database Health
import { DatabaseHealthChecker, dbHealthChecker as _dbHealthChecker } from './db-health';
export { DatabaseHealthChecker };
export const dbHealthChecker = _dbHealthChecker;

/**
 * تهيئة نظام قاعدة البيانات
 */
export async function initializeDatabase(): Promise<void> {
  // تهيئة Connection Pool
  await _connectionPool.initialize();

  // بدء المراقبة
  _dbMonitor.start();

  // بدء فحص الصحة
  _dbHealthChecker.startPeriodicCheck();

  console.log('[Database] تم تهيئة نظام قاعدة البيانات');
}

/**
 * إغلاق نظام قاعدة البيانات
 */
export async function shutdownDatabase(): Promise<void> {
  // إيقاف المراقبة
  _dbMonitor.stop();

  // إيقاف فحص الصحة
  _dbHealthChecker.stopPeriodicCheck();

  // إغلاق Pool
  await _connectionPool.shutdown();

  console.log('[Database] تم إغلاق نظام قاعدة البيانات');
}
