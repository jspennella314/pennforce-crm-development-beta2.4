import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrRedirect } from '@/lib/auth-utils';

// PATCH /api/notifications/[id] - Mark as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionOrRedirect();
    const body = await request.json();
    const { isRead } = body;

    const notification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the notification
      },
      data: {
        isRead: isRead ?? true,
      },
    });

    return NextResponse.json(notification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionOrRedirect();

    await prisma.notification.delete({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the notification
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
