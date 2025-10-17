import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getWorkflowRules,
  createWorkflowRule,
  WorkflowRuleConfig,
} from '@/app/lib/workflowEngine';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const objectType = searchParams.get('objectType') || undefined;

    const rules = await getWorkflowRules(session.user.organizationId, objectType);
    return NextResponse.json(rules);
  } catch (error: any) {
    console.error('Error fetching workflow rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config: WorkflowRuleConfig = await request.json();

    const rule = await createWorkflowRule(config, session.user.organizationId);
    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workflow rule:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow rule' },
      { status: 500 }
    );
  }
}
