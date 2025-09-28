import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const objectName = searchParams.get("object")!;
  const session = await requireSession();
  const orgId = session.user.organizationId!;
  const views = await prisma.listView.findMany({
    where: { organizationId: orgId, objectName,
      OR: [{ isPublic: true }, { ownerId: session.user.id }] },
    orderBy: [{ isPinned: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(views);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await requireSession();
  const orgId = session.user.organizationId!;
  const view = await prisma.listView.upsert({
    where: { organizationId_objectName_name: { organizationId: orgId, objectName: body.objectName, name: body.name }},
    update: { filtersJson: body.filtersJson, columnsJson: body.columnsJson, isPublic: !!body.isPublic },
    create: { ...body, ownerId: session.user.id, organizationId: orgId },
  });
  return NextResponse.json(view, { status: 201 });
}