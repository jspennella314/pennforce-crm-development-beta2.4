import { prisma } from '@/lib/prisma';

interface AuditLogParams {
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  organizationId: string;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        changes: params.changes,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        organizationId: params.organizationId,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

export function getChanges(before: any, after: any): Record<string, any> {
  const changes: Record<string, any> = {};

  // Fields to ignore
  const ignoreFields = ['createdAt', 'updatedAt', 'id', 'organizationId'];

  for (const key in after) {
    if (ignoreFields.includes(key)) continue;

    if (before[key] !== after[key]) {
      changes[key] = {
        before: before[key],
        after: after[key],
      };
    }
  }

  return changes;
}
