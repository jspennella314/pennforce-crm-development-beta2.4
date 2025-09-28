import { useSession } from "next-auth/react";

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

  const canAccess = (resource: string, action: string = "read"): boolean => {
    if (!user) return false;

    // Admin can access everything
    if (user.role === "admin") return true;

    // Define permission matrix
    const permissions: Record<UserRole, Record<string, string[]>> = {
      admin: {
        "*": ["create", "read", "update", "delete"],
      },
      manager: {
        accounts: ["create", "read", "update"],
        aircraft: ["create", "read", "update"],
        opportunities: ["create", "read", "update", "delete"],
        contacts: ["create", "read", "update", "delete"],
        tasks: ["create", "read", "update", "delete"],
        activities: ["create", "read", "update"],
        users: ["read"],
        reports: ["read"],
      },
      user: {
        accounts: ["read"],
        aircraft: ["read"],
        opportunities: ["read", "update"],
        contacts: ["create", "read", "update"],
        tasks: ["create", "read", "update"],
        activities: ["create", "read"],
        reports: ["read"],
      },
    };

    const userPermissions = permissions[user.role];
    if (!userPermissions) return false;

    // Check wildcard permission
    if (userPermissions["*"]?.includes(action)) return true;

    // Check specific resource permission
    return userPermissions[resource]?.includes(action) || false;
  };

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!user,
    hasRole,
    canAccess,
  };
}