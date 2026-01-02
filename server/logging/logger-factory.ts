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
