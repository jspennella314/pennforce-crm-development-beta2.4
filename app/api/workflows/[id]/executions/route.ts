import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWorkflowExecutions } from '@/app/lib/workflowEngine';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const executions = await getWorkflowExecutions(params.id, limit);
    return NextResponse.json(executions);
  } catch (error: any) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow executions' },
      { status: 500 }
    );
  }
}
