import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/cron/process-campaigns - Process scheduled campaigns
// This should be called by a cron job every minute or so
// You can use services like Vercel Cron, GitHub Actions, or external cron services
export async function GET(req: NextRequest) {
  try {
    // Optional: Add authorization header check for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find campaigns that are scheduled and due to be sent
    const now = new Date();
    const scheduledCampaigns = await prisma.emailCampaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (scheduledCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No campaigns to process',
        processed: 0,
      });
    }

    // Trigger send for each campaign
    const results = [];
    for (const campaign of scheduledCampaigns) {
      try {
        // Call the send endpoint internally
        const sendResponse = await fetch(
          `${process.env.NEXTAUTH_URL}/api/email-campaigns/${campaign.id}/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (sendResponse.ok) {
          results.push({ campaignId: campaign.id, status: 'triggered' });
        } else {
          results.push({
            campaignId: campaign.id,
            status: 'failed',
            error: await sendResponse.text(),
          });
        }
      } catch (error: any) {
        console.error(`Error triggering campaign ${campaign.id}:`, error);
        results.push({
          campaignId: campaign.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${scheduledCampaigns.length} campaigns`,
      processed: scheduledCampaigns.length,
      results,
    });
  } catch (error) {
    console.error('Error processing scheduled campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled campaigns' },
      { status: 500 }
    );
  }
}
