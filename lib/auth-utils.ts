import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Get the current session or redirect to login
 */
export async function getSessionOrRedirect() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!session.user.isActive) {
    redirect('/login?error=AccountDisabled');
  }

  return session;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

/**
 * Check if user is manager or admin
 */
export function isManagerOrAdmin(userRole: string): boolean {
  return ['admin', 'manager'].includes(userRole);
}

/**
 * Get organization ID from session
 */
export async function getOrganizationId(): Promise<string> {
  const session = await getSessionOrRedirect();
  return session.user.organizationId;
}

/**
 * Get user ID from session
 */
export async function getUserId(): Promise<string> {
  const session = await getSessionOrRedirect();
  return session.user.id;
}

/**
 * Verify user has access to resource in their organization
 */
export async function verifyOrganizationAccess(resourceOrgId: string): Promise<boolean> {
  const session = await getSessionOrRedirect();
  return session.user.organizationId === resourceOrgId;
}
