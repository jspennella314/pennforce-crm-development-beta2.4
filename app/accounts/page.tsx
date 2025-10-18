'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplitView from '../components/list/SplitView';
import ListViewToolbar from '../components/list/ListViewToolbar';
import LoadingSkeleton from '../components/list/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { Building2, Mail, Phone, Globe, Target, Users, Plane } from 'lucide-react';

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string }>({ type: 'bulk' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const listViews = [
    { id: 'all', name: 'All Accounts', isPinned: true, isDefault: true },
    { id: 'recent', name: 'Recently Viewed', isPinned: true },
    { id: 'my', name: 'My Accounts', isPinned: false },
    { id: 'owners', name: 'Aircraft Owners', isPinned: false },
    { id: 'operators', name: 'Operators', isPinned: false },
    { id: 'vendors', name: 'Vendors', isPinned: false },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Account Name',
      render: (value: any, record: any) => (
        <div>
          <Link href={`/accounts/${record.id}`} className="text-[#0176d3] hover:underline font-medium">
            {record.name}
          </Link>
          {record.website && (
            <div className="text-xs text-gray-500">{record.website}</div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value ? value.replace('_', ' ') : '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: any) => value || '—',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: any) => value || '—',
    },
    {
      key: 'owner',
      label: 'Account Owner',
      render: (value: any) => value?.name || '—',
    },
  ];

  const detailPanel = (record: any) => (
    <div className="space-y-6">
      {/* Account Info Card */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Account Information</h4>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Account Name</label>
            <div className="text-sm text-gray-900 mt-1 font-medium">{record.name}</div>
          </div>
          {record.type && (
            <div>
              <label className="text-xs font-medium text-gray-600">Type</label>
              <div className="text-sm mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {record.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
          {record.phone && (
            <div>
              <label className="text-xs font-medium text-gray-600">Phone</label>
              <div className="text-sm mt-1">
                <a href={`tel:${record.phone}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {record.phone}
                </a>
              </div>
            </div>
          )}
          {record.email && (
            <div>
              <label className="text-xs font-medium text-gray-600">Email</label>
              <div className="text-sm mt-1">
                <a href={`mailto:${record.email}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {record.email}
                </a>
              </div>
            </div>
          )}
          {record.website && (
            <div>
              <label className="text-xs font-medium text-gray-600">Website</label>
              <div className="text-sm mt-1">
                <a href={record.website} target="_blank" rel="noopener noreferrer" className="text-[#0176d3] hover:underline flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {record.website}
                </a>
              </div>
            </div>
          )}
          {record.owner && (
            <div>
              <label className="text-xs font-medium text-gray-600">Account Owner</label>
              <div className="text-sm text-gray-900 mt-1">{record.owner.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Related Items Stats */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Related Items</h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4" />
              <span>Contacts</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{record._count?.contacts || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Target className="w-4 h-4" />
              <span>Opportunities</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{record._count?.opportunities || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Plane className="w-4 h-4" />
              <span>Aircraft</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{record._count?.aircraft || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Actions</h4>
        </div>
        <div className="p-4 space-y-2">
          <Link
            href={`/accounts/${record.id}`}
            className="block w-full px-3 py-2 text-sm text-center bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors"
          >
            View Full Details
          </Link>
          <Link
            href={`/accounts/${record.id}/edit`}
            className="block w-full px-3 py-2 text-sm text-center bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Edit Account
          </Link>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Accounts"
          message={error}
          onRetry={fetchAccounts}
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
                <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
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
              <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
              <p className="text-sm text-gray-600 mt-1">{accounts.length} total accounts</p>
            </div>
            <Link
              href="/accounts/new"
              className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
            >
              New Account
            </Link>
          </div>
        </div>

        {/* List View Toolbar */}
        <ListViewToolbar
          views={listViews}
          currentView={currentView}
          onViewChange={setCurrentView}
          onRefresh={fetchAccounts}
          totalRecords={accounts.length}
        />

        {/* Split View */}
        <div className="flex-1 overflow-hidden">
          <SplitView
            columns={columns}
            data={accounts}
            onSelectionChange={setSelectedIds}
            detailPanel={detailPanel}
            emptyMessage="No accounts found"
          />
        </div>
      </div>
    </AppLayout>
  );
}
