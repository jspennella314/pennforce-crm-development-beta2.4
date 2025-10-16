// Email template variable replacement
export function renderEmailTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template;

  // Replace {{variable}} with actual values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  }

  return rendered;
}

// Extract variables from template
export function extractTemplateVariables(template: string): string[] {
  const regex = /{{(\w+)}}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

// Common template variables for different entities
export const TEMPLATE_VARIABLES = {
  contact: [
    'firstName',
    'lastName',
    'email',
    'phone',
    'title',
    'accountName',
  ],
  account: [
    'name',
    'type',
    'phone',
    'email',
    'website',
  ],
  opportunity: [
    'name',
    'stage',
    'amount',
    'currency',
    'closeDate',
    'accountName',
    'contactName',
  ],
  user: [
    'name',
    'email',
    'organizationName',
  ],
};

// Default email templates
export const DEFAULT_TEMPLATES = {
  contactWelcome: {
    name: 'Contact Welcome Email',
    subject: 'Welcome to {{organizationName}}',
    body: `
      <p>Dear {{firstName}} {{lastName}},</p>

      <p>Thank you for connecting with us at {{organizationName}}. We're excited to work with you!</p>

      <p>If you have any questions, please don't hesitate to reach out.</p>

      <p>Best regards,<br>
      {{userName}}</p>
    `,
    category: 'Sales',
  },

  opportunityFollowUp: {
    name: 'Opportunity Follow-up',
    subject: 'Following up on {{opportunityName}}',
    body: `
      <p>Hi {{firstName}},</p>

      <p>I wanted to follow up on our opportunity: {{opportunityName}}.</p>

      <p>Current Status: {{stage}}<br>
      Estimated Value: {{currency}}{{amount}}<br>
      Expected Close: {{closeDate}}</p>

      <p>Let me know if you have any questions or need any additional information.</p>

      <p>Best regards,<br>
      {{userName}}</p>
    `,
    category: 'Sales',
  },

  taskReminder: {
    name: 'Task Reminder',
    subject: 'Reminder: {{taskTitle}}',
    body: `
      <p>Hi {{firstName}},</p>

      <p>This is a reminder about the following task:</p>

      <p><strong>{{taskTitle}}</strong><br>
      Due Date: {{dueDate}}</p>

      <p>Please let me know if you need any assistance.</p>

      <p>Best regards,<br>
      {{userName}}</p>
    `,
    category: 'Task',
  },
};
