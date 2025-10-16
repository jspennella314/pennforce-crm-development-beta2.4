'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardClientPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Hardcode organization ID for now - in production, get from auth context
      const response = await fetch('/api/dashboard?organizationId=placeholder');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading dashboard...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Failed to load dashboard</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { metrics, charts, recentItems } = dashboardData;

  const stats = [
    {
      name: 'Pipeline Value',
      value: `$${(metrics.totalPipelineValue / 1000000).toFixed(1)}M`,
      icon: '💼',
      color: 'bg-purple-500',
      subtext: `${metrics.openOpportunities} open`,
      link: '/opportunities',
    },
    {
      name: 'Won Revenue',
      value: `$${(metrics.wonValue / 1000000).toFixed(1)}M`,
      icon: '🎯',
      color: 'bg-green-500',
      subtext: `${metrics.wonOpportunities} won`,
      link: '/opportunities',
    },
    {
      name: 'Win Rate',
      value: `${metrics.winRate}%`,
      icon: '📊',
      color: 'bg-blue-500',
      subtext: 'Close rate',
      link: '/reports',
    },
    {
      name: 'Open Tasks',
      value: metrics.openTasks,
      icon: '✓',
      color: 'bg-orange-500',
      subtext: `${metrics.overdueTasks} overdue`,
      link: '/tasks',
    },
  ];

  const secondaryStats = [
    { name: 'Total Accounts', value: metrics.totalAccounts, link: '/accounts' },
    { name: 'Total Contacts', value: metrics.totalContacts, link: '/contacts' },
    { name: 'Total Aircraft', value: metrics.totalAircraft, link: '/aircraft' },
    { name: 'Task Completion', value: `${metrics.taskCompletionRate}%`, link: '/tasks' },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.link}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-md`}>
                  {stat.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {secondaryStats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.link}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Opportunities Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Opportunity Trend (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.monthlyOpportunities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Count"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Value ($M)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Opportunities by Stage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Opportunities by Stage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts.opportunitiesByStage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, count }) => `${stage}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {charts.opportunitiesByStage.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Accounts by Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Accounts by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.accountsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Aircraft by Status */}
          {charts.aircraftByStatus.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Aircraft by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.aircraftByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Items and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Opportunities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Opportunities</h2>
                <Link href="/opportunities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentItems.opportunities.map((opp: any) => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="p-4 hover:bg-gray-50 block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{opp.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{opp.account?.name}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900">
                        ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                      </div>
                      <div className={`
                        inline-block px-2 py-1 rounded text-xs font-medium mt-1
                        ${opp.stage === 'WON' ? 'bg-green-100 text-green-800' :
                          opp.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                          opp.stage === 'NEGOTIATION' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {opp.stage}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Link href="/activities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentItems.activities.map((activity: any) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                      {activity.type === 'CALL' ? '📞' :
                       activity.type === 'EMAIL' ? '📧' :
                       activity.type === 'MEETING' ? '👥' : '📝'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.subject || activity.type}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(activity.loggedAt).toLocaleString()} • {activity.user?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/accounts/new"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">🏢</span>
              <span className="text-sm font-medium text-gray-900">New Account</span>
            </Link>
            <Link
              href="/opportunities/new"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">💼</span>
              <span className="text-sm font-medium text-gray-900">New Opportunity</span>
            </Link>
            <Link
              href="/aircraft/new"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">✈️</span>
              <span className="text-sm font-medium text-gray-900">Add Aircraft</span>
            </Link>
            <Link
              href="/contacts/new"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">👤</span>
              <span className="text-sm font-medium text-gray-900">New Contact</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
