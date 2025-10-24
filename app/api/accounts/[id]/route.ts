// API Route: Account Detail
// GET /api/accounts/:id - Get account by ID with related data
// PATCH /api/accounts/:id - Update account
// DELETE /api/accounts/:id - Delete account

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        opportunities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        aircraft: {
          orderBy: { createdAt: 'desc' },
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

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
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
      name,
      type,
      website,
      phone,
      email,
      billingAddr,
      shippingAddr,
      notes,
      ownerId,
    } = body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(billingAddr !== undefined && { billingAddr }),
        ...(shippingAddr !== undefined && { shippingAddr }),
        ...(notes !== undefined && { notes }),
        ...(ownerId !== undefined && { ownerId }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
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

    // Check for related records
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contacts: true,
            opportunities: true,
            aircraft: true,
            trips: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if account has related records
    const relatedRecords = [];
    if (account._count.contacts > 0) relatedRecords.push(`${account._count.contacts} contact(s)`);
    if (account._count.opportunities > 0) relatedRecords.push(`${account._count.opportunities} opportunity(ies)`);
    if (account._count.aircraft > 0) relatedRecords.push(`${account._count.aircraft} aircraft`);
    if (account._count.trips > 0) relatedRecords.push(`${account._count.trips} trip(s)`);

    if (relatedRecords.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete account. It has ${relatedRecords.join(', ')}. Please remove these first.` },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
