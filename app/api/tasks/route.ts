// API Route: Tasks
// GET /api/tasks - List all tasks (with org filter and search)
// POST /api/tasks - Create new task

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const accountId = searchParams.get('accountId');
    const opportunityId = searchParams.get('opportunityId');

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        owner: {
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
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      status,
      dueDate,
      ownerId,
      accountId,
      contactId,
      opportunityId,
      organizationId,
    } = body;

    if (!title || !ownerId || !organizationId) {
      return NextResponse.json(
        { error: 'Title, ownerId, and organizationId are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        status: status || 'OPEN',
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId,
        accountId,
        contactId,
        opportunityId,
        organizationId,
      },
      include: {
        owner: {
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
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
