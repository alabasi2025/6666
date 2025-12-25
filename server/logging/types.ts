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
