/**
 * Centralized Audit Logging Utility
 *
 * Provides consistent audit trail for:
 * - Settings changes (organization, user preferences)
 * - Data modifications (lead assignments, opportunity updates)
 * - Security events (login attempts, permission changes)
 * - Administrative actions (user management, role changes)
 */

import { prisma } from "@/lib/prisma";

export type AuditEventType =
  | "FIELD_EDIT"
  | "SETTINGS_CHANGE"
  | "RECORD_CREATE"
  | "RECORD_DELETE"
  | "STATUS_CHANGE"
  | "ASSIGNMENT_CHANGE"
  | "STAGE_CHANGE"
  | "PERMISSION_CHANGE"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "EXPORT_DATA"
  | "IMPORT_DATA";

export type RecordType =
  | "account"
  | "contact"
  | "lead"
  | "opportunity"
  | "aircraft"
  | "task"
  | "organization"
  | "user"
  | "settings"
  | "stage_setting"
  | "lead_assignment_rule";

interface AuditLogOptions {
  type: AuditEventType;
  recordType: RecordType;
  recordId: string;
  userId: string;
  organizationId: string;
  summary: string;
  details?: Record<string, any>; // Additional context (old/new values, etc.)
  ipAddress?: string;
  userAgent?: string;
}

interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Create an audit log entry
 */
export async function logAuditEvent(options: AuditLogOptions) {
  try {
    await prisma.activity.create({
      data: {
        type: "NOTE", // Maps to existing ActivityType enum
        content: options.summary,
        subject: options.type,
        userId: options.userId,
        organizationId: options.organizationId,
        // Link to specific records based on type
        ...(options.recordType === "account" && { accountId: options.recordId }),
        ...(options.recordType === "contact" && { contactId: options.recordId }),
        ...(options.recordType === "opportunity" && { opportunityId: options.recordId }),
        ...(options.recordType === "lead" && { leadId: options.recordId }),
        ...(options.recordType === "task" && { taskId: options.recordId }),
      },
    });
  } catch (error) {
    // Log error but don't throw - audit failures shouldn't break main operations
    console.error("[AUDIT] Failed to log audit event:", error, options);
  }
}

/**
 * Log a settings change with before/after values
 */
export async function logSettingsChange(
  userId: string,
  organizationId: string,
  settingType: "organization" | "user" | "stage" | "lead_assignment",
  changes: FieldChange[]
) {
  const summary = changes.map(c =>
    `Changed ${c.field}: ${formatValue(c.oldValue)} → ${formatValue(c.newValue)}`
  ).join("; ");

  await logAuditEvent({
    type: "SETTINGS_CHANGE",
    recordType: "settings",
    recordId: organizationId,
    userId,
    organizationId,
    summary: `${settingType} settings: ${summary}`,
    details: { changes },
  });
}

/**
 * Log a lead assignment change
 */
export async function logLeadAssignment(
  leadId: string,
  userId: string,
  organizationId: string,
  fromUserId: string | null,
  toUserId: string,
  assignmentMethod: "MANUAL" | "ROUND_ROBIN" | "RULE_BASED"
) {
  await logAuditEvent({
    type: "ASSIGNMENT_CHANGE",
    recordType: "lead",
    recordId: leadId,
    userId,
    organizationId,
    summary: `Lead assigned ${fromUserId ? `from ${fromUserId} ` : ""}to ${toUserId} via ${assignmentMethod}`,
    details: { fromUserId, toUserId, method: assignmentMethod },
  });
}

/**
 * Log an opportunity stage change
 */
export async function logStageChange(
  opportunityId: string,
  userId: string,
  organizationId: string,
  fromStage: string,
  toStage: string,
  method: "KANBAN_DRAG" | "FORM_EDIT" | "AUTOMATION"
) {
  await logAuditEvent({
    type: "STAGE_CHANGE",
    recordType: "opportunity",
    recordId: opportunityId,
    userId,
    organizationId,
    summary: `Stage changed from ${fromStage} to ${toStage} (${method})`,
    details: { fromStage, toStage, method },
  });
}

/**
 * Log a record creation
 */
export async function logRecordCreation(
  recordType: RecordType,
  recordId: string,
  userId: string,
  organizationId: string,
  recordName: string
) {
  await logAuditEvent({
    type: "RECORD_CREATE",
    recordType,
    recordId,
    userId,
    organizationId,
    summary: `Created ${recordType}: ${recordName}`,
  });
}

/**
 * Log a record deletion
 */
export async function logRecordDeletion(
  recordType: RecordType,
  recordId: string,
  userId: string,
  organizationId: string,
  recordName: string,
  reason?: string
) {
  await logAuditEvent({
    type: "RECORD_DELETE",
    recordType,
    recordId,
    userId,
    organizationId,
    summary: `Deleted ${recordType}: ${recordName}${reason ? ` (${reason})` : ""}`,
    details: { reason },
  });
}

/**
 * Log field edits with change tracking
 */
export async function logFieldEdits(
  recordType: RecordType,
  recordId: string,
  userId: string,
  organizationId: string,
  changes: FieldChange[]
) {
  // Create individual audit entries for each field change
  const entries = changes.map(change => ({
    type: "NOTE" as const,
    content: `Edited ${change.field}: ${formatValue(change.oldValue)} → ${formatValue(change.newValue)}`,
    subject: "FIELD_EDIT",
    userId,
    organizationId,
    ...(recordType === "account" && { accountId: recordId }),
    ...(recordType === "contact" && { contactId: recordId }),
    ...(recordType === "opportunity" && { opportunityId: recordId }),
    ...(recordType === "lead" && { leadId: recordId }),
  }));

  try {
    await prisma.activity.createMany({ data: entries });
  } catch (error) {
    console.error("[AUDIT] Failed to log field edits:", error);
  }
}

/**
 * Log WIP limit enforcement
 */
export async function logWipLimitEnforced(
  opportunityId: string,
  userId: string,
  organizationId: string,
  stage: string,
  currentCount: number,
  wipLimit: number
) {
  await logAuditEvent({
    type: "STATUS_CHANGE",
    recordType: "opportunity",
    recordId: opportunityId,
    userId,
    organizationId,
    summary: `WIP limit enforced for ${stage}: ${currentCount}/${wipLimit}`,
    details: { stage, currentCount, wipLimit },
  });
}

/**
 * Helper to format values for display
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}

/**
 * Helper to detect changes between objects
 */
export function detectChanges<T extends Record<string, any>>(
  oldObj: T,
  newObj: T,
  fieldsToTrack: (keyof T)[]
): FieldChange[] {
  const changes: FieldChange[] = [];

  fieldsToTrack.forEach(field => {
    const oldValue = oldObj[field];
    const newValue = newObj[field];

    // Compare values (handle dates, numbers, strings, etc.)
    const oldStr = oldValue instanceof Date ? oldValue.toISOString() : String(oldValue);
    const newStr = newValue instanceof Date ? newValue.toISOString() : String(newValue);

    if (oldStr !== newStr) {
      changes.push({
        field: String(field),
        oldValue,
        newValue,
      });
    }
  });

  return changes;
}

/**
 * Example Usage:
 *
 * ```ts
 * // In a server action that updates organization settings:
 * import { logSettingsChange } from '@/lib/audit';
 *
 * const changes = detectChanges(currentSettings, newSettings, ['timezone', 'currency']);
 * await logSettingsChange(user.id, user.organizationId, 'organization', changes);
 * ```
 *
 * ```ts
 * // In lead assignment logic:
 * import { logLeadAssignment } from '@/lib/audit';
 *
 * await logLeadAssignment(
 *   lead.id,
 *   user.id,
 *   user.organizationId,
 *   lead.assignedToId,
 *   newAssigneeId,
 *   'ROUND_ROBIN'
 * );
 * ```
 */
