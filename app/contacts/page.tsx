'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplitView from '../components/list/SplitView';
import ListViewToolbar from '../components/list/ListViewToolbar';
import LoadingSkeleton from '../components/list/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { Building2, Mail, Phone } from 'lucide-react';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string }>({ type: 'bulk' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const listViews = [
    { id: 'all', name: 'All Contacts', isPinned: true, isDefault: true },
    { id: 'recent', name: 'Recently Viewed', isPinned: true },
    { id: 'my', name: 'My Contacts', isPinned: false },
    { id: 'vip', name: 'VIP Contacts', isPinned: false },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: any, record: any) => (
        <Link href={`/contacts/${record.id}`} className="text-[#0176d3] hover:underline font-medium">
          {record.firstName} {record.lastName}
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (value: any) => value || '—',
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
      key: 'phone',
      label: 'Phone',
      render: (value: any) => value || '—',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: any) => value || '—',
    },
  ];

  const detailPanel = (record: any) => (
    <div className="space-y-6">
      {/* Contact Info Card */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <div className="text-sm text-gray-900 mt-1">
              {record.firstName} {record.lastName}
            </div>
          </div>
          {record.title && (
            <div>
              <label className="text-xs font-medium text-gray-600">Title</label>
              <div className="text-sm text-gray-900 mt-1">{record.title}</div>
            </div>
          )}
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Actions</h4>
        </div>
        <div className="p-4 space-y-2">
          <Link
            href={`/contacts/${record.id}`}
            className="block w-full px-3 py-2 text-sm text-center bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors"
          >
            View Full Details
          </Link>
          <Link
            href={`/contacts/${record.id}/edit`}
            className="block w-full px-3 py-2 text-sm text-center bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Edit Contact
          </Link>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Contacts"
          message={error}
          onRetry={fetchContacts}
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
                <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
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
              <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
              <p className="text-sm text-gray-600 mt-1">{contacts.length} total contacts</p>
            </div>
            <Link
              href="/contacts/new"
              className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
            >
              New Contact
            </Link>
          </div>
        </div>

        {/* List View Toolbar */}
        <ListViewToolbar
          views={listViews}
          currentView={currentView}
          onViewChange={setCurrentView}
          onRefresh={fetchContacts}
          totalRecords={contacts.length}
        />

        {/* Split View */}
        <div className="flex-1 overflow-hidden">
          <SplitView
            columns={columns}
            data={contacts}
            onSelectionChange={setSelectedIds}
            detailPanel={detailPanel}
            emptyMessage="No contacts found"
          />
        </div>
      </div>
    </AppLayout>
  );
}
