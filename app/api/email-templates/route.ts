import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrRedirect } from '@/lib/auth-utils';

// GET /api/email-templates - List all email templates
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrRedirect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const whereClause: any = {
      organizationId: session.user.organizationId,
    };

    if (category) whereClause.category = category;
    if (isActive !== null) whereClause.isActive = isActive === 'true';

    const templates = await prisma.emailTemplate.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email-templates - Create email template
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrRedirect();
    const body = await request.json();
    const { name, subject, body: emailBody, category, isActive } = body;

    if (!name || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: emailBody,
        category: category || null,
        isActive: isActive ?? true,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
