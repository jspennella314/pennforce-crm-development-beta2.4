import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/app/lib/emailService';

// POST /api/email-campaigns/[id]/send - Send a campaign immediately
export async function POST(
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
      include: {
        recipients: {
          where: {
            status: 'PENDING',
          },
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                account: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Can only send draft or scheduled campaigns
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      return NextResponse.json(
        { error: 'Can only send draft or scheduled campaigns' },
        { status: 400 }
      );
    }

    if (campaign.recipients.length === 0) {
      return NextResponse.json(
        { error: 'No pending recipients found' },
        { status: 400 }
      );
    }

    // Update campaign status to SENDING
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
      },
    });

    // Send emails in background (we'll return immediately and process async)
    // In production, you'd want to use a queue system like Bull or BullMQ
    sendCampaignEmails(campaign.id, campaign.recipients, campaign.subject, campaign.body, campaign.fromName, campaign.fromEmail)
      .catch(err => console.error('Error sending campaign emails:', err));

    return NextResponse.json({
      success: true,
      message: 'Campaign is being sent',
      totalRecipients: campaign.recipients.length,
    });
  } catch (error) {
    console.error('Error initiating campaign send:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

// Background function to send campaign emails
async function sendCampaignEmails(
  campaignId: string,
  recipients: any[],
  subject: string,
  body: string,
  fromName: string,
  fromEmail: string
) {
  let sentCount = 0;
  let failedCount = 0;

  try {
    for (const recipient of recipients) {
      try {
        // Process template variables
        const variables = {
          firstName: recipient.contact.firstName || '',
          lastName: recipient.contact.lastName || '',
          name: `${recipient.contact.firstName} ${recipient.contact.lastName}`.trim(),
          email: recipient.contact.email || '',
          accountName: recipient.contact.account?.name || '',
        };

        const processedSubject = emailService.processTemplate(subject, variables);
        const processedBody = emailService.processTemplate(body, variables);

        // Send email
        const result = await emailService.sendEmail({
          to_email: recipient.email,
          to_name: variables.name || recipient.email,
          from_name: fromName,
          from_email: fromEmail,
          subject: processedSubject,
          message: processedBody,
        });

        // Update recipient status
        if (result.success) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });
          sentCount++;
        } else {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'FAILED',
              errorMessage: result.error || 'Unknown error',
            },
          });
          failedCount++;
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err: any) {
        console.error(`Error sending to ${recipient.email}:`, err);
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorMessage: err.message || 'Unknown error',
          },
        });
        failedCount++;
      }
    }

    // Update campaign final status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: failedCount === recipients.length ? 'FAILED' : 'SENT',
        sentCount,
        failedCount,
      },
    });
  } catch (error) {
    console.error('Fatal error in sendCampaignEmails:', error);
    // Mark campaign as failed
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'FAILED',
        sentCount,
        failedCount,
      },
    });
  }
}
