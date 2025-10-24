import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/email-campaigns/[id]/schedule - Schedule a campaign for later
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scheduledFor } = await req.json();

    if (!scheduledFor) {
      return NextResponse.json(
        { error: 'scheduledFor date is required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);

    // Verify it's a future date
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Get campaign
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Can only schedule draft campaigns
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only schedule draft campaigns' },
        { status: 400 }
      );
    }

    // Update campaign status to SCHEDULED
    const updated = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SCHEDULED',
        scheduledFor: scheduledDate,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { recipients: true }
        }
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updated,
      message: `Campaign scheduled for ${scheduledDate.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    return NextResponse.json(
      { error: 'Failed to schedule campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/email-campaigns/[id]/schedule - Cancel scheduled campaign
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get campaign
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Can only cancel scheduled campaigns
    if (campaign.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Can only cancel scheduled campaigns' },
        { status: 400 }
      );
    }

    // Update campaign status back to DRAFT
    const updated = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'DRAFT',
        scheduledFor: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign schedule cancelled',
      campaign: updated,
    });
  } catch (error) {
    console.error('Error cancelling campaign schedule:', error);
    return NextResponse.json(
      { error: 'Failed to cancel campaign schedule' },
      { status: 500 }
    );
  }
}
