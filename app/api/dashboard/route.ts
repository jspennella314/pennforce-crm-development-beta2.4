import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Fetch all data in parallel
    const [
      opportunities,
      accounts,
      contacts,
      aircraft,
      tasks,
      activities,
      recentOpportunities,
      recentAccounts,
      recentContacts,
    ] = await Promise.all([
      // All opportunities for metrics
      prisma.opportunity.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          stage: true,
          amount: true,
          probability: true,
          closeDate: true,
          createdAt: true,
        },
      }),

      // Account counts by type
      prisma.account.findMany({
        where: { organizationId },
        select: { id: true, type: true, createdAt: true },
      }),

      // Contact count
      prisma.contact.count({
        where: { organizationId },
      }),

      // Aircraft counts by status
      prisma.aircraft.findMany({
        where: { organizationId },
        select: { id: true, status: true, createdAt: true },
      }),

      // Task counts by status
      prisma.task.findMany({
        where: { organizationId },
        select: { id: true, status: true, dueDate: true },
      }),

      // Recent activities
      prisma.activity.findMany({
        where: { organizationId },
        orderBy: { loggedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
          account: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          opportunity: { select: { id: true, name: true } },
        },
      }),

      // Recent opportunities
      prisma.opportunity.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          account: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      }),

      // Recent accounts
      prisma.account.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
        },
      }),

      // Recent contacts
      prisma.contact.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          account: { select: { id: true, name: true } },
          createdAt: true,
        },
      }),
    ]);

    // Calculate opportunity metrics
    const totalPipelineValue = opportunities.reduce(
      (sum, opp) => sum + parseFloat(opp.amount?.toString() || '0'),
      0
    );

    const wonOpportunities = opportunities.filter(opp => opp.stage === 'WON');
    const lostOpportunities = opportunities.filter(opp => opp.stage === 'LOST');
    const openOpportunities = opportunities.filter(
      opp => opp.stage !== 'WON' && opp.stage !== 'LOST'
    );

    const wonValue = wonOpportunities.reduce(
      (sum, opp) => sum + parseFloat(opp.amount?.toString() || '0'),
      0
    );

    const winRate =
      wonOpportunities.length + lostOpportunities.length > 0
        ? (wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length)) * 100
        : 0;

    // Opportunities by stage
    const opportunitiesByStage = opportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Accounts by type
    const accountsByType = accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aircraft by status
    const aircraftByStatus = aircraft.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Task metrics
    const openTasks = tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
    const overdueTasks = tasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'CANCELED'
    );
    const completedTasks = tasks.filter(t => t.status === 'DONE');
    const taskCompletionRate =
      tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Monthly opportunity creation trend (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyOpportunities = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const count = opportunities.filter(opp => {
        const created = new Date(opp.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;

      const value = opportunities
        .filter(opp => {
          const created = new Date(opp.createdAt);
          return created >= monthStart && created <= monthEnd;
        })
        .reduce((sum, opp) => sum + parseFloat(opp.amount?.toString() || '0'), 0);

      monthlyOpportunities.push({
        month: monthName,
        count,
        value: Math.round(value / 1000000 * 10) / 10, // Millions, 1 decimal
      });
    }

    return NextResponse.json({
      metrics: {
        totalPipelineValue,
        wonValue,
        winRate: Math.round(winRate * 10) / 10,
        openOpportunities: openOpportunities.length,
        wonOpportunities: wonOpportunities.length,
        totalAccounts: accounts.length,
        totalContacts: contacts,
        totalAircraft: aircraft.length,
        openTasks: openTasks.length,
        overdueTasks: overdueTasks.length,
        taskCompletionRate: Math.round(taskCompletionRate * 10) / 10,
      },
      charts: {
        opportunitiesByStage: Object.entries(opportunitiesByStage).map(([stage, count]) => ({
          stage,
          count,
        })),
        accountsByType: Object.entries(accountsByType).map(([type, count]) => ({
          type: type.replace('_', ' '),
          count,
        })),
        aircraftByStatus: Object.entries(aircraftByStatus).map(([status, count]) => ({
          status: status.replace('_', ' '),
          count,
        })),
        monthlyOpportunities,
      },
      recentItems: {
        opportunities: recentOpportunities,
        accounts: recentAccounts,
        contacts: recentContacts,
        activities,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
