import { ZodError } from 'zod';

import { logger } from '@/lib/logger';

/**
 * Throw this when the message itself is safe to show to the end user
 * (e.g. "not approved", "not found", "duplicate"). Anything else caught
 * at a route/Server Action boundary must never have its `.message`
 * forwarded to the client — see toSafeErrorMessage.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Zod issue messages in this codebase are already user-safe Swedish text
 * (set via the schema's second argument to .min/.max/.regex/etc). Field
 * paths are intentionally never included.
 */
function formatZodError(error: ZodError): string {
  const messages = Array.from(new Set(error.issues.map((issue) => issue.message)));
  return messages.join('. ');
}

/**
 * Returns a message safe to send to the client for a caught error. Only
 * UserFacingError and ZodError messages are ever returned as-is; any other
 * error (Mongoose, network, programmer error, etc.) falls back to
 * `fallback` so internals can't leak.
 *
 * UserFacingError/ZodError are expected user-input outcomes, not faults —
 * they're logged at debug level (suppressed outside development). Anything
 * else is an unexpected error and is logged at error level so it surfaces
 * in production logs.
 */
export function toSafeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof UserFacingError) {
    logger.debug(fallback, error);
    return error.message;
  }

  if (error instanceof ZodError) {
    logger.debug(fallback, error);
    return formatZodError(error);
  }

  logger.error(fallback, error);
  return fallback;
}
