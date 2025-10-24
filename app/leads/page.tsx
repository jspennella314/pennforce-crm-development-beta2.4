'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SplitView from '../components/list/SplitView';
import ListViewToolbar from '../components/list/ListViewToolbar';
import LoadingSkeleton from '../components/list/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { Phone, Mail, Building2, User, UserCircle, Tag } from 'lucide-react';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string }>({ type: 'bulk' });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError(error instanceof Error ? error.message : 'Failed to load leads');
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

  const handleConvert = async (leadId: string) => {
    if (!confirm('Convert this lead to Account, Contact, and Opportunity?')) return;

    try {
      const formData = new FormData();
      formData.append('id', leadId);

      const { convertLead } = await import('./actions');
      const result = await convertLead(formData);

      if (result.ok) {
        alert(result.alreadyConverted
          ? 'Lead already converted!'
          : 'Lead converted successfully!');
        fetchLeads(); // Refresh the list
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead. Please try again.');
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        // Single delete
        const response = await fetch(`/api/leads/${deleteTarget.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete lead');
        }

        setLeads(leads.filter(l => l.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'bulk') {
        // Bulk delete
        const deletePromises = selectedIds.map(async id => {
          const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
          return { id, response, data: await response.json() };
        });

        const results = await Promise.all(deletePromises);
        const failedDeletes = results.filter(r => !r.response.ok);

        if (failedDeletes.length > 0) {
          const errorMessages = failedDeletes.map(f => f.data.error).join('\n');
          throw new Error(`Failed to delete ${failedDeletes.length} lead(s):\n${errorMessages}`);
        }

        setLeads(leads.filter(l => !selectedIds.includes(l.id)));
        setSelectedIds([]);
      }

      setShowDeleteModal(false);
      setDeleteTarget({ type: 'bulk' });
    } catch (error) {
      console.error('Error deleting lead(s):', error);
      alert(error instanceof Error ? error.message : 'Failed to delete lead(s). Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const listViews = [
    { id: 'all', name: 'All Leads', isPinned: true, isDefault: true },
    { id: 'new', name: 'New Leads', isPinned: true },
    { id: 'contacted', name: 'Contacted', isPinned: false },
    { id: 'qualified', name: 'Qualified', isPinned: false },
    { id: 'converted', name: 'Converted', isPinned: false },
    { id: 'unqualified', name: 'Unqualified', isPinned: false },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'NEW': 'bg-blue-100 text-blue-800',
      'CONTACTED': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'DISQUALIFIED': 'bg-gray-100 text-gray-800',
      'UNQUALIFIED': 'bg-gray-100 text-gray-800',
      'CONVERTED': 'bg-purple-100 text-purple-800',
      'LOST': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'name',
      label: 'Lead Name',
      render: (value: any, record: any) => (
        <div>
          <Link href={`/leads/${record.id}`} className="text-[#0176d3] hover:underline font-medium">
            {record.name}
          </Link>
          {record.company && (
            <div className="text-xs text-gray-500">{record.company}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
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
      key: 'source',
      label: 'Source',
      render: (value: any) => value || '—',
    },
  ];

  const detailPanel = (record: any) => (
    <div className="space-y-6">
      {/* Lead Info Card */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Lead Information</h4>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <div className="text-sm text-gray-900 mt-1 font-medium">{record.name}</div>
          </div>
          {(record.firstName || record.lastName) && (
            <div>
              <label className="text-xs font-medium text-gray-600">Full Name</label>
              <div className="text-sm text-gray-900 mt-1">
                {[record.firstName, record.lastName].filter(Boolean).join(' ')}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <div className="text-sm mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          {record.company && (
            <div>
              <label className="text-xs font-medium text-gray-600">Company</label>
              <div className="text-sm mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                {record.company}
              </div>
            </div>
          )}
          {record.title && (
            <div>
              <label className="text-xs font-medium text-gray-600">Title</label>
              <div className="text-sm text-gray-900 mt-1">{record.title}</div>
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
          {record.source && (
            <div>
              <label className="text-xs font-medium text-gray-600">Lead Source</label>
              <div className="text-sm mt-1 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                {record.source}
              </div>
            </div>
          )}
          {record.notes && (
            <div>
              <label className="text-xs font-medium text-gray-600">Notes</label>
              <div className="text-sm text-gray-900 mt-1">{record.notes}</div>
            </div>
          )}
          {record.owner && (
            <div>
              <label className="text-xs font-medium text-gray-600">Lead Owner</label>
              <div className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {record.owner.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marketing Context */}
      {(record.utmSource || record.utmMedium || record.utmCampaign) && (
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900">Marketing Attribution</h4>
          </div>
          <div className="p-4 space-y-3">
            {record.utmSource && (
              <div>
                <label className="text-xs font-medium text-gray-600">Source</label>
                <div className="text-sm text-gray-900 mt-1">{record.utmSource}</div>
              </div>
            )}
            {record.utmMedium && (
              <div>
                <label className="text-xs font-medium text-gray-600">Medium</label>
                <div className="text-sm text-gray-900 mt-1">{record.utmMedium}</div>
              </div>
            )}
            {record.utmCampaign && (
              <div>
                <label className="text-xs font-medium text-gray-600">Campaign</label>
                <div className="text-sm text-gray-900 mt-1">{record.utmCampaign}</div>
              </div>
            )}
            {record.funnelId && (
              <div>
                <label className="text-xs font-medium text-gray-600">Funnel ID</label>
                <div className="text-sm text-gray-900 mt-1 font-mono">{record.funnelId}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">Actions</h4>
        </div>
        <div className="p-4 space-y-2">
          <Link
            href={`/leads/${record.id}`}
            className="block w-full px-3 py-2 text-sm text-center bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors"
          >
            View Full Details
          </Link>
          {!record.convertedAt && (
            <button
              onClick={() => handleConvert(record.id)}
              className="block w-full px-3 py-2 text-sm text-center bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Convert → A/C/O
            </button>
          )}
          {record.convertedAt && (
            <div className="text-xs text-gray-500 text-center py-2">
              ✓ Already converted
            </div>
          )}
          <button
            onClick={() => handleDelete(record.id)}
            className="block w-full px-3 py-2 text-sm text-center bg-white text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Leads"
          message={error}
          onRetry={fetchLeads}
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
                <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
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
              <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
              <p className="text-sm text-gray-600 mt-1">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : `${leads.length} total leads`}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete {selectedIds.length} Lead{selectedIds.length !== 1 ? 's' : ''}
                </button>
              )}
              <Link
                href="/leads/new"
                className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
              >
                New Lead
              </Link>
            </div>
          </div>
        </div>

        {/* List View Toolbar */}
        <ListViewToolbar
          views={listViews}
          currentView={currentView}
          onViewChange={setCurrentView}
          onRefresh={fetchLeads}
          totalRecords={leads.length}
        />

        {/* Split View */}
        <div className="flex-1 overflow-hidden">
          <SplitView
            columns={columns}
            data={leads}
            onSelectionChange={setSelectedIds}
            detailPanel={detailPanel}
            emptyMessage="No leads found"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {deleteTarget.type === 'single' ? 'Delete Lead' : `Delete ${selectedIds.length} Leads`}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                {deleteTarget.type === 'single'
                  ? 'Are you sure you want to delete this lead? This action cannot be undone.'
                  : `Are you sure you want to delete ${selectedIds.length} leads? This action cannot be undone.`}
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
