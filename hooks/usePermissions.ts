import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AuthUser } from "./useAuth";

export interface PermissionSet {
  id: string;
  name: string;
  label: string;
  description?: string;
  isStandard: boolean;
  objectPermissions: ObjectPermission[];
  fieldPermissions: FieldPermission[];
}

export interface ObjectPermission {
  id: string;
  objectName: string;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canModifyAll: boolean;
}

export interface FieldPermission {
  id: string;
  objectName: string;
  fieldName: string;
  canRead: boolean;
  canEdit: boolean;
}

export interface PermissionContext {
  permissionSets: PermissionSet[];
  effectivePermissions: Map<string, ObjectPermission>;
  effectiveFieldPermissions: Map<string, FieldPermission>;
}

export function usePermissions() {
  const { data: session } = useSession();
  const [permissionContext, setPermissionContext] = useState<PermissionContext>({
    permissionSets: [],
    effectivePermissions: new Map(),
    effectiveFieldPermissions: new Map(),
  });

  const user = session?.user as AuthUser | undefined;

  useEffect(() => {
    if (user) {
      loadUserPermissions(user.id);
    }
  }, [user?.id]);

  const loadUserPermissions = async (userId: string) => {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll create default permission sets based on the user's role
      const defaultPermissions = createDefaultPermissionSets(user?.role || "user", user?.organizationId || "");

      const effectivePerms = new Map<string, ObjectPermission>();
      const effectiveFieldPerms = new Map<string, FieldPermission>();

      // Aggregate permissions from all permission sets
      defaultPermissions.forEach(permSet => {
        permSet.objectPermissions.forEach(objPerm => {
          const existing = effectivePerms.get(objPerm.objectName);
          if (!existing) {
            effectivePerms.set(objPerm.objectName, { ...objPerm });
          } else {
            // Union permissions (if any permission set grants access, user has access)
            effectivePerms.set(objPerm.objectName, {
              ...existing,
              canCreate: existing.canCreate || objPerm.canCreate,
              canRead: existing.canRead || objPerm.canRead,
              canEdit: existing.canEdit || objPerm.canEdit,
              canDelete: existing.canDelete || objPerm.canDelete,
              canViewAll: existing.canViewAll || objPerm.canViewAll,
              canModifyAll: existing.canModifyAll || objPerm.canModifyAll,
            });
          }
        });

        permSet.fieldPermissions.forEach(fieldPerm => {
          const key = `${fieldPerm.objectName}.${fieldPerm.fieldName}`;
          const existing = effectiveFieldPerms.get(key);
          if (!existing) {
            effectiveFieldPerms.set(key, { ...fieldPerm });
          } else {
            // Union permissions
            effectiveFieldPerms.set(key, {
              ...existing,
              canRead: existing.canRead || fieldPerm.canRead,
              canEdit: existing.canEdit || fieldPerm.canEdit,
            });
          }
        });
      });

      setPermissionContext({
        permissionSets: defaultPermissions,
        effectivePermissions: effectivePerms,
        effectiveFieldPermissions: effectiveFieldPerms,
      });
    } catch (error) {
      console.error("Failed to load user permissions:", error);
    }
  };

  // Main permission check function - replaces canAccess()
  const can = (action: string, objectName: string, fieldName?: string): boolean => {
    if (!user) return false;

    // Admin bypass (but still use permission sets for auditability)
    if (user.role === "admin") return true;

    if (fieldName) {
      // Field-level permission check
      const key = `${objectName}.${fieldName}`;
      const fieldPerm = permissionContext.effectiveFieldPermissions.get(key);
      if (!fieldPerm) return false;

      switch (action) {
        case "read":
          return fieldPerm.canRead;
        case "edit":
        case "update":
          return fieldPerm.canEdit;
        default:
          return false;
      }
    } else {
      // Object-level permission check
      const objPerm = permissionContext.effectivePermissions.get(objectName);
      if (!objPerm) return false;

      switch (action) {
        case "create":
          return objPerm.canCreate;
        case "read":
          return objPerm.canRead;
        case "edit":
        case "update":
          return objPerm.canEdit;
        case "delete":
          return objPerm.canDelete;
        case "viewAll":
          return objPerm.canViewAll;
        case "modifyAll":
          return objPerm.canModifyAll;
        default:
          return false;
      }
    }
  };

  // Convenience methods
  const canRead = (objectName: string, fieldName?: string) => can("read", objectName, fieldName);
  const canEdit = (objectName: string, fieldName?: string) => can("edit", objectName, fieldName);
  const canCreate = (objectName: string) => can("create", objectName);
  const canDelete = (objectName: string) => can("delete", objectName);

  // Get all readable fields for an object
  const getReadableFields = (objectName: string): string[] => {
    const fields: string[] = [];
    for (const [key, fieldPerm] of permissionContext.effectiveFieldPermissions) {
      if (key.startsWith(`${objectName}.`) && fieldPerm.canRead) {
        fields.push(fieldPerm.fieldName);
      }
    }
    return fields;
  };

  // Get all editable fields for an object
  const getEditableFields = (objectName: string): string[] => {
    const fields: string[] = [];
    for (const [key, fieldPerm] of permissionContext.effectiveFieldPermissions) {
      if (key.startsWith(`${objectName}.`) && fieldPerm.canEdit) {
        fields.push(fieldPerm.fieldName);
      }
    }
    return fields;
  };

  return {
    user,
    permissionSets: permissionContext.permissionSets,
    can,
    canRead,
    canEdit,
    canCreate,
    canDelete,
    getReadableFields,
    getEditableFields,
    isLoading: !user && session !== null,
    isAuthenticated: !!user,
  };
}

// Create default permission sets based on legacy roles
function createDefaultPermissionSets(role: string, organizationId: string): PermissionSet[] {
  const objectNames = ["account", "contact", "opportunity", "aircraft", "task", "activity", "document"];
  const fieldDefinitions = {
    account: ["name", "type", "website", "phone", "email", "billingAddr", "shippingAddr", "notes"],
    contact: ["firstName", "lastName", "email", "phone", "title"],
    opportunity: ["name", "stage", "amount", "currency", "closeDate", "source"],
    aircraft: ["make", "model", "variant", "year", "serialNumber", "tailNumber", "status", "locationIcao", "totalTimeHrs", "cycles"],
    task: ["title", "status", "dueDate"],
    activity: ["type", "content"],
    document: ["label", "url"],
  };

  const permissionSets: PermissionSet[] = [];

  if (role === "admin") {
    // System Administrator - full access
    const objectPermissions = objectNames.map(objectName => ({
      id: `admin-${objectName}`,
      objectName,
      canCreate: true,
      canRead: true,
      canEdit: true,
      canDelete: true,
      canViewAll: true,
      canModifyAll: true,
    }));

    const fieldPermissions: FieldPermission[] = [];
    Object.entries(fieldDefinitions).forEach(([objectName, fields]) => {
      fields.forEach(fieldName => {
        fieldPermissions.push({
          id: `admin-${objectName}-${fieldName}`,
          objectName,
          fieldName,
          canRead: true,
          canEdit: true,
        });
      });
    });

    permissionSets.push({
      id: "system_admin",
      name: "system_admin",
      label: "System Administrator",
      description: "Full access to all objects and fields",
      isStandard: true,
      objectPermissions,
      fieldPermissions,
    });
  } else if (role === "manager") {
    // Manager - broad access but limited delete
    const objectPermissions = objectNames.map(objectName => ({
      id: `manager-${objectName}`,
      objectName,
      canCreate: true,
      canRead: true,
      canEdit: true,
      canDelete: objectName === "task" || objectName === "activity", // Can only delete tasks/activities
      canViewAll: objectName !== "document", // Can't view all documents
      canModifyAll: false,
    }));

    const fieldPermissions: FieldPermission[] = [];
    Object.entries(fieldDefinitions).forEach(([objectName, fields]) => {
      fields.forEach(fieldName => {
        // Managers can't edit certain sensitive fields
        const canEdit = !(objectName === "account" && fieldName === "notes") &&
                        !(objectName === "aircraft" && fieldName === "serialNumber");

        fieldPermissions.push({
          id: `manager-${objectName}-${fieldName}`,
          objectName,
          fieldName,
          canRead: true,
          canEdit,
        });
      });
    });

    permissionSets.push({
      id: "standard_manager",
      name: "standard_manager",
      label: "Standard Manager",
      description: "Management access with some restrictions",
      isStandard: true,
      objectPermissions,
      fieldPermissions,
    });
  } else {
    // Standard User - limited access
    const objectPermissions = objectNames.map(objectName => ({
      id: `user-${objectName}`,
      objectName,
      canCreate: objectName === "contact" || objectName === "task" || objectName === "activity",
      canRead: true,
      canEdit: objectName === "contact" || objectName === "opportunity" || objectName === "task" || objectName === "activity",
      canDelete: false,
      canViewAll: false,
      canModifyAll: false,
    }));

    const fieldPermissions: FieldPermission[] = [];
    Object.entries(fieldDefinitions).forEach(([objectName, fields]) => {
      fields.forEach(fieldName => {
        // Users have very limited edit access
        const canEdit = (objectName === "contact" && fieldName !== "email") ||
                        (objectName === "opportunity" && fieldName === "stage") ||
                        (objectName === "task") ||
                        (objectName === "activity");

        fieldPermissions.push({
          id: `user-${objectName}-${fieldName}`,
          objectName,
          fieldName,
          canRead: true,
          canEdit,
        });
      });
    });

    permissionSets.push({
      id: "standard_user",
      name: "standard_user",
      label: "Standard User",
      description: "Basic user access",
      isStandard: true,
      objectPermissions,
      fieldPermissions,
    });
  }

  return permissionSets;
}