// server/audit/audit-queries.ts

import * as fs from 'fs';
import * as readline from 'readline';
import { AuditEntry, AuditFilter } from './types';
import { auditLogger } from './audit-logger';

class AuditQueries {
  private filePath: string;

  constructor(filePath = './logs/audit.log') {
    this.filePath = filePath;
  }

  /**
   * البحث في سجلات التدقيق
   */
  async search(filter: AuditFilter, limit = 100): Promise<AuditEntry[]> {
    // البحث في الذاكرة أولاً
    let entries = auditLogger.getEntries();

    // إذا لم تكن كافية، اقرأ من الملف
    if (entries.length < limit && fs.existsSync(this.filePath)) {
      const fileEntries = await this.readFromFile(limit * 2);
      entries = [...fileEntries, ...entries];
    }

    // تطبيق الفلاتر
    return this.applyFilters(entries, filter).slice(0, limit);
  }

  /**
   * الحصول على سجلات كيان معين
   */
  async getEntityHistory(
    entityType: string,
    entityId: string | number,
    limit = 50
  ): Promise<AuditEntry[]> {
    return this.search({ entityType, entityId }, limit);
  }

  /**
   * الحصول على سجلات مستخدم معين
   */
  async getUserActivity(userId: number, limit = 50): Promise<AuditEntry[]> {
    return this.search({ userId }, limit);
  }

  /**
   * الحصول على سجلات فترة معينة
   */
  async getByDateRange(startDate: Date, endDate: Date, limit = 100): Promise<AuditEntry[]> {
    return this.search({ startDate, endDate }, limit);
  }

  /**
   * الحصول على إحصائيات التدقيق
   */
  async getStats(filter: AuditFilter = {}): Promise<{
    total: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const entries = await this.search(filter, 10000);

    const stats = {
      total: entries.length,
      byAction: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    for (const entry of entries) {
      stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;
      stats.byEntity[entry.entityType] = (stats.byEntity[entry.entityType] || 0) + 1;
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * القراءة من الملف
   */
  private async readFromFile(limit: number): Promise<AuditEntry[]> {
    return new Promise((resolve) => {
      const entries: AuditEntry[] = [];
      
      if (!fs.existsSync(this.filePath)) {
        resolve([]);
        return;
      }

      const rl = readline.createInterface({
        input: fs.createReadStream(this.filePath),
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        try {
          const entry = JSON.parse(line) as AuditEntry;
          entry.timestamp = new Date(entry.timestamp);
          entries.push(entry);
        } catch {
          // تجاهل الأسطر غير الصالحة
        }
      });

      rl.on('close', () => {
        // إرجاع آخر N سجل
        resolve(entries.slice(-limit));
      });
    });
  }

  /**
   * تطبيق الفلاتر
   */
  private applyFilters(entries: AuditEntry[], filter: AuditFilter): AuditEntry[] {
    return entries.filter((entry) => {
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.action) {
        const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
        if (!actions.includes(entry.action)) return false;
      }
      if (filter.entityType && entry.entityType !== filter.entityType) return false;
      if (filter.entityId && entry.entityId !== filter.entityId) return false;
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.businessId && entry.businessId !== filter.businessId) return false;
      if (filter.status && entry.status !== filter.status) return false;
      return true;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const auditQueries = new AuditQueries();
