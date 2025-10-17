import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startTime !== undefined) updateData.startTime = new Date(body.startTime);
    if (body.endTime !== undefined) updateData.endTime = new Date(body.endTime);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.isAllDay !== undefined) updateData.isAllDay = body.isAllDay;
    if (body.eventType !== undefined) updateData.eventType = body.eventType;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.attendees !== undefined) updateData.attendees = body.attendees;
    if (body.reminderMinutes !== undefined) updateData.reminderMinutes = body.reminderMinutes;

    const event = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
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
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.calendarEvent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
