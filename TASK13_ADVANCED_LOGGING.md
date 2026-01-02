# 📋 المهمة 13: إنشاء نظام Logging متقدم

## 🎯 الهدف
إنشاء نظام تسجيل (Logging) متقدم ومتكامل يدعم مستويات متعددة، تنسيقات مختلفة، وتخزين في ملفات.

## 📁 الفرع
```
feature/task13-advanced-logging
```

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/logging/
├── types.ts              # أنواع TypeScript
├── log-levels.ts         # مستويات التسجيل
├── formatters.ts         # تنسيقات السجلات
├── transports.ts         # وسائل النقل (Console, File)
├── logger-factory.ts     # مصنع إنشاء المسجلات
├── request-logger.ts     # تسجيل الطلبات HTTP
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/utils/logger.ts` - الملف الموجود حالياً
- `server/*Router.ts` - لتجنب التعارض
- `client/src/**/*` - هذه مهمة Server فقط

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task13-advanced-logging
```

### الخطوة 2: إنشاء مجلد logging
```bash
mkdir -p server/logging
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/logging/types.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
  userId?: number;
  businessId?: number;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text' | 'pretty';
  transports: TransportConfig[];
  context?: string;
}

export interface TransportConfig {
  type: 'console' | 'file' | 'http';
  level?: LogLevel;
  options?: Record<string, unknown>;
}

export interface FileTransportOptions {
  filename: string;
  maxSize?: number; // bytes
  maxFiles?: number;
  compress?: boolean;
}

export interface HttpTransportOptions {
  url: string;
  headers?: Record<string, string>;
  batchSize?: number;
  flushInterval?: number;
}

export interface Transport {
  log(entry: LogEntry): void | Promise<void>;
  flush?(): Promise<void>;
  close?(): Promise<void>;
}

export interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  child(context: string): Logger;
}
```

### الخطوة 4: إنشاء ملف log-levels.ts
```typescript
// server/logging/log-levels.ts

import { LogLevel } from './types';

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};

export const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
  fatal: 'FATAL',
};

export const RESET_COLOR = '\x1b[0m';

export function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
  return LOG_LEVELS[messageLevel] >= LOG_LEVELS[currentLevel];
}

export function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}
```

### الخطوة 5: إنشاء ملف formatters.ts
```typescript
// server/logging/formatters.ts

import { LogEntry } from './types';
import { LOG_LEVEL_COLORS, LOG_LEVEL_LABELS, RESET_COLOR } from './log-levels';

export interface Formatter {
  format(entry: LogEntry): string;
}

export class JsonFormatter implements Formatter {
  format(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      context: entry.context,
      ...entry.metadata,
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
      requestId: entry.requestId,
      userId: entry.userId,
      businessId: entry.businessId,
    });
  }
}

export class TextFormatter implements Formatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LOG_LEVEL_LABELS[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    const error = entry.error ? `\n${entry.error.stack}` : '';
    
    return `${timestamp} ${level} ${context} ${entry.message}${metadata}${error}`;
  }
}

export class PrettyFormatter implements Formatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const color = LOG_LEVEL_COLORS[entry.level];
    const level = LOG_LEVEL_LABELS[entry.level];
    const context = entry.context ? `\x1b[90m[${entry.context}]\x1b[0m` : '';
    
    let output = `${color}${level}${RESET_COLOR} ${timestamp} ${context} ${entry.message}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += `\n  \x1b[90m${JSON.stringify(entry.metadata, null, 2)}\x1b[0m`;
    }
    
    if (entry.error) {
      output += `\n  \x1b[31m${entry.error.stack}\x1b[0m`;
    }
    
    return output;
  }
}

export function createFormatter(format: 'json' | 'text' | 'pretty'): Formatter {
  switch (format) {
    case 'json':
      return new JsonFormatter();
    case 'text':
      return new TextFormatter();
    case 'pretty':
      return new PrettyFormatter();
    default:
      return new TextFormatter();
  }
}
```

### الخطوة 6: إنشاء ملف transports.ts
```typescript
// server/logging/transports.ts

import * as fs from 'fs';
import * as path from 'path';
import { LogEntry, Transport, FileTransportOptions } from './types';
import { Formatter, createFormatter } from './formatters';

export class ConsoleTransport implements Transport {
  private formatter: Formatter;

  constructor(format: 'json' | 'text' | 'pretty' = 'pretty') {
    this.formatter = createFormatter(format);
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    
    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(formatted);
    } else if (entry.level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}

export class FileTransport implements Transport {
  private formatter: Formatter;
  private stream: fs.WriteStream | null = null;
  private options: FileTransportOptions;
  private currentSize = 0;

  constructor(options: FileTransportOptions) {
    this.options = {
      maxSize: 10 * 1024 * 1024, // 10MB default
      maxFiles: 5,
      compress: false,
      ...options,
    };
    this.formatter = createFormatter('json');
    this.initStream();
  }

  private initStream(): void {
    const dir = path.dirname(this.options.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.stream = fs.createWriteStream(this.options.filename, { flags: 'a' });
    
    if (fs.existsSync(this.options.filename)) {
      this.currentSize = fs.statSync(this.options.filename).size;
    }
  }

  log(entry: LogEntry): void {
    if (!this.stream) return;

    const formatted = this.formatter.format(entry) + '\n';
    const bytes = Buffer.byteLength(formatted);

    if (this.currentSize + bytes > this.options.maxSize!) {
      this.rotate();
    }

    this.stream.write(formatted);
    this.currentSize += bytes;
  }

  private rotate(): void {
    if (!this.stream) return;

    this.stream.end();

    // Rotate files
    for (let i = this.options.maxFiles! - 1; i >= 1; i--) {
      const oldFile = `${this.options.filename}.${i}`;
      const newFile = `${this.options.filename}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        if (i === this.options.maxFiles! - 1) {
          fs.unlinkSync(oldFile);
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    if (fs.existsSync(this.options.filename)) {
      fs.renameSync(this.options.filename, `${this.options.filename}.1`);
    }

    this.initStream();
    this.currentSize = 0;
  }

  async flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream) {
        this.stream.once('drain', resolve);
      } else {
        resolve();
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream) {
        this.stream.end(resolve);
      } else {
        resolve();
      }
    });
  }
}

export class MemoryTransport implements Transport {
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(maxLogs = 1000) {
    this.maxLogs = maxLogs;
  }

  log(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
```

### الخطوة 7: إنشاء ملف logger-factory.ts
```typescript
// server/logging/logger-factory.ts

import { Logger, LoggerConfig, LogEntry, LogLevel, Transport } from './types';
import { shouldLog, getLogLevelFromEnv } from './log-levels';
import { ConsoleTransport, FileTransport } from './transports';

class LoggerImpl implements Logger {
  private config: LoggerConfig;
  private transports: Transport[];
  private context?: string;

  constructor(config: LoggerConfig, transports: Transport[], context?: string) {
    this.config = config;
    this.transports = transports;
    this.context = context;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
    if (!shouldLog(this.config.level, level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: this.context,
      metadata,
      error,
    };

    for (const transport of this.transports) {
      transport.log(entry);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log('fatal', message, metadata, error);
  }

  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new LoggerImpl(this.config, this.transports, childContext);
  }
}

export class LoggerFactory {
  private static defaultConfig: LoggerConfig = {
    level: getLogLevelFromEnv(),
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
    transports: [{ type: 'console' }],
  };

  static create(config?: Partial<LoggerConfig>): Logger {
    const finalConfig = { ...this.defaultConfig, ...config };
    const transports = this.createTransports(finalConfig);
    return new LoggerImpl(finalConfig, transports, finalConfig.context);
  }

  private static createTransports(config: LoggerConfig): Transport[] {
    return config.transports.map((tc) => {
      switch (tc.type) {
        case 'console':
          return new ConsoleTransport(config.format);
        case 'file':
          return new FileTransport(tc.options as any);
        default:
          return new ConsoleTransport(config.format);
      }
    });
  }
}

// Logger الافتراضي
export const defaultLogger = LoggerFactory.create();
```

### الخطوة 8: إنشاء ملف request-logger.ts
```typescript
// server/logging/request-logger.ts

import { Request, Response, NextFunction } from 'express';
import { defaultLogger } from './logger-factory';

const logger = defaultLogger.child('HTTP');

export interface RequestLogOptions {
  excludePaths?: string[];
  logBody?: boolean;
  logHeaders?: boolean;
}

export function requestLogger(options: RequestLogOptions = {}) {
  const { excludePaths = [], logBody = false, logHeaders = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // تجاهل المسارات المستثناة
    if (excludePaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const startTime = Date.now();
    const requestId = generateRequestId();

    // إضافة requestId للطلب
    (req as any).requestId = requestId;

    // تسجيل الطلب الوارد
    const requestLog: Record<string, unknown> = {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (logHeaders) {
      requestLog.headers = req.headers;
    }

    if (logBody && req.body) {
      requestLog.body = sanitizeBody(req.body);
    }

    logger.info('طلب وارد', requestLog);

    // تسجيل الاستجابة
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - startTime;
      
      logger.info('استجابة صادرة', {
        requestId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

      return originalSend.call(this, body);
    };

    next();
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

export function errorLogger() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId;

    logger.error('خطأ في الطلب', err, {
      requestId,
      method: req.method,
      path: req.path,
    });

    next(err);
  };
}
```

### الخطوة 9: إنشاء ملف index.ts
```typescript
// server/logging/index.ts

export * from './types';
export * from './log-levels';
export * from './formatters';
export * from './transports';
export * from './logger-factory';
export * from './request-logger';

// تصدير الـ instances الافتراضية
export { defaultLogger } from './logger-factory';
```

### الخطوة 10: رفع التغييرات
```bash
git add server/logging/
git commit -m "feat(logging): إضافة نظام Logging متقدم

- إضافة مستويات تسجيل متعددة (debug, info, warn, error, fatal)
- إضافة تنسيقات متعددة (JSON, Text, Pretty)
- إضافة transports (Console, File, Memory)
- إضافة LoggerFactory لإنشاء المسجلات
- إضافة Request Logger للطلبات HTTP"

git push origin feature/task13-advanced-logging
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/logging/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `log-levels.ts`
- [ ] إنشاء ملف `formatters.ts`
- [ ] إنشاء ملف `transports.ts`
- [ ] إنشاء ملف `logger-factory.ts`
- [ ] إنشاء ملف `request-logger.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
