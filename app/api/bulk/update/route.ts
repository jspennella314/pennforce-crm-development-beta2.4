import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrRedirect } from '@/lib/auth-utils';

// POST /api/bulk/update - Update multiple records
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrRedirect();
    const body = await request.json();
    const { model, ids, data } = body;

    if (!model || !ids || !Array.isArray(ids) || ids.length === 0 || !data) {
      return NextResponse.json(
        { error: 'Model, ids array, and data are required' },
        { status: 400 }
      );
    }

    // Validate model name to prevent injection
    const allowedModels = [
      'account',
      'contact',
      'opportunity',
      'task',
      'activity',
      'aircraft',
      'trip',
      'workOrder',
      'document',
    ];

    const modelName = model.toLowerCase();
    if (!allowedModels.includes(modelName)) {
      return NextResponse.json({ error: 'Invalid model name' }, { status: 400 });
    }

    // Get the Prisma model
    const prismaModel = (prisma as any)[modelName];

    if (!prismaModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 400 });
    }

    // Remove protected fields from data
    const protectedFields = ['id', 'createdAt', 'updatedAt', 'organizationId'];
    const cleanData = Object.keys(data).reduce((acc: any, key) => {
      if (!protectedFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    // Update records (organization check is handled by schema relations)
    const result = await prismaModel.updateMany({
      where: {
        id: { in: ids },
        organizationId: session.user.organizationId,
      },
      data: cleanData,
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `Successfully updated ${result.count} ${modelName}(s)`,
    });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update records' },
      { status: 500 }
    );
  }
}
