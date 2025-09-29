"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionFieldProps {
  objectName: string;
  fieldName: string;
  action?: "read" | "edit";
  children: ReactNode;
  fallback?: ReactNode;
  hideIfNoAccess?: boolean;
}

export function PermissionField({
  objectName,
  fieldName,
  action = "read",
  children,
  fallback = null,
  hideIfNoAccess = false,
}: PermissionFieldProps) {
  const { can } = useAuth();

  const hasAccess = can(action, objectName, fieldName);

  if (!hasAccess) {
    if (hideIfNoAccess) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionInputProps {
  objectName: string;
  fieldName: string;
  children: ReactNode;
  readOnlyFallback?: ReactNode;
}

export function PermissionInput({
  objectName,
  fieldName,
  children,
  readOnlyFallback,
}: PermissionInputProps) {
  const { canRead, canEdit } = useAuth();

  const canReadField = canRead(objectName, fieldName);
  const canEditField = canEdit(objectName, fieldName);

  if (!canReadField) {
    return null; // Hide field completely if can't read
  }

  if (!canEditField) {
    return readOnlyFallback || <div className="text-gray-500 italic">Read-only</div>;
  }

  return <>{children}</>;
}

interface PermissionFormSectionProps {
  objectName: string;
  fields: string[];
  children: ReactNode;
  title?: string;
}

export function PermissionFormSection({
  objectName,
  fields,
  children,
  title,
}: PermissionFormSectionProps) {
  const { getReadableFields } = useAuth();

  const readableFields = getReadableFields(objectName);
  const hasAnyReadableField = fields.some(field => readableFields.includes(field));

  if (!hasAnyReadableField) {
    return null; // Hide entire section if user can't read any fields
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      )}
      {children}
    </div>
  );
}