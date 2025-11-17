/**
 * Secure logging utility
 * Prevents sensitive data exposure in production logs
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize sensitive data from logs
 */
function sanitizeForProduction(args: unknown[]): unknown[] {
  if (!isProduction) {
    return args;
  }

  return args.map(arg => {
    if (typeof arg === 'string') {
      // Remove email patterns
      let sanitized = arg.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
      // Remove potential MongoDB connection strings
      sanitized = sanitized.replace(/mongodb(\+srv)?:\/\/[^\s]+/g, '[DB_URI_REDACTED]');
      // Remove potential API keys
      sanitized = sanitized.replace(/[A-Za-z0-9_-]{32,}/g, '[KEY_REDACTED]');
      return sanitized;
    }
    return arg;
  });
}

/**
 * Logger that respects environment and sanitizes production logs
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (!isProduction) {
      console.info(...args);
    }
  },

  warn: (...args: unknown[]) => {
    const sanitized = sanitizeForProduction(args);
    console.warn(...sanitized);
  },

  error: (...args: unknown[]) => {
    if (isProduction) {
      // In production, only log the first argument (error message) without details
      const sanitized = sanitizeForProduction([args[0]]);
      console.error(...sanitized);
    } else {
      console.error(...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },

  /**
   * Always log (for critical production errors)
   * Use sparingly and ensure no sensitive data
   */
  critical: (...args: unknown[]) => {
    const sanitized = sanitizeForProduction(args);
    console.error('[CRITICAL]', ...sanitized);
  }
};

/**
 * Logger with context prefix
 */
export function createContextLogger(context: string) {
  return {
    log: (...args: unknown[]) => logger.log(`[${context}]`, ...args),
    info: (...args: unknown[]) => logger.info(`[${context}]`, ...args),
    warn: (...args: unknown[]) => logger.warn(`[${context}]`, ...args),
    error: (...args: unknown[]) => logger.error(`[${context}]`, ...args),
    debug: (...args: unknown[]) => logger.debug(`[${context}]`, ...args),
    critical: (...args: unknown[]) => logger.critical(`[${context}]`, ...args),
  };
}
