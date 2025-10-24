import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { nextAssignee } from "@/lib/leads/assignment";

export const runtime = "nodejs";

function parseCsv(text: string): Record<string, string>[] {
  // minimal CSV parser (no quotes/escapes); acceptable for clean exports
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map(h=>h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(",").map(c=>c.trim());
    const row: Record<string,string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
    return row;
  });
}

export async function POST(req: Request) {
  // ensure only authenticated users can import
  const user = await requireUser();
  const text = await req.text();
  const rows = parseCsv(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No data to import" }, { status: 400 });
  }

  let created = 0, updated = 0, errors = 0;
  const assignee = await nextAssignee();

  // Get user's organization
  const userWithOrg = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organizations: { take: 1 } }
  });

  if (!userWithOrg || userWithOrg.organizations.length === 0) {
    return NextResponse.json({ error: "No organization found" }, { status: 500 });
  }

  const organizationId = userWithOrg.organizations[0].id;

  for (const r of rows) {
    try {
      const email = r.email?.toLowerCase() || undefined;
      const name = [r.firstName, r.lastName].filter(Boolean).join(' ') || email || 'Unknown Lead';

      const existing = email ? await prisma.lead.findFirst({
        where: {
          email,
          organizationId
        }
      }) : null;

      if (existing) {
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            firstName: r.firstName || existing.firstName,
            lastName: r.lastName || existing.lastName,
            phone: r.phone || existing.phone,
            utmSource: r.utm_source || existing.utmSource,
            utmMedium: r.utm_medium || existing.utmMedium,
            utmCampaign: r.utm_campaign || existing.utmCampaign,
            utmTerm: r.utm_term || existing.utmTerm,
            utmContent: r.utm_content || existing.utmContent,
          },
        });
        updated++;
      } else {
        await prisma.lead.create({
          data: {
            name,
            firstName: r.firstName || undefined,
            lastName: r.lastName || undefined,
            email,
            phone: r.phone || undefined,
            source: "csv",
            utmSource: r.utm_source || undefined,
            utmMedium: r.utm_medium || undefined,
            utmCampaign: r.utm_campaign || undefined,
            utmTerm: r.utm_term || undefined,
            utmContent: r.utm_content || undefined,
            status: "NEW",
            assignedToId: assignee || undefined,
            organizationId,
          },
        });
        created++;
      }
    } catch (error) {
      console.error('Error importing row:', error);
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    rows: rows.length,
    created,
    updated,
    errors: errors > 0 ? errors : undefined
  });
}
