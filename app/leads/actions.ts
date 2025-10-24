"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const statusEnum = z.enum(["NEW","CONTACTED","QUALIFIED","DISQUALIFIED","UNQUALIFIED","CONVERTED","LOST"]);

export async function updateLeadStatus(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  const parsed = statusEnum.parse(status);
  await prisma.lead.update({
    where: { id },
    data: { status: parsed },
  });
  revalidatePath("/leads");
}

export async function assignLead(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id") || "");
  const to = String(form.get("assignedToId") || "");
  await prisma.lead.update({
    where: { id },
    data: { assignedToId: to || user.id },
  });
  revalidatePath("/leads");
}

// ---- Lead → Account/Contact/Opportunity conversion ----
export async function convertLead(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id") || "");

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead not found");
  if (lead.convertedAt && lead.convertedAccountId && lead.convertedContactId && lead.convertedOpportunityId) {
    // idempotent: return existing targets
    return { ok: true, alreadyConverted: true, accountId: lead.convertedAccountId, contactId: lead.convertedContactId, opportunityId: lead.convertedOpportunityId };
  }

  const emailDomain = (lead.email || "").split("@")[1]?.toLowerCase() ?? null;
  const accountName =
    lead.company ||
    (emailDomain && emailDomain.split(".").slice(-2).join(".").toUpperCase()) ||
    [lead.firstName, lead.lastName].filter(Boolean).join(" ") ||
    "Unspecified";

  const result = await prisma.$transaction(async (tx) => {
    // 1) Account: create new account
    const account = await tx.account.create({
      data: {
        name: accountName,
        type: "PROSPECT",
        email: lead.email ?? undefined,
        phone: lead.phone ?? undefined,
        organizationId: lead.organizationId,
        ownerId: lead.ownerId ?? user.id,
      },
    });

    // 2) Contact
    const contact = await tx.contact.create({
      data: {
        firstName: lead.firstName ?? "Unknown",
        lastName: lead.lastName ?? "Lead",
        email: lead.email ?? undefined,
        phone: lead.phone ?? undefined,
        title: lead.title ?? undefined,
        accountId: account.id,
        organizationId: lead.organizationId,
        ownerId: lead.ownerId ?? user.id,
      },
    });

    // 3) Opportunity (default stage: PROSPECT)
    const opp = await tx.opportunity.create({
      data: {
        name: `New Opportunity — ${account.name}`,
        stage: "PROSPECT",
        position: 0,
        amount: null,
        accountId: account.id,
        contactId: contact.id,
        organizationId: lead.organizationId,
        ownerId: lead.ownerId ?? user.id,
      },
    });

    // 4) Mark lead converted + activity audit
    await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: "QUALIFIED",
        convertedAt: new Date(),
        convertedAccountId: account.id,
        convertedContactId: contact.id,
        convertedOpportunityId: opp.id,
        assignedToId: lead.assignedToId ?? user.id,
      },
    });

    // Create activity log
    await tx.activity.create({
      data: {
        type: "NOTE",
        content: `Lead converted to Account: ${account.name}, Contact: ${contact.firstName} ${contact.lastName}, Opportunity: ${opp.name}`,
        subject: "Lead Conversion",
        userId: user.id,
        accountId: account.id,
        contactId: contact.id,
        opportunityId: opp.id,
        organizationId: lead.organizationId,
      },
    });

    return { account, contact, opp };
  });

  revalidatePath("/leads");
  revalidatePath("/opportunities");
  revalidatePath("/accounts");
  revalidatePath("/contacts");
  return { ok: true, accountId: result.account.id, contactId: result.contact.id, opportunityId: result.opp.id };
}
