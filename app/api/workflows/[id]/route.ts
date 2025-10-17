import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  updateWorkflowRule,
  deleteWorkflowRule,
  WorkflowRuleConfig,
} from '@/app/lib/workflowEngine';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config: Partial<WorkflowRuleConfig> = await request.json();
    const rule = await updateWorkflowRule(params.id, config);

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteWorkflowRule(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting workflow rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow rule' },
      { status: 500 }
    );
  }
}
