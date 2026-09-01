/**
 * Authentication Security Module
 * Handles rate-limiting, audit logging, and security checks
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // milliseconds
  lockoutMs: number; // lockout duration after max attempts
}

interface AuditLog {
  timestamp: string;
  event: string;
  email: string;
  ip?: string;
  userAgent?: string;
  status: "success" | "failure";
  errorCode?: string;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
  },
  resetPassword: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
  },
};

/**
 * Rate limiter with sliding window
 */
class RateLimiter {
  private attempts: Map<string, { timestamp: number }[]> = new Map();

  check(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetTime?: number;
  } {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Clean old attempts outside the window
    const validAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < config.windowMs
    );

    // Check if locked out
    if (validAttempts.length > 0) {
      const oldestAttempt = validAttempts[0].timestamp;
      const lockoutEnd = oldestAttempt + config.lockoutMs;

      if (now < lockoutEnd && validAttempts.length >= config.maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.ceil((lockoutEnd - now) / 1000),
        };
      }
    }

    if (validAttempts.length >= config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil(
          (validAttempts[0].timestamp + config.windowMs - now) / 1000
        ),
      };
    }

    // Record this attempt
    validAttempts.push({ timestamp: now });
    this.attempts.set(key, validAttempts);

    return {
      allowed: true,
      remaining: config.maxAttempts - validAttempts.length,
    };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  isLocked(key: string, config: RateLimitConfig): boolean {
    const attempts = this.attempts.get(key) || [];
    const now = Date.now();

    return (
      attempts.length >= config.maxAttempts &&
      now - attempts[0].timestamp < config.lockoutMs
    );
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Check if login/register is allowed for user
 */
export const checkRateLimit = (
  email: string,
  action: "login" | "register" | "resetPassword"
): {
  allowed: boolean;
  remaining: number;
  message?: string;
  resetTimeSeconds?: number;
} => {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    return { allowed: true, remaining: -1 };
  }

  const result = rateLimiter.check(email.toLowerCase(), config);

  if (!result.allowed) {
    const minutes = Math.ceil((result.resetTime || 0) / 60);
    return {
      allowed: false,
      remaining: 0,
      message:
        action === "login"
          ? `Trop de tentatives. Réessayez dans ${minutes} minutes`
          : `Réessayez dans ${minutes} minutes`,
      resetTimeSeconds: result.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
  };
};

/**
 * Record an auth event for audit logging
 */
export const logAuthEvent = (
  event: string,
  email: string,
  status: "success" | "failure",
  errorCode?: string
): void => {
  const auditLog: AuditLog = {
    timestamp: new Date().toISOString(),
    event,
    email: email.toLowerCase(),
    status,
    errorCode,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[AUDIT]", auditLog);
  }

  // In production, you would send this to your analytics/logging service
  // Example: sendToLoggingService(auditLog)
};

/**
 * Reset rate limit for a user (admin action)
 */
export const resetUserRateLimit = (email: string): void => {
  rateLimiter.reset(email.toLowerCase());
  logAuthEvent("rate_limit_reset", email, "success");
};

/**
 * Get rate limit status for a user
 */
export const getRateLimitStatus = (
  email: string,
  action: "login" | "register" | "resetPassword"
): {
  isLocked: boolean;
  attempts?: number;
  maxAttempts: number;
} => {
  const config = RATE_LIMIT_CONFIGS[action];
  const isLocked = rateLimiter.isLocked(email.toLowerCase(), config);

  return {
    isLocked,
    maxAttempts: config.maxAttempts,
  };
};

/**
 * Validate email format
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic international format)
 */
export const validatePhoneFormat = (phone: string): boolean => {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  // Check if it's 9-15 digits (international standard)
  return /^\d{9,15}$/.test(cleaned);
};

/**
 * Check password against common weak passwords
 */
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "dragon",
  ];

  return commonPasswords.some(
    (common) => password.toLowerCase().includes(common.toLowerCase())
  );
};

/**
 * Generate a session fingerprint for security
 */
export const generateSessionFingerprint = (): string => {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const components = [
    navigator.userAgent,
    new Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset(),
  ].join("|");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
};
