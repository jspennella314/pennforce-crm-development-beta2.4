import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/email-campaigns - Get all campaigns for organization
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mailingList: {
          select: {
            id: true,
            name: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { recipients: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/email-campaigns - Create a new campaign
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      subject,
      body,
      templateId,
      mailingListId,
      contactIds,
      fromEmail,
      fromName,
    } = await req.json();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: 'Campaign name, subject, and body are required' },
        { status: 400 }
      );
    }

    if (!mailingListId && (!contactIds || contactIds.length === 0)) {
      return NextResponse.json(
        { error: 'Either mailingListId or contactIds must be provided' },
        { status: 400 }
      );
    }

    // Get recipients
    let recipients: any[] = [];

    if (mailingListId) {
      // Verify mailing list ownership
      const mailingList = await prisma.mailingList.findFirst({
        where: {
          id: mailingListId,
          organizationId: session.user.organizationId,
        },
        include: {
          contacts: {
            include: {
              contact: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!mailingList) {
        return NextResponse.json(
          { error: 'Mailing list not found' },
          { status: 404 }
        );
      }

      recipients = mailingList.contacts
        .filter(c => c.contact.email) // Only include contacts with emails
        .map(c => c.contact);
    } else {
      // Get selected contacts
      const contacts = await prisma.contact.findMany({
        where: {
          id: { in: contactIds },
          organizationId: session.user.organizationId,
          email: { not: null }, // Only include contacts with emails
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (contacts.length === 0) {
        return NextResponse.json(
          { error: 'No valid contacts with email addresses found' },
          { status: 400 }
        );
      }

      recipients = contacts;
    }

    // Create campaign with recipients
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        body,
        status: 'DRAFT',
        fromEmail: fromEmail || 'info@pennjets.com',
        fromName: fromName || 'PennJets',
        templateId: templateId || null,
        mailingListId: mailingListId || null,
        creatorId: session.user.id,
        organizationId: session.user.organizationId,
        totalRecipients: recipients.length,
        recipients: {
          create: recipients.map(r => ({
            contactId: r.id,
            email: r.email!,
            status: 'PENDING',
          })),
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mailingList: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { recipients: true }
        }
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
