import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OpportunityStage } from "@prisma/client";

// simple stage → probability mapping (adjust as needed)
const PROB: Record<string, number> = {
  PROSPECT: 10,
  QUALIFY: 25,
  PROPOSAL: 50,
  NEGOTIATION: 75,
  WON: 100,
  LOST: 0,
  // Old stage names for compatibility
  Prospecting: 10,
  Qualification: 25,
  Proposal: 50,
  Negotiation: 75,
  "Closed Won": 100,
  "Closed Lost": 0,
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { stage } = await req.json();
    if (typeof stage !== "string" || !stage) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    const probability = PROB[stage] ?? null;

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { stage: stage as OpportunityStage, probability },
      select: { id: true, stage: true, probability: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}
