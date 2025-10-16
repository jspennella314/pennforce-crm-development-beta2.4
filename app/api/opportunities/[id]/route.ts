// API Route: Opportunity Detail
// GET /api/opportunities/:id - Get opportunity by ID with related data
// PATCH /api/opportunities/:id - Update opportunity
// DELETE /api/opportunities/:id - Delete opportunity

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        account: {
          select: { id: true, name: true, type: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        aircraft: {
          select: {
            id: true,
            make: true,
            model: true,
            tailNumber: true,
            year: true,
            status: true,
          },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        organization: {
          select: { id: true, name: true },
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
        tasks: {
          where: { status: { not: 'DONE' } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      contactId,
      aircraftId,
      ownerId,
    } = body;

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(stage && { stage }),
        ...(amount !== undefined && { amount }),
        ...(currency && { currency }),
        ...(closeDate !== undefined && { closeDate: closeDate ? new Date(closeDate) : null }),
        ...(probability !== undefined && { probability }),
        ...(pipeline && { pipeline }),
        ...(description !== undefined && { description }),
        ...(nextStep !== undefined && { nextStep }),
        ...(kanbanIndex !== undefined && { kanbanIndex }),
        ...(source !== undefined && { source }),
        ...(contactId !== undefined && { contactId }),
        ...(aircraftId !== undefined && { aircraftId }),
        ...(ownerId !== undefined && { ownerId }),
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

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.opportunity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}
