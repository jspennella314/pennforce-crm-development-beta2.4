// API Route: Aircraft
// GET /api/aircraft - List all aircraft (with org filter and search)
// POST /api/aircraft - Create new aircraft

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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      // Always filter by authenticated user's organization
      organizationId: session.user.organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { tailNumber: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const aircraft = await prisma.aircraft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ownerAccount: {
          select: { id: true, name: true, type: true },
        },
        operatorAccount: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: {
            opportunities: true,
            workOrders: true,
            trips: true,
          },
        },
      },
    });

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft' },
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
      make,
      model,
      variant,
      year,
      serialNumber,
      tailNumber,
      status,
      locationIcao,
      totalTimeHrs,
      cycles,
      enginesJson,
      avionicsJson,
      ownerAccountId,
      operatorAccountId,
    } = body;

    if (!make || !model) {
      return NextResponse.json(
        { error: 'Make and model are required' },
        { status: 400 }
      );
    }

    const aircraft = await prisma.aircraft.create({
      data: {
        make,
        model,
        variant,
        year,
        serialNumber,
        tailNumber,
        status: status || 'ACTIVE',
        locationIcao,
        totalTimeHrs,
        cycles,
        enginesJson,
        avionicsJson,
        ownerAccountId,
        operatorAccountId,
        organizationId: session.user.organizationId,
      },
      include: {
        ownerAccount: {
          select: { id: true, name: true, type: true },
        },
        operatorAccount: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json(aircraft, { status: 201 });
  } catch (error) {
    console.error('Error creating aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to create aircraft' },
      { status: 500 }
    );
  }
}
