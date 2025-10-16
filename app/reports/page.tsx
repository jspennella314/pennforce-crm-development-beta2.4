'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    opportunities: [],
    accounts: [],
    activities: [],
    tasks: [],
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [oppsRes, accountsRes, activitiesRes, tasksRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/accounts'),
        fetch('/api/activities'),
        fetch('/api/tasks'),
      ]);

      const [opportunities, accounts, activities, tasks] = await Promise.all([
        oppsRes.json(),
        accountsRes.json(),
        activitiesRes.json(),
        tasksRes.json(),
      ]);

      setData({ opportunities, accounts, activities, tasks });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading reports...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Calculate metrics
  const totalOpportunityValue = data.opportunities.reduce((sum: number, opp: any) =>
    sum + parseFloat(opp.amount || 0), 0
  );

  const weightedPipelineValue = data.opportunities.reduce((sum: number, opp: any) =>
    sum + (parseFloat(opp.amount || 0) * (opp.probability || 0) / 100), 0
  );

  const wonOpportunities = data.opportunities.filter((opp: any) => opp.stage === 'WON');
  const lostOpportunities = data.opportunities.filter((opp: any) => opp.stage === 'LOST');
  const activeOpportunities = data.opportunities.filter((opp: any) =>
    opp.stage !== 'WON' && opp.stage !== 'LOST'
  );

  const winRate = (wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length || 1) * 100).toFixed(1);

  // Opportunities by stage
  const opportunitiesByStage = {
    QUALIFICATION: data.opportunities.filter((opp: any) => opp.stage === 'QUALIFICATION'),
    PROPOSAL: data.opportunities.filter((opp: any) => opp.stage === 'PROPOSAL'),
    NEGOTIATION: data.opportunities.filter((opp: any) => opp.stage === 'NEGOTIATION'),
    WON: wonOpportunities,
    LOST: lostOpportunities,
  };

  // Opportunities by pipeline
  const pipelines = ['Sales', 'Management', 'Charter', 'Maintenance'];
  const opportunitiesByPipeline = pipelines.map(pipeline => ({
    name: pipeline,
    opps: data.opportunities.filter((opp: any) => opp.pipeline === pipeline),
  }));

  // Activities by type
  const activityTypes = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK'];
  const activitiesByType = activityTypes.map(type => ({
    type,
    count: data.activities.filter((act: any) => act.type === type).length,
  }));

  // Top accounts by opportunity value
  const accountOpportunityValues = new Map<string, { account: any; value: number }>();
  data.opportunities.forEach((opp: any) => {
    if (opp.account) {
      const existing = accountOpportunityValues.get(opp.account.id) || { account: opp.account, value: 0 };
      existing.value += parseFloat(opp.amount || 0);
      accountOpportunityValues.set(opp.account.id, existing);
    }
  });
  const topAccounts = Array.from(accountOpportunityValues.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Task completion rate
  const completedTasks = data.tasks.filter((task: any) => task.status === 'DONE');
  const taskCompletionRate = (completedTasks.length / (data.tasks.length || 1) * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Business performance insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Pipeline Value</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${(totalOpportunityValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {data.opportunities.length} opportunities
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Weighted Pipeline</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${(weightedPipelineValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Probability-adjusted value
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Win Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {winRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {wonOpportunities.length} won, {lostOpportunities.length} lost
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Task Completion</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {taskCompletionRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {completedTasks.length} of {data.tasks.length} tasks
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Opportunities by Stage */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Opportunities by Stage</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(opportunitiesByStage).map(([stage, opps]: [string, any]) => {
                  const value = opps.reduce((sum: number, opp: any) => sum + parseFloat(opp.amount || 0), 0);
                  const percentage = (value / (totalOpportunityValue || 1) * 100).toFixed(1);

                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{stage}</span>
                        <span className="text-sm text-gray-600">
                          {opps.length} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stage === 'WON' ? 'bg-green-500' :
                            stage === 'LOST' ? 'bg-red-500' :
                            stage === 'NEGOTIATION' ? 'bg-purple-500' :
                            stage === 'PROPOSAL' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${(value / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Opportunities by Pipeline */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Opportunities by Pipeline</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {opportunitiesByPipeline.map(({ name, opps }) => {
                  const value = opps.reduce((sum: number, opp: any) => sum + parseFloat(opp.amount || 0), 0);
                  const percentage = (value / (totalOpportunityValue || 1) * 100).toFixed(1);

                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <span className="text-sm text-gray-600">
                          {opps.length} opps
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${(value / 1000000).toFixed(1)}M ({percentage}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Accounts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Accounts by Pipeline Value</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {topAccounts.map(({ account, value }, index) => (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="p-4 hover:bg-gray-50 block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                      <div>
                        <div className="font-medium text-gray-900">{account.name}</div>
                        <div className="text-sm text-gray-500">{account.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${(value / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {topAccounts.length === 0 && (
                <div className="p-8 text-center text-gray-500">No accounts with opportunities</div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Activity Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activitiesByType.map(({ type, count }) => {
                  const percentage = (count / (data.activities.length || 1) * 100).toFixed(1);
                  const icon =
                    type === 'CALL' ? '📞' :
                    type === 'EMAIL' ? '📧' :
                    type === 'MEETING' ? '👥' :
                    type === 'NOTE' ? '📝' : '✓';

                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icon}</span>
                          <span className="text-sm font-medium text-gray-700">{type}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Activities</span>
                  <span className="text-2xl font-bold text-gray-900">{data.activities.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
