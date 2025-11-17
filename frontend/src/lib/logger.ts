/**
 * Secure logging utility
 * Prevents sensitive data exposure in production logs
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize sensitive data from logs
 */
function sanitizeForProduction(args: any[]): any[] {
  if (!isProduction) {
    return args;
  }

  return args.map(arg => {
    if (typeof arg === 'string') {
      // Remove email patterns
      arg = arg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
      // Remove potential MongoDB connection strings
      arg = arg.replace(/mongodb(\+srv)?:\/\/[^\s]+/g, '[DB_URI_REDACTED]');
      // Remove potential API keys
      arg = arg.replace(/[A-Za-z0-9_-]{32,}/g, '[KEY_REDACTED]');
    }
    return arg;
  });
}

/**
 * Logger that respects environment and sanitizes production logs
 */
export const logger = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },

  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args);
    }
  },

  warn: (...args: any[]) => {
    const sanitized = sanitizeForProduction(args);
    console.warn(...sanitized);
  },

  error: (...args: any[]) => {
    if (isProduction) {
      // In production, only log the first argument (error message) without details
      const sanitized = sanitizeForProduction([args[0]]);
      console.error(...sanitized);
    } else {
      console.error(...args);
    }
  },

  debug: (...args: any[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },

  /**
   * Always log (for critical production errors)
   * Use sparingly and ensure no sensitive data
   */
  critical: (...args: any[]) => {
    const sanitized = sanitizeForProduction(args);
    console.error('[CRITICAL]', ...sanitized);
  }
};

/**
 * Type-safe logger with context
 */
export function createContextLogger(context: string) {
  return {
    log: (...args: any[]) => logger.log(`[${context}]`, ...args),
    info: (...args: any[]) => logger.info(`[${context}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${context}]`, ...args),
    error: (...args: any[]) => logger.error(`[${context}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${context}]`, ...args),
    critical: (...args: any[]) => logger.critical(`[${context}]`, ...args),
  };
}
