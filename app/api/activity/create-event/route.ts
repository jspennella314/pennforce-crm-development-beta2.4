import { NextRequest, NextResponse } from 'next/server';
import { createEvent } from '@/app/actions/contact-activity';
import { auth } from '@/lib/auth';

// Prisma/bcrypt require Node.js runtime (not Edge)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, subject } = body;

    if (!contactId || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createEvent({
      contactId,
      subject,
      organizationId: session.user.organizationId,
      ownerId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.event);
  } catch (error) {
    console.error('Error in create-event API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
