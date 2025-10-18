'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplitView from '../components/list/SplitView';
import ListViewToolbar from '../components/list/ListViewToolbar';
import LoadingSkeleton from '../components/list/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { Target, Building2, Plane, DollarSign, Calendar } from 'lucide-react';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/opportunities');
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      const data = await response.json();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError(error instanceof Error ? error.message : 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const listViews = [
    { id: 'all', name: 'All Opportunities', isPinned: true, isDefault: true },
    { id: 'recent', name: 'Recently Viewed', isPinned: true },
    { id: 'my', name: 'My Opportunities', isPinned: false },
    { id: 'open', name: 'Open Opportunities', isPinned: false },
    { id: 'closing_soon', name: 'Closing This Month', isPinned: false },
    { id: 'won', name: 'Won', isPinned: false },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Opportunity Name',
      render: (value: any, record: any) => (
        <div>
          <Link href={`/opportunities/${record.id}`} className="text-[#0176d3] hover:underline font-medium">
            {record.name}
          </Link>
          {record.aircraft && (
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Plane className="w-3 h-3" />
              {record.aircraft.make} {record.aircraft.model}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'account',
      label: 'Account',
      render: (value: any) =>
        value ? (
          <Link href={`/accounts/${value.id}`} className="text-[#0176d3] hover:underline">
            {value.name}
          </Link>
        ) : (
          '—'
        ),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (value: any) => (
        <span
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            transition-all duration-150 hover:scale-105 cursor-default
            ${value === 'WON' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              value === 'LOST' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
              value === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
              value === 'PROPOSAL' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
              'bg-blue-100 text-blue-800 hover:bg-blue-200'}
          `}
          role="status"
          aria-label={`Stage: ${value}`}
          title={`Opportunity Stage: ${value}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: any, record: any) => (
        <div>
          <span className="font-semibold">${(parseFloat(value) / 1000000).toFixed(1)}M</span>
          {record.probability && (
            <span className="text-xs text-gray-500 ml-1">({record.probability}%)</span>
          )}
        </div>
      ),
    },
    {
      key: 'closeDate',
      label: 'Close Date',
      render: (value: any) => value ? new Date(value).toLocaleDateString() : '—',
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (value: any) => value?.name || '—',
    },
  ];

  const detailPanel = (record: any) => (
    <div className="space-y-6">
      {/* Opportunity Info Card */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Opportunity Information</h4>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Opportunity Name</label>
            <div className="text-sm text-gray-900 mt-1.5 font-medium">{record.name}</div>
          </div>
          {record.account && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account</label>
              <div className="text-sm mt-1.5">
                <Link href={`/accounts/${record.account.id}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {record.account.name}
                </Link>
              </div>
            </div>
          )}
          {record.aircraft && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Aircraft</label>
              <div className="text-sm mt-1.5">
                <Link href={`/aircraft/${record.aircraft.id}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  {record.aircraft.make} {record.aircraft.model}
                </Link>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stage</label>
            <div className="text-sm mt-1.5">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                transition-all duration-150 hover:scale-105 cursor-default
                ${record.stage === 'WON' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                  record.stage === 'LOST' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                  record.stage === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                  record.stage === 'PROPOSAL' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                  'bg-blue-100 text-blue-800 hover:bg-blue-200'}
              `}>
                {record.stage}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Amount</label>
            <div className="text-sm text-gray-900 mt-1.5 font-semibold">
              ${parseFloat(record.amount).toLocaleString()}
            </div>
          </div>
          {record.probability && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Probability</label>
              <div className="text-sm text-gray-900 mt-1.5">{record.probability}%</div>
            </div>
          )}
          {record.closeDate && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Close Date</label>
              <div className="text-sm text-gray-900 mt-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(record.closeDate).toLocaleDateString()}
              </div>
            </div>
          )}
          {record.pipeline && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pipeline</label>
              <div className="text-sm text-gray-900 mt-1.5">{record.pipeline}</div>
            </div>
          )}
          {record.owner && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Owner</label>
              <div className="text-sm text-gray-900 mt-1.5">{record.owner.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Key Metrics</h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span>Weighted Amount</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${((parseFloat(record.amount) * (record.probability || 0) / 100) / 1000000).toFixed(2)}M
            </span>
          </div>
          {record.closeDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Days to Close</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {Math.ceil((new Date(record.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Actions</h4>
        </div>
        <div className="p-4 space-y-2">
          <Link
            href={`/opportunities/${record.id}`}
            className="block w-full px-3 py-2 text-sm text-center bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors"
          >
            View Full Details
          </Link>
          <Link
            href={`/opportunities/${record.id}/edit`}
            className="block w-full px-3 py-2 text-sm text-center bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Edit Opportunity
          </Link>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Opportunities"
          message={error}
          onRetry={fetchOpportunities}
        />
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          {/* Page Header */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
                <p className="text-sm text-gray-600 mt-1">Loading...</p>
              </div>
            </div>
          </div>

          {/* List View Toolbar Skeleton */}
          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Loading Skeleton */}
          <div className="flex-1 overflow-hidden">
            <LoadingSkeleton rows={10} type="list" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
              <p className="text-sm text-gray-600 mt-1">{opportunities.length} total opportunities</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/opportunities/kanban"
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Kanban View
              </Link>
              <Link
                href="/opportunities/new"
                className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
              >
                New Opportunity
              </Link>
            </div>
          </div>
        </div>

        {/* List View Toolbar */}
        <ListViewToolbar
          views={listViews}
          currentView={currentView}
          onViewChange={setCurrentView}
          onRefresh={fetchOpportunities}
          totalRecords={opportunities.length}
        />

        {/* Split View */}
        <div className="flex-1 overflow-hidden">
          <SplitView
            columns={columns}
            data={opportunities}
            onSelectionChange={setSelectedIds}
            detailPanel={detailPanel}
            emptyMessage="No opportunities found"
          />
        </div>
      </div>
    </AppLayout>
  );
}
