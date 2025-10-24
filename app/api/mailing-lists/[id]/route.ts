import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/mailing-lists/[id] - Get a specific mailing list with contacts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mailingList = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
      include: {
        contacts: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                title: true,
                account: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { contacts: true }
        }
      },
    });

    if (!mailingList) {
      return NextResponse.json(
        { error: 'Mailing list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mailingList);
  } catch (error) {
    console.error('Error fetching mailing list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mailing list' },
      { status: 500 }
    );
  }
}

// PATCH /api/mailing-lists/[id] - Update a mailing list
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    // Verify ownership
    const existing = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Mailing list not found' },
        { status: 404 }
      );
    }

    // Check for name conflicts if name is being changed
    if (name && name.trim() !== existing.name) {
      const conflict = await prisma.mailingList.findUnique({
        where: {
          organizationId_name: {
            organizationId: session.user.organizationId,
            name: name.trim(),
          },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: 'A mailing list with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.mailingList.update({
      where: { id: params.id },
      data: {
        name: name?.trim(),
        description: description?.trim() || null,
      },
      include: {
        _count: {
          select: { contacts: true }
        }
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating mailing list:', error);
    return NextResponse.json(
      { error: 'Failed to update mailing list' },
      { status: 500 }
    );
  }
}

// DELETE /api/mailing-lists/[id] - Delete a mailing list
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Mailing list not found' },
        { status: 404 }
      );
    }

    await prisma.mailingList.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mailing list:', error);
    return NextResponse.json(
      { error: 'Failed to delete mailing list' },
      { status: 500 }
    );
  }
}
