import { z } from "zod";

// Organization settings schema with validation
export const orgSettingsSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  timezone: z.string().min(1).default("America/New_York"),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).default("USD"),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).default("MM/DD/YYYY"),

  // Notification settings
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    desktop: z.boolean().default(true),
    opportunityUpdates: z.boolean().default(true),
    leadAssignments: z.boolean().default(true),
    taskReminders: z.boolean().default(true),
  }).default({
    email: true,
    sms: false,
    desktop: true,
    opportunityUpdates: true,
    leadAssignments: true,
    taskReminders: true,
  }),

  // Integration settings (secrets masked in UI)
  integrations: z.object({
    clickfunnels: z.object({
      enabled: z.boolean().default(false),
      webhookUrl: z.string().url().optional(), // stored server-side, masked in UI
      webhookSecret: z.string().min(8).optional(), // never sent to client
    }).default({ enabled: false }),
    emailjs: z.object({
      enabled: z.boolean().default(false),
      serviceId: z.string().optional(),
      templateId: z.string().optional(),
      publicKey: z.string().optional(),
      privateKey: z.string().optional(), // never sent to client
    }).default({ enabled: false }),
  }).default({
    clickfunnels: { enabled: false },
    emailjs: { enabled: false },
  }),

  // Sales settings
  sales: z.object({
    defaultLeadAssignment: z.enum(["ROUND_ROBIN", "MANUAL", "TERRITORY"]).default("ROUND_ROBIN"),
    opportunityStages: z.array(z.string()).optional(),
    requiredFieldsOnClose: z.array(z.string()).default(["closeReason", "amount"]),
  }).default({
    defaultLeadAssignment: "ROUND_ROBIN",
    requiredFieldsOnClose: ["closeReason", "amount"],
  }),
}).strict();

export type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  userId: z.string().min(1),
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  language: z.enum(["en", "es", "fr", "de"]).default("en"),
  dashboardLayout: z.array(z.string()).optional(),
  defaultView: z.enum(["LIST", "KANBAN", "TABLE"]).default("LIST"),
  itemsPerPage: z.number().int().min(10).max(100).default(25),
}).strict();

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

// Lead assignment rule schema
export const leadAssignmentRuleSchema = z.object({
  id: z.string().optional(), // optional for creation
  orgId: z.string().min(1),
  name: z.string().min(1, "Rule name is required"),
  priority: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
  criteria: z.object({
    source: z.array(z.string()).optional(),
    territory: z.array(z.string()).optional(),
    industry: z.array(z.string()).optional(),
    leadScore: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }),
  assignTo: z.object({
    type: z.enum(["USER", "TEAM", "QUEUE"]),
    targetId: z.string(),
  }),
}).strict();

export type LeadAssignmentRuleInput = z.infer<typeof leadAssignmentRuleSchema>;

// Stage settings schema (for Kanban WIP limits)
export const stageSettingsSchema = z.object({
  stage: z.string().min(1),
  orgId: z.string().min(1),
  wipLimit: z.number().int().min(0).nullable().default(null),
  autoAssign: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
  estimatedDuration: z.number().int().min(0).nullable().default(null), // days
}).strict();

export type StageSettingsInput = z.infer<typeof stageSettingsSchema>;
