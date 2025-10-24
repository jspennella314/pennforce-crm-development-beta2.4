import { z } from "zod";

export const clickFunnelsLeadSchema = z.object({
  // Common ClickFunnels-style fields (adjust to your mapping)
  firstName: z.string().optional().or(z.literal("").transform(() => undefined)),
  lastName: z.string().optional().or(z.literal("").transform(() => undefined)),
  email: z.string().email().optional(),
  phone: z.string().optional(),

  // IDs
  funnelId: z.string().optional(),
  externalId: z.string().optional(), // contact id, etc.

  // UTM
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
})
.transform((raw) => ({
  firstName: raw.firstName,
  lastName: raw.lastName,
  email: raw.email,
  phone: raw.phone,
  funnelId: raw.funnelId,
  externalId: raw.externalId,
  utmSource: raw.utm_source,
  utmMedium: raw.utm_medium,
  utmCampaign: raw.utm_campaign,
  utmTerm: raw.utm_term,
  utmContent: raw.utm_content,
}));

export type ClickFunnelsLead = z.infer<typeof clickFunnelsLeadSchema>;
