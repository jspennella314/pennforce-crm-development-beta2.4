import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrRedirect } from '@/lib/auth-utils';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  url: string;
}

// GET /api/search - Global search across all entities
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrRedirect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const orgId = session.user.organizationId;

    // Search across multiple entities in parallel
    const [accounts, contacts, opportunities, aircraft, tasks] = await Promise.all([
      // Search accounts
      prisma.account.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, type: true, email: true },
      }),

      // Search contacts
      prisma.contact.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, firstName: true, lastName: true, title: true, email: true, accountId: true },
        include: { account: { select: { name: true } } },
      }),

      // Search opportunities
      prisma.opportunity.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, name: true, stage: true, amount: true, currency: true, accountId: true },
        include: { account: { select: { name: true } } },
      }),

      // Search aircraft
      prisma.aircraft.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { tailNumber: { contains: query, mode: 'insensitive' } },
            { manufacturer: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, tailNumber: true, manufacturer: true, model: true, year: true },
      }),

      // Search tasks
      prisma.task.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, title: true, status: true, priority: true, dueDate: true },
      }),
    ]);

    // Format results
    const results: SearchResult[] = [
      ...accounts.map(a => ({
        id: a.id,
        type: 'Account',
        title: a.name,
        subtitle: `${a.type || 'Account'} ${a.email ? '• ' + a.email : ''}`,
        url: `/accounts/${a.id}`,
      })),
      ...contacts.map(c => ({
        id: c.id,
        type: 'Contact',
        title: `${c.firstName} ${c.lastName}`,
        subtitle: `${c.title || ''} ${c.account?.name ? '• ' + c.account.name : ''}`,
        url: `/contacts/${c.id}`,
      })),
      ...opportunities.map(o => ({
        id: o.id,
        type: 'Opportunity',
        title: o.name,
        subtitle: `${o.stage} • ${o.currency}${o.amount.toLocaleString()} ${o.account?.name ? '• ' + o.account.name : ''}`,
        url: `/opportunities/${o.id}`,
      })),
      ...aircraft.map(a => ({
        id: a.id,
        type: 'Aircraft',
        title: a.tailNumber,
        subtitle: `${a.manufacturer} ${a.model} ${a.year ? '(' + a.year + ')' : ''}`,
        url: `/aircraft/${a.id}`,
      })),
      ...tasks.map(t => ({
        id: t.id,
        type: 'Task',
        title: t.title,
        subtitle: `${t.status} • ${t.priority} ${t.dueDate ? '• Due ' + new Date(t.dueDate).toLocaleDateString() : ''}`,
        url: `/tasks/${t.id}`,
      })),
    ];

    return NextResponse.json({ results: results.slice(0, limit * 2) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
