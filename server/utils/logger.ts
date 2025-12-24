/**
 * نظام التسجيل (Logger) الموحد
 * يستبدل console.log بنظام احترافي
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    
    if (this.isDevelopment) {
      // في بيئة التطوير، نعرض بشكل مقروء
      const colors = {
        debug: '\x1b[36m',  // cyan
        info: '\x1b[32m',   // green
        warn: '\x1b[33m',   // yellow
        error: '\x1b[31m',  // red
      };
      const reset = '\x1b[0m';
      
      console.log(`${colors[entry.level]}${prefix}${reset} ${entry.message}`);
      if (entry.data) {
        console.log(entry.data);
      }
    } else {
      // في بيئة الإنتاج، نخرج JSON للتحليل
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.output(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    this.output(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    this.output(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    this.output(this.formatMessage('error', message, data));
  }
}

export const logger = Logger.getInstance();
