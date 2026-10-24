/**
 * Simple in-memory rate limiting for serverless environments
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (will reset on serverless function cold starts)
// Note: In serverless environments, this Map is reset on each cold start
// No cleanup interval needed as function instances are short-lived
const rateLimits = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   * @default 100
   */
  limit?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Custom identifier (defaults to IP address)
   */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check if request should be rate limited
 * @param identifier Unique identifier for the requester (e.g., IP address, user ID)
 * @param options Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 100;
  const windowMs = options.windowMs ?? 60000; // 1 minute default
  const now = Date.now();

  const record = rateLimits.get(identifier);

  // No record or window expired - create new record
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    rateLimits.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Within window - check limit
  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get client identifier from request headers
 * @param headers Request headers
 * @returns Client identifier (IP address or 'unknown')
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get real IP from various headers
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return 'unknown';
}

/**
 * Middleware helper for Next.js API routes
 */
export function createRateLimitMiddleware(options: RateLimitOptions = {}) {
  return (headers: Headers): RateLimitResult => {
    const identifier = options.identifier ?? getClientIdentifier(headers);
    return checkRateLimit(identifier, options);
  };
}
