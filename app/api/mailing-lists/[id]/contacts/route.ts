import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/mailing-lists/[id]/contacts - Add contacts to a mailing list
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactIds } = await req.json();

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'contactIds array is required' },
        { status: 400 }
      );
    }

    // Verify mailing list ownership
    const mailingList = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!mailingList) {
      return NextResponse.json(
        { error: 'Mailing list not found' },
        { status: 404 }
      );
    }

    // Verify all contacts belong to the organization
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        organizationId: session.user.organizationId,
      },
    });

    if (contacts.length !== contactIds.length) {
      return NextResponse.json(
        { error: 'Some contacts not found or do not belong to your organization' },
        { status: 400 }
      );
    }

    // Add contacts to mailing list (ignore duplicates)
    const results = await Promise.allSettled(
      contactIds.map((contactId: string) =>
        prisma.mailingListContact.create({
          data: {
            mailingListId: params.id,
            contactId,
          },
        })
      )
    );

    const added = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      added,
      total: contactIds.length,
    });
  } catch (error) {
    console.error('Error adding contacts to mailing list:', error);
    return NextResponse.json(
      { error: 'Failed to add contacts to mailing list' },
      { status: 500 }
    );
  }
}

// DELETE /api/mailing-lists/[id]/contacts - Remove contacts from mailing list
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactIds } = await req.json();

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'contactIds array is required' },
        { status: 400 }
      );
    }

    // Verify mailing list ownership
    const mailingList = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!mailingList) {
      return NextResponse.json(
        { error: 'Mailing list not found' },
        { status: 404 }
      );
    }

    // Remove contacts from mailing list
    const result = await prisma.mailingListContact.deleteMany({
      where: {
        mailingListId: params.id,
        contactId: { in: contactIds },
      },
    });

    return NextResponse.json({
      success: true,
      removed: result.count,
    });
  } catch (error) {
    console.error('Error removing contacts from mailing list:', error);
    return NextResponse.json(
      { error: 'Failed to remove contacts from mailing list' },
      { status: 500 }
    );
  }
}
