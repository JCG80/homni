/**
 * Centralized logging utility for development and production
 * Only logs in development mode to keep production clean
 */

interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

interface LogContext {
  module?: string;
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private log(level: keyof LogLevel, message: string, context?: LogContext, ...args: any[]) {
    if (!this.isDevelopment && level !== 'ERROR') {
      return; // Only allow errors in production
    }

    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context.module || 'App'}${context.component ? `::${context.component}` : ''}]` : '';
    const prefix = `[${timestamp}] [${level}]${contextStr}`;

    switch (level) {
      case 'DEBUG':
        console.debug(prefix, message, context, ...args);
        break;
      case 'INFO':
        console.info(prefix, message, context, ...args);
        break;
      case 'WARN':
        console.warn(prefix, message, context, ...args);
        break;
      case 'ERROR':
        console.error(prefix, message, context, ...args);
        break;
    }
  }

  debug(message: string, context?: LogContext, ...args: any[]) {
    this.log('DEBUG', message, context, ...args);
  }

  info(message: string, context?: LogContext, ...args: any[]) {
    this.log('INFO', message, context, ...args);
  }

  warn(message: string, context?: LogContext, ...args: any[]) {
    this.log('WARN', message, context, ...args);
  }

  error(message: string, context?: LogContext, ...args: any[]) {
    this.log('ERROR', message, context, ...args);
  }
}

export const logger = new Logger();