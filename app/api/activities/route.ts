// API Route: Activities
// GET /api/activities - List all activities (with org filter and search)
// POST /api/activities - Create new activity (log call, email, note, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');
    const contactId = searchParams.get('contactId');
    const opportunityId = searchParams.get('opportunityId');
    const aircraftId = searchParams.get('aircraftId');
    const limit = searchParams.get('limit');

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (type) {
      where.type = type;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    if (aircraftId) {
      where.aircraftId = aircraftId;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        opportunity: {
          select: { id: true, name: true, stage: true },
        },
        aircraft: {
          select: { id: true, make: true, model: true, tailNumber: true },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      content,
      subject,
      userId,
      accountId,
      contactId,
      opportunityId,
      aircraftId,
      organizationId,
    } = body;

    if (!type || !content || !organizationId) {
      return NextResponse.json(
        { error: 'Type, content, and organizationId are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        content,
        subject,
        userId,
        accountId,
        contactId,
        opportunityId,
        aircraftId,
        organizationId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        opportunity: {
          select: { id: true, name: true, stage: true },
        },
        aircraft: {
          select: { id: true, make: true, model: true, tailNumber: true },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
