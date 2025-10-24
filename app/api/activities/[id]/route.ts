// API Route: Activity Detail
// GET /api/activities/:id - Get activity by ID
// PATCH /api/activities/:id - Update activity
// DELETE /api/activities/:id - Delete activity

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true, type: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        opportunity: {
          select: { id: true, name: true, stage: true, amount: true },
        },
        aircraft: {
          select: { id: true, make: true, model: true, tailNumber: true },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
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
    const { type, content, subject } = body;

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(content && { content }),
        ...(subject !== undefined && { subject }),
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

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
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
    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
