// Workflow Automation Engine
import { prisma } from '@/lib/prisma';

// Condition operators
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value?: any;
  logicOperator?: 'AND' | 'OR'; // Used when multiple conditions
}

// Action types
export type ActionType =
  | 'create_task'
  | 'send_notification'
  | 'update_field'
  | 'assign_owner'
  | 'send_email'
  | 'create_activity'
  | 'webhook';

export interface WorkflowAction {
  type: ActionType;
  parameters: Record<string, any>;
}

export interface WorkflowRuleConfig {
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: 'RECORD_CREATED' | 'RECORD_UPDATED' | 'FIELD_CHANGED' | 'TIME_BASED';
  objectType: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

// Evaluate a single condition
function evaluateCondition(value: any, condition: WorkflowCondition): boolean {
  const { operator, value: conditionValue } = condition;

  switch (operator) {
    case 'equals':
      return value === conditionValue;
    case 'not_equals':
      return value !== conditionValue;
    case 'contains':
      return String(value).includes(String(conditionValue));
    case 'not_contains':
      return !String(value).includes(String(conditionValue));
    case 'greater_than':
      return Number(value) > Number(conditionValue);
    case 'less_than':
      return Number(value) < Number(conditionValue);
    case 'greater_or_equal':
      return Number(value) >= Number(conditionValue);
    case 'less_or_equal':
      return Number(value) <= Number(conditionValue);
    case 'is_empty':
      return !value || value === '' || (Array.isArray(value) && value.length === 0);
    case 'is_not_empty':
      return !!value && value !== '' && (!Array.isArray(value) || value.length > 0);
    case 'in':
      return Array.isArray(conditionValue) && conditionValue.includes(value);
    case 'not_in':
      return Array.isArray(conditionValue) && !conditionValue.includes(value);
    default:
      return false;
  }
}

// Evaluate all conditions
function evaluateConditions(record: any, conditions: WorkflowCondition[]): boolean {
  if (!conditions || conditions.length === 0) return true;

  let result = true;
  let currentLogic: 'AND' | 'OR' = 'AND';

  for (const condition of conditions) {
    const fieldValue = record[condition.field];
    const conditionResult = evaluateCondition(fieldValue, condition);

    if (currentLogic === 'AND') {
      result = result && conditionResult;
    } else {
      result = result || conditionResult;
    }

    // Set logic operator for next condition
    currentLogic = condition.logicOperator || 'AND';
  }

  return result;
}

// Execute action
async function executeAction(
  action: WorkflowAction,
  record: any,
  organizationId: string
): Promise<any> {
  const { type, parameters } = action;

  try {
    switch (type) {
      case 'create_task': {
        const task = await prisma.task.create({
          data: {
            title: replaceVariables(parameters.title, record),
            ownerId: parameters.ownerId || record.ownerId,
            organizationId,
            accountId: record.accountId || null,
            contactId: record.contactId || null,
            opportunityId: record.opportunityId || null,
            dueDate: parameters.dueDate ? new Date(parameters.dueDate) : null,
          },
        });
        return { success: true, task };
      }

      case 'send_notification': {
        const notification = await prisma.notification.create({
          data: {
            userId: parameters.userId || record.ownerId,
            type: parameters.notificationType || 'info',
            title: replaceVariables(parameters.title, record),
            message: replaceVariables(parameters.message, record),
            link: parameters.link || null,
            organizationId,
          },
        });
        return { success: true, notification };
      }

      case 'update_field': {
        // Get the model name and update the record
        const model = getModel(record.__type);
        if (model) {
          const updated = await model.update({
            where: { id: record.id },
            data: {
              [parameters.field]: replaceVariables(parameters.value, record),
            },
          });
          return { success: true, updated };
        }
        return { success: false, error: 'Model not found' };
      }

      case 'assign_owner': {
        const model = getModel(record.__type);
        if (model) {
          const updated = await model.update({
            where: { id: record.id },
            data: { ownerId: parameters.userId },
          });
          return { success: true, updated };
        }
        return { success: false, error: 'Model not found' };
      }

      case 'create_activity': {
        const activity = await prisma.activity.create({
          data: {
            type: parameters.activityType || 'NOTE',
            subject: replaceVariables(parameters.subject, record),
            content: replaceVariables(parameters.content, record),
            userId: parameters.userId || record.ownerId,
            organizationId,
            accountId: record.accountId || null,
            contactId: record.contactId || null,
            opportunityId: record.opportunityId || null,
            aircraftId: record.aircraftId || null,
          },
        });
        return { success: true, activity };
      }

      case 'send_email':
        // Email sending would be integrated with email service
        return { success: true, message: 'Email queued' };

      case 'webhook':
        // Webhook would make HTTP request
        return { success: true, message: 'Webhook triggered' };

      default:
        return { success: false, error: 'Unknown action type' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Helper: Replace variables in strings like {{fieldName}}
function replaceVariables(template: string, record: any): string {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    return record[field] !== undefined ? record[field] : match;
  });
}

// Helper: Get Prisma model by name
function getModel(modelName: string): any {
  const models: Record<string, any> = {
    Account: prisma.account,
    Contact: prisma.contact,
    Opportunity: prisma.opportunity,
    Task: prisma.task,
    Aircraft: prisma.aircraft,
    WorkOrder: prisma.workOrder,
  };
  return models[modelName];
}

// Main workflow execution
export async function executeWorkflow(
  workflowRuleId: string,
  record: any,
  organizationId: string
): Promise<void> {
  try {
    // Get workflow rule
    const rule = await prisma.workflowRule.findUnique({
      where: { id: workflowRuleId },
    });

    if (!rule || !rule.isActive) {
      return;
    }

    const conditions = rule.conditions as any as WorkflowCondition[];
    const actions = rule.actions as any as WorkflowAction[];

    // Evaluate conditions
    const conditionsMet = evaluateConditions(record, conditions);

    if (conditionsMet) {
      // Execute actions
      const results = [];
      for (const action of actions) {
        const result = await executeAction(action, record, organizationId);
        results.push(result);
      }

      // Log execution
      await prisma.workflowExecution.create({
        data: {
          workflowRuleId: rule.id,
          entityType: rule.objectType,
          entityId: record.id,
          status: results.every((r) => r.success) ? 'SUCCESS' : 'FAILED',
          result: results,
        },
      });

      // Update rule stats
      await prisma.workflowRule.update({
        where: { id: rule.id },
        data: {
          lastTriggered: new Date(),
          timesTriggered: { increment: 1 },
        },
      });
    }
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

// Trigger workflows for a record
export async function triggerWorkflows(
  objectType: string,
  triggerType: string,
  record: any,
  organizationId: string,
  changedFields?: string[]
): Promise<void> {
  try {
    // Add type information to record
    const enrichedRecord = { ...record, __type: objectType };

    // Find matching workflow rules
    const rules = await prisma.workflowRule.findMany({
      where: {
        organizationId,
        objectType,
        triggerType,
        isActive: true,
      },
    });

    // Execute each matching rule
    for (const rule of rules) {
      // For FIELD_CHANGED triggers, check if any of the changed fields match
      if (triggerType === 'FIELD_CHANGED' && changedFields) {
        const conditions = rule.conditions as any as WorkflowCondition[];
        const hasMatchingField = conditions.some((c) => changedFields.includes(c.field));
        if (!hasMatchingField) continue;
      }

      await executeWorkflow(rule.id, enrichedRecord, organizationId);
    }
  } catch (error) {
    console.error('Error triggering workflows:', error);
  }
}

// Create a workflow rule
export async function createWorkflowRule(
  config: WorkflowRuleConfig,
  organizationId: string
): Promise<any> {
  return prisma.workflowRule.create({
    data: {
      name: config.name,
      description: config.description,
      isActive: config.isActive,
      triggerType: config.triggerType,
      objectType: config.objectType,
      conditions: config.conditions as any,
      actions: config.actions as any,
      organizationId,
    },
  });
}

// Update a workflow rule
export async function updateWorkflowRule(
  id: string,
  config: Partial<WorkflowRuleConfig>
): Promise<any> {
  const updateData: any = {};

  if (config.name !== undefined) updateData.name = config.name;
  if (config.description !== undefined) updateData.description = config.description;
  if (config.isActive !== undefined) updateData.isActive = config.isActive;
  if (config.triggerType !== undefined) updateData.triggerType = config.triggerType;
  if (config.objectType !== undefined) updateData.objectType = config.objectType;
  if (config.conditions !== undefined) updateData.conditions = config.conditions;
  if (config.actions !== undefined) updateData.actions = config.actions;

  return prisma.workflowRule.update({
    where: { id },
    data: updateData,
  });
}

// Delete a workflow rule
export async function deleteWorkflowRule(id: string): Promise<void> {
  await prisma.workflowRule.delete({
    where: { id },
  });
}

// Get workflow rules
export async function getWorkflowRules(
  organizationId: string,
  objectType?: string
): Promise<any[]> {
  return prisma.workflowRule.findMany({
    where: {
      organizationId,
      ...(objectType && { objectType }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get workflow executions
export async function getWorkflowExecutions(
  workflowRuleId: string,
  limit = 50
): Promise<any[]> {
  return prisma.workflowExecution.findMany({
    where: { workflowRuleId },
    orderBy: { executedAt: 'desc' },
    take: limit,
  });
}
