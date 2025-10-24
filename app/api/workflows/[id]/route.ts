import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  updateWorkflowRule,
  deleteWorkflowRule,
  WorkflowRuleConfig,
} from '@/app/lib/workflowEngine';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config: Partial<WorkflowRuleConfig> = await request.json();
    const rule = await updateWorkflowRule(id, config);

    return NextResponse.json(rule);
  } catch (error: any) {
    console.error('Error updating workflow rule:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow rule' },
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
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteWorkflowRule(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting workflow rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow rule' },
      { status: 500 }
    );
  }
}
