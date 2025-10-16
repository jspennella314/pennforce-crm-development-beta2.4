import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrRedirect } from '@/lib/auth-utils';

// POST /api/bulk/delete - Delete multiple records
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrRedirect();
    const body = await request.json();
    const { model, ids } = body;

    if (!model || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Model and ids array are required' },
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

    // Delete records (organization check is handled by schema relations)
    const result = await prismaModel.deleteMany({
      where: {
        id: { in: ids },
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} ${modelName}(s)`,
    });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete records' },
      { status: 500 }
    );
  }
}
