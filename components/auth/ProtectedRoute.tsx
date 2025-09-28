"use client";

import { useAuth, UserRole } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  resource?: string;
  action?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  resource,
  action = "read",
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole, canAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Access Denied</div>
          <div className="text-gray-600">Please sign in to continue</div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Access Denied</div>
          <div className="text-gray-600">
            You need {requiredRole} role to access this page
          </div>
        </div>
      </div>
    );
  }

  // Check resource-based access
  if (resource && !canAccess(resource, action)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Access Denied</div>
          <div className="text-gray-600">
            You don't have permission to {action} {resource}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}