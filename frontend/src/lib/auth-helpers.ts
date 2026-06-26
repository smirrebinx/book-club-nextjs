import { auth } from "@/lib/auth";
import { UserFacingError } from "@/lib/errors";

/**
 * Get the current session or throw an error
 * Use this in Server Components and Server Actions
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new UserFacingError('Inte autentiserad');
  }

  return session;
}

/**
 * Require admin role or throw an error
 * Use this in admin-only Server Components and Server Actions
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== 'admin') {
    throw new UserFacingError('Åtkomst nekad. Endast administratörer tillåtna.');
  }

  return session;
}

/**
 * Require approved user or throw an error
 * Use this for features that require user approval
 */
export async function requireApproved() {
  const session = await requireAuth();

  if (!session.user.isApproved) {
    throw new UserFacingError('Ditt konto väntar på godkännande');
  }

  return session;
}

/**
 * Check if current user is admin (without throwing)
 * Use this for conditional rendering
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * Check if current user is approved (without throwing)
 * Use this for conditional rendering
 */
export async function isApproved() {
  const session = await auth();
  return session?.user?.isApproved === true;
}
