// API Route: Contacts
// GET /api/contacts - List all contacts (with org filter and search)
// POST /api/contacts - Create new contact

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const accountId = searchParams.get('accountId');
    const search = searchParams.get('search');

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

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
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      accountId,
      ownerId,
      organizationId,
    } = body;

    if (!firstName || !lastName || !accountId || !organizationId) {
      return NextResponse.json(
        { error: 'firstName, lastName, accountId, and organizationId are required' },
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
        organizationId,
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
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
