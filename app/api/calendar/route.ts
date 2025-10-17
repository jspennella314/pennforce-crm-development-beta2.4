import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const userId = searchParams.get('userId');

    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (start && end) {
      where.startTime = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    if (userId) {
      where.userId = userId;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location,
        isAllDay: body.isAllDay || false,
        eventType: body.eventType || 'MEETING',
        userId: body.userId || session.user.id,
        accountId: body.accountId,
        contactId: body.contactId,
        opportunityId: body.opportunityId,
        aircraftId: body.aircraftId,
        organizationId: session.user.organizationId,
        attendees: body.attendees || null,
        reminderMinutes: body.reminderMinutes,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
