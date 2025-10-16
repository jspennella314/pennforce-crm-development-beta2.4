// API Route: Users
// GET /api/users - List all users (with org filter)
// POST /api/users - Create new user

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const where = organizationId ? { organizationId } : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            ownedAccounts: true,
            ownedContacts: true,
            ownedOpportunities: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, role, passwordHash, organizationId } = body;

    if (!email || !organizationId) {
      return NextResponse.json(
        { error: 'Email and organizationId are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: role || 'user',
        passwordHash,
        organizationId,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
