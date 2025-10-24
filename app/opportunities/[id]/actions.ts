"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { opportunityUpdateSchema } from "@/lib/zod/opportunity";

export async function updateOpportunity(form: FormData) {
  const user = await requireUser();
  const data = Object.fromEntries(form) as Record<string, string>;
  const parsed = opportunityUpdateSchema.parse({
    id: data.id,
    stage: data.stage as any,
    amount: data.amount ? Number(data.amount) : null,
    closeDate: data.closeDate || null,
  });

  // Get current values before update for audit trail
  const currentOpp = await prisma.opportunity.findUnique({
    where: { id: parsed.id },
    select: {
      stage: true,
      amount: true,
      closeDate: true,
      organizationId: true,
    },
  });

  if (!currentOpp) {
    throw new Error("Opportunity not found");
  }

  // Update the opportunity
  await prisma.opportunity.update({
    where: { id: parsed.id },
    data: {
      stage: parsed.stage ?? undefined,
      amount: parsed.amount ?? undefined,
      closeDate: parsed.closeDate ? new Date(parsed.closeDate) : undefined,
    },
  });

  // Create field-level audit entries
  const auditEntries = [];

  // Check stage change
  if (parsed.stage && currentOpp.stage !== parsed.stage) {
    auditEntries.push({
      type: "NOTE" as const,
      content: `Edited Stage: ${parsed.stage}`,
      subject: "Field Edit",
      userId: user.id,
      opportunityId: parsed.id,
      organizationId: currentOpp.organizationId,
    });
  }

  // Check amount change
  if (parsed.amount !== null && parsed.amount !== undefined) {
    const currentAmount = currentOpp.amount ? Number(currentOpp.amount) : null;
    if (currentAmount !== parsed.amount) {
      auditEntries.push({
        type: "NOTE" as const,
        content: `Edited Amount: $${parsed.amount}`,
        subject: "Field Edit",
        userId: user.id,
        opportunityId: parsed.id,
        organizationId: currentOpp.organizationId,
      });
    }
  }

  // Check close date change
  if (parsed.closeDate) {
    const currentCloseDate = currentOpp.closeDate
      ? new Date(currentOpp.closeDate).toISOString().split('T')[0]
      : null;
    if (currentCloseDate !== parsed.closeDate.split('T')[0]) {
      auditEntries.push({
        type: "NOTE" as const,
        content: `Edited Close Date: ${new Date(parsed.closeDate).toLocaleDateString()}`,
        subject: "Field Edit",
        userId: user.id,
        opportunityId: parsed.id,
        organizationId: currentOpp.organizationId,
      });
    }
  }

  // Create all audit entries
  if (auditEntries.length > 0) {
    await prisma.activity.createMany({
      data: auditEntries,
    });
  }

  revalidatePath(`/opportunities/${parsed.id}`);
}
