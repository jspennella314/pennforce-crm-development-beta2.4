"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateStage(input: {
  id: string;
  stage: string;
  position?: number;
}) {
  const user = await requireUser();

  // Get the current opportunity to check if stage is changing
  const currentOpp = await prisma.opportunity.findUnique({
    where: { id: input.id },
    select: { stage: true, organizationId: true },
  });

  if (!currentOpp) {
    return { ok: false, error: "Opportunity not found" };
  }

  const isStageChange = currentOpp.stage !== input.stage;

  // Check WIP limits only if moving to a different stage
  if (isStageChange) {
    const stageSetting = await prisma.stageSetting.findUnique({
      where: {
        organizationId_stage: {
          organizationId: currentOpp.organizationId,
          stage: input.stage as any,
        },
      },
    });

    // If WIP limit is set (> 0), enforce it
    if (stageSetting && stageSetting.wipLimit > 0) {
      const countInStage = await prisma.opportunity.count({
        where: {
          stage: input.stage as any,
          organizationId: currentOpp.organizationId,
          id: { not: input.id }, // Exclude current opportunity
        },
      });

      if (countInStage >= stageSetting.wipLimit) {
        return {
          ok: false,
          error: `WIP limit reached for ${input.stage} (max: ${stageSetting.wipLimit})`
        };
      }
    }
  }

  // Update the opportunity
  const opp = await prisma.opportunity.update({
    where: { id: input.id },
    data: {
      stage: input.stage as any,
      position: input.position ?? undefined,
    },
  });

  // Auto-log Activity only for stage changes
  if (isStageChange) {
    await prisma.activity.create({
      data: {
        type: "NOTE",
        content: `Stage changed to ${opp.stage}`,
        subject: "Stage Change",
        userId: user.id,
        opportunityId: opp.id,
        organizationId: user.organizationId,
      },
    });
  }

  revalidatePath("/opportunities/kanban");
  return { ok: true };
}
