import { useSession } from "next-auth/react";
import { usePermissions } from "./usePermissions";

export type UserRole = "admin" | "manager" | "user";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  organizationId: string;
  organization: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const permissions = usePermissions();

  const user = session?.user as AuthUser | undefined;

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      manager: 2,
      admin: 3,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  // Legacy canAccess function - delegates to new permission system
  const canAccess = (resource: string, action: string = "read"): boolean => {
    return permissions.can(action, resource);
  };

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!user,
    hasRole,
    canAccess,
    // Expose new permission methods
    can: permissions.can,
    canRead: permissions.canRead,
    canEdit: permissions.canEdit,
    canCreate: permissions.canCreate,
    canDelete: permissions.canDelete,
    getReadableFields: permissions.getReadableFields,
    getEditableFields: permissions.getEditableFields,
  };
}
