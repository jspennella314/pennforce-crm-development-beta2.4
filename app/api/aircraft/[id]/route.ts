// API Route: Aircraft Detail
// GET /api/aircraft/:id - Get aircraft by ID with related data
// PATCH /api/aircraft/:id - Update aircraft
// DELETE /api/aircraft/:id - Delete aircraft

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aircraft = await prisma.aircraft.findUnique({
      where: { id },
      include: {
        ownerAccount: {
          select: { id: true, name: true, type: true },
        },
        operatorAccount: {
          select: { id: true, name: true, type: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        opportunities: {
          orderBy: { createdAt: 'desc' },
        },
        workOrders: {
          orderBy: { createdAt: 'desc' },
        },
        trips: {
          orderBy: { date: 'desc' },
          take: 20,
        },
        activities: {
          orderBy: { loggedAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!aircraft) {
      return NextResponse.json(
        { error: 'Aircraft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const aircraft = await prisma.aircraft.update({
      where: { id },
      data: {
        ...(make && { make }),
        ...(model && { model }),
        ...(variant !== undefined && { variant }),
        ...(year !== undefined && { year }),
        ...(serialNumber !== undefined && { serialNumber }),
        ...(tailNumber !== undefined && { tailNumber }),
        ...(status && { status }),
        ...(locationIcao !== undefined && { locationIcao }),
        ...(totalTimeHrs !== undefined && { totalTimeHrs }),
        ...(cycles !== undefined && { cycles }),
        ...(enginesJson !== undefined && { enginesJson }),
        ...(avionicsJson !== undefined && { avionicsJson }),
        ...(ownerAccountId !== undefined && { ownerAccountId }),
        ...(operatorAccountId !== undefined && { operatorAccountId }),
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

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error updating aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to update aircraft' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.aircraft.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to delete aircraft' },
      { status: 500 }
    );
  }
}
