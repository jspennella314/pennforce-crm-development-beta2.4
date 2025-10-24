import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clickFunnelsLeadSchema } from "@/lib/zod/lead";

export const runtime = "nodejs";

function verifySecret(req: Request) {
  const provided = new URL(req.url).searchParams.get("secret")
    ?? req.headers.get("x-webhook-secret")
    ?? "";
  return provided === process.env.CLICKFUNNELS_WEBHOOK_SECRET;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ClickFunnels may wrap payloads (e.g., { event: "...", data: {...} })
  const raw = (json as any)?.data ?? json;

  const parsed = clickFunnelsLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // idempotency: prevent duplicate emails/externalIds in short window
  const existing = data.email
    ? await prisma.lead.findFirst({ where: { email: data.email } })
    : data.externalId
    ? await prisma.lead.findFirst({ where: { externalId: data.externalId } })
    : null;

  if (existing) {
    // Upsert some fields in case they improved (e.g., phone)
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        firstName: data.firstName ?? existing.firstName,
        lastName: data.lastName ?? existing.lastName,
        phone: data.phone ?? existing.phone,
        funnelId: data.funnelId ?? existing.funnelId,
        utmSource: data.utmSource ?? existing.utmSource,
        utmMedium: data.utmMedium ?? existing.utmMedium,
        utmCampaign: data.utmCampaign ?? existing.utmCampaign,
        utmTerm: data.utmTerm ?? existing.utmTerm,
        utmContent: data.utmContent ?? existing.utmContent,
      },
    });
    return NextResponse.json({ ok: true, id: existing.id, updated: true });
  }

  // Get the first organization for now - in production you might want to identify
  // the organization based on the webhook source or a parameter
  const organization = await prisma.organization.findFirst();
  if (!organization) {
    return NextResponse.json({ error: "No organization found" }, { status: 500 });
  }

  const lead = await prisma.lead.create({
    data: {
      name: [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Unknown Lead',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: "clickfunnels",
      funnelId: data.funnelId,
      externalId: data.externalId,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      status: "NEW",
      organizationId: organization.id,
    },
  });

  // optional auto-assign
  try {
    const { nextAssignee } = await import("@/lib/leads/assignment");
    const userId = await nextAssignee();
    if (userId) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { assignedToId: userId },
      });
    }
  } catch { /* ignore */ }

  return NextResponse.json({ ok: true, id: lead.id });
}
