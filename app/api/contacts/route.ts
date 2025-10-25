// API Route: Contacts
// GET /api/contacts - List all contacts (with org filter and search)
// POST /api/contacts - Create new contact

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const search = searchParams.get('search');

    const where: any = {
      // Always filter by authenticated user's organization
      organizationId: session.user.organizationId,
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            opportunities: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      accountId,
      ownerId,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'firstName and lastName are required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        title,
        accountId,
        ownerId,
        organizationId: session.user.organizationId,
      },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);

    // Handle unique constraint violation (duplicate email)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'A contact with this email address already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
