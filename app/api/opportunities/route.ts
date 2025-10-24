// API Route: Opportunities
// GET /api/opportunities - List all opportunities (with org filter and search)
// POST /api/opportunities - Create new opportunity

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const stage = searchParams.get('stage');
    const pipeline = searchParams.get('pipeline');
    const search = searchParams.get('search');

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (stage) {
      where.stage = stage;
    }

    if (pipeline) {
      where.pipeline = pipeline;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: [{ stage: 'asc' }, { kanbanIndex: 'asc' }],
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        aircraft: {
          select: { id: true, make: true, model: true, tailNumber: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            activities: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
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
      name,
      stage,
      amount,
      currency,
      closeDate,
      probability,
      pipeline,
      description,
      nextStep,
      kanbanIndex,
      source,
      accountId,
      contactId,
      aircraftId,
      ownerId,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        name,
        stage: stage || 'PROSPECT',
        amount,
        currency: currency || 'USD',
        closeDate: closeDate ? new Date(closeDate) : null,
        probability,
        pipeline: pipeline || 'AIRCRAFT_SALE',
        description,
        nextStep,
        kanbanIndex: kanbanIndex || 0,
        source,
        accountId: accountId || null,
        contactId: contactId || null,
        aircraftId: aircraftId || null,
        ownerId: ownerId || session.user.id,
        organizationId: session.user.organizationId,
      },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        aircraft: {
          select: { id: true, make: true, model: true, tailNumber: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
