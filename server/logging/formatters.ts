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
