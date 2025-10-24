import { z } from "zod";

export const opportunityUpdateSchema = z.object({
  id: z.string().min(1),
  stage: z.enum(["PROSPECT", "QUALIFY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional(),
  amount: z.number().min(0).optional().nullable(),
  closeDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export type OpportunityUpdateInput = z.infer<typeof opportunityUpdateSchema>;
