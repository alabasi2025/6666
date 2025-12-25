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
          .filter((col): col is string => col !== null);

        if (columns.length > 0) {
          suggestions.push(
            `CREATE INDEX idx_${columns.join('_')} ON table_name (${columns.join(', ')})`
          );
        }
      }
    }

    // إزالة التكرارات
    const uniqueSuggestions = suggestions.filter((item, index) => suggestions.indexOf(item) === index);
    return uniqueSuggestions;
  }
}

// تصدير instance واحد
export const queryOptimizer = new QueryOptimizer();
