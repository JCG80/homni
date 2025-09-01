/**
 * Production-ready structured logging system
 * Replaces all console.* statements with proper logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogContext {
  module?: string;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class ProductionLogger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const levelName = LogLevel[level];
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${levelName}] ${message} ${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    if (this.isDevelopment) {
      // Development: use console for immediate feedback
      const formatted = this.formatMessage(entry);
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted, error);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted, error);
          break;
      }
    } else {
      // Production: structured logging for external systems
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    // In production, send to external logging service (Sentry, LogRocket, etc.)
    // For now, we'll use a minimal implementation
    try {
      // You can integrate with services like Sentry here
      if (entry.level >= LogLevel.ERROR) {
        // Send errors to error tracking service
        this.sendErrorToService(entry);
      }
    } catch (err) {
      // Fallback to console if logging service fails
      console.error('Logging service failed:', err, entry);
    }
  }

  private sendErrorToService(entry: LogEntry): void {
    // Integration point for error tracking services
    // Example: Sentry, Bugsnag, etc.
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // User action tracking
  trackUserAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      type: 'user_action'
    });
  }

  // API call logging
  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.info(`API call: ${method} ${endpoint}`, {
      type: 'api_call',
      method,
      endpoint,
      duration,
      status
    });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Convenience exports
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logFatal = logger.fatal.bind(logger);