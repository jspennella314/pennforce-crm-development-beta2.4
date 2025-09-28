import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listView = await prisma.listView.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: session.user.id },
          { isPublic: true }
        ],
        organizationId: session.user.organizationId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!listView) {
      return NextResponse.json({ error: "List view not found" }, { status: 404 });
    }

    return NextResponse.json(listView);
  } catch (error) {
    console.error("Failed to fetch list view:", error);
    return NextResponse.json(
      { error: "Failed to fetch list view" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, filtersJson, columnsJson, isPinned, isPublic } = await request.json();

    // Check if user owns this list view
    const existingListView = await prisma.listView.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingListView) {
      return NextResponse.json(
        { error: "List view not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    const listView = await prisma.listView.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(filtersJson && { filtersJson }),
        ...(columnsJson !== undefined && { columnsJson }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(listView);
  } catch (error: any) {
    console.error("Failed to update list view:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A list view with this name already exists for this object" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update list view" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this list view
    const existingListView = await prisma.listView.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingListView) {
      return NextResponse.json(
        { error: "List view not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    await prisma.listView.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete list view:", error);
    return NextResponse.json(
      { error: "Failed to delete list view" },
      { status: 500 }
    );
  }
}