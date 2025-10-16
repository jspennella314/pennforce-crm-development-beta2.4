import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Note: In production, integrate with email service like SendGrid, Resend, or AWS SES
// For now, we'll log the email and create an activity record

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      cc,
      bcc,
      subject,
      body: emailBody,
      accountId,
      contactId,
      opportunityId,
      aircraftId,
      organizationId,
      userId,
    } = body;

    if (!to || !subject || !emailBody || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body, organizationId' },
        { status: 400 }
      );
    }

    // In production, send actual email here
    // Example with a service:
    // await emailService.send({
    //   to,
    //   cc,
    //   bcc,
    //   subject,
    //   html: emailBody,
    // });

    console.log('=== EMAIL WOULD BE SENT ===');
    console.log('To:', to);
    console.log('CC:', cc);
    console.log('BCC:', bcc);
    console.log('Subject:', subject);
    console.log('Body:', emailBody);
    console.log('===========================');

    // Create activity record
    const activity = await prisma.activity.create({
      data: {
        type: 'EMAIL',
        subject,
        content: `Sent email to: ${to}\n\n${emailBody}`,
        organizationId,
        userId: userId || null,
        accountId: accountId || null,
        contactId: contactId || null,
        opportunityId: opportunityId || null,
        aircraftId: aircraftId || null,
      },
      include: {
        user: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, name: true } },
        aircraft: { select: { id: true, tailNumber: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      activity,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
