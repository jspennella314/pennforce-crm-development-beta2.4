'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplitView from '../components/list/SplitView';
import ListViewToolbar from '../components/list/ListViewToolbar';
import LoadingSkeleton from '../components/list/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { DollarSign, Calendar, TrendingUp, User, Building2 } from 'lucide-react';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string }>({ type: 'bulk' });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async (id: string) => {
    setDeleteTarget({ type: 'single', id });
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ type: 'bulk' });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        // Single delete
        const response = await fetch(`/api/opportunities/${deleteTarget.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete opportunity');
        }

        setOpportunities(opportunities.filter(o => o.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'bulk') {
        // Bulk delete
        const deletePromises = selectedIds.map(async id => {
          const response = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
          return { id, response, data: await response.json() };
        });

        const results = await Promise.all(deletePromises);
        const failedDeletes = results.filter(r => !r.response.ok);

        if (failedDeletes.length > 0) {
          const errorMessages = failedDeletes.map(f => f.data.error).join('\n');
          throw new Error(`Failed to delete ${failedDeletes.length} opportunity(ies):\n${errorMessages}`);
        }

        setOpportunities(opportunities.filter(o => !selectedIds.includes(o.id)));
        setSelectedIds([]);
      }

      setShowDeleteModal(false);
      setDeleteTarget({ type: 'bulk' });
    } catch (error) {
      console.error('Error deleting opportunity(ies):', error);
      alert(error instanceof Error ? error.message : 'Failed to delete opportunity(ies). Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const listViews = [
    { id: 'all', name: 'All Opportunities', isPinned: true, isDefault: true },
    { id: 'recent', name: 'Recently Viewed', isPinned: true },
    { id: 'my', name: 'My Opportunities', isPinned: false },
    { id: 'open', name: 'Open Opportunities', isPinned: false },
    { id: 'won', name: 'Closed Won', isPinned: false },
    { id: 'lost', name: 'Closed Lost', isPinned: false },
  ];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'PROSPECT': 'bg-gray-100 text-gray-800',
      'QUALIFICATION': 'bg-gray-100 text-gray-800',
      'QUALIFY': 'bg-gray-100 text-gray-800',
      'PROPOSAL': 'bg-blue-100 text-blue-800',
      'NEGOTIATION': 'bg-purple-100 text-purple-800',
      'WON': 'bg-green-100 text-green-800',
      'LOST': 'bg-red-100 text-red-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'name',
      label: 'Opportunity Name',
      render: (value: any, record: any) => (
        <div>
          <Link href={`/opportunities/${record.id}`} className="text-[#0176d3] hover:underline font-medium">
            {record.name}
          </Link>
          {record.account && (
            <div className="text-xs text-gray-500">{record.account.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (value: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(value)}`}>
          {value ? value.replace('_', ' ') : '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: any) => value ? `$${Number(value).toLocaleString()}` : '—',
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
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Opportunity Information</h4>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Opportunity Name</label>
            <div className="text-sm text-gray-900 mt-1 font-medium">{record.name}</div>
          </div>
          {record.account && (
            <div>
              <label className="text-xs font-medium text-gray-600">Account</label>
              <div className="text-sm mt-1">
                <Link href={`/accounts/${record.account.id}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {record.account.name}
                </Link>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">Stage</label>
            <div className="text-sm mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(record.stage)}`}>
                {record.stage.replace('_', ' ')}
              </span>
            </div>
          </div>
          {record.amount && (
            <div>
              <label className="text-xs font-medium text-gray-600">Amount</label>
              <div className="text-sm mt-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900">
                  ${Number(record.amount).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          {record.closeDate && (
            <div>
              <label className="text-xs font-medium text-gray-600">Close Date</label>
              <div className="text-sm mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {new Date(record.closeDate).toLocaleDateString()}
              </div>
            </div>
          )}
          {record.probability !== null && record.probability !== undefined && (
            <div>
              <label className="text-xs font-medium text-gray-600">Probability</label>
              <div className="text-sm mt-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                {record.probability}%
              </div>
            </div>
          )}
          {record.owner && (
            <div>
              <label className="text-xs font-medium text-gray-600">Opportunity Owner</label>
              <div className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {record.owner.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Actions</h4>
        </div>
        <div className="p-4 space-y-2">
          <Link
            href={`/opportunities/${record.id}`}
            className="block w-full px-3 py-2 text-sm text-center bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors"
          >
            View Full Details
          </Link>
          <Link
            href={`/opportunities/kanban`}
            className="block w-full px-3 py-2 text-sm text-center bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            View on Kanban Board
          </Link>
          <button
            onClick={() => handleDelete(record.id)}
            className="block w-full px-3 py-2 text-sm text-center bg-white text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Delete Opportunity
          </button>
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
              <p className="text-sm text-gray-600 mt-1">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : `${opportunities.length} total opportunities`}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete {selectedIds.length} Opportunit{selectedIds.length !== 1 ? 'ies' : 'y'}
                </button>
              )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {deleteTarget.type === 'single' ? 'Delete Opportunity' : `Delete ${selectedIds.length} Opportunities`}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                {deleteTarget.type === 'single'
                  ? 'Are you sure you want to delete this opportunity? This action cannot be undone.'
                  : `Are you sure you want to delete ${selectedIds.length} opportunities? This action cannot be undone.`}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
