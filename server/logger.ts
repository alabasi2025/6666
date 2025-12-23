/**
 * نظام تسجيل بسيط
 * يمكن استبداله بـ winston أو pino في المستقبل
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, context?: string): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  return `${timestamp} [${level.toUpperCase()}]${contextStr} ${message}`;
}

export const logger = {
  debug(message: string, context?: string) {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, context));
    }
  },
  
  info(message: string, context?: string) {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, context));
    }
  },
  
  warn(message: string, context?: string) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context));
    }
  },
  
  error(message: string, error?: Error, context?: string) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context));
      if (error && process.env.NODE_ENV !== 'production') {
        console.error(error.stack);
      }
    }
  },
};

export default logger;
