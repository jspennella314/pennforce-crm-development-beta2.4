import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/mailing-lists - Get all mailing lists for organization
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mailingLists = await prisma.mailingList.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mailingLists);
  } catch (error) {
    console.error('Error fetching mailing lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mailing lists' },
      { status: 500 }
    );
  }
}

// POST /api/mailing-lists - Create a new mailing list
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, contactIds } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Mailing list name is required' },
        { status: 400 }
      );
    }

    // Check if mailing list with this name already exists
    const existing = await prisma.mailingList.findUnique({
      where: {
        organizationId_name: {
          organizationId: session.user.organizationId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A mailing list with this name already exists' },
        { status: 400 }
      );
    }

    // Create mailing list with optional contacts
    const mailingList = await prisma.mailingList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        organizationId: session.user.organizationId,
        contacts: contactIds && contactIds.length > 0 ? {
          create: contactIds.map((contactId: string) => ({
            contactId,
          })),
        } : undefined,
      },
      include: {
        _count: {
          select: { contacts: true }
        }
      },
    });

    return NextResponse.json(mailingList, { status: 201 });
  } catch (error) {
    console.error('Error creating mailing list:', error);
    return NextResponse.json(
      { error: 'Failed to create mailing list' },
      { status: 500 }
    );
  }
}
