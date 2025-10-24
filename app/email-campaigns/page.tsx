'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledFor: string | null;
  sentAt: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  creator: {
    name: string | null;
  };
  mailingList: {
    name: string;
  } | null;
}

export default function EmailCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/email-campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      SENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/email-campaigns/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCampaigns();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
            <p className="text-sm text-gray-600 mt-1">Loading...</p>
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
              <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
              <p className="text-sm text-gray-600 mt-1">
                {campaigns.length} total campaigns
              </p>
            </div>
            <button
              onClick={() => router.push('/email-campaigns/new')}
              className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
            >
              Create Campaign
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Total Campaigns</div>
                <div className="text-2xl font-semibold text-gray-900 mt-2">{campaigns.length}</div>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Sent</div>
                <div className="text-2xl font-semibold text-green-600 mt-2">
                  {campaigns.filter((c) => c.status === 'SENT').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Scheduled</div>
                <div className="text-2xl font-semibold text-[#0176d3] mt-2">
                  {campaigns.filter((c) => c.status === 'SCHEDULED').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Draft</div>
                <div className="text-2xl font-semibold text-gray-600 mt-2">
                  {campaigns.filter((c) => c.status === 'DRAFT').length}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-2">
              {['all', 'DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-[#0176d3] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>

            {/* Campaigns List */}
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No campaigns yet' : `No ${filter} campaigns`}
                </h3>
                {filter === 'all' && (
                  <>
                    <p className="text-sm text-gray-500 mb-6">Get started by creating your first email campaign</p>
                    <button
                      onClick={() => router.push('/email-campaigns/new')}
                      className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
                    >
                      Create Your First Campaign
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{campaign.subject}</div>
                          {campaign.mailingList && (
                            <div className="text-xs text-gray-500 mt-1">
                              List: {campaign.mailingList.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{campaign.totalRecipients}</td>
                        <td className="px-6 py-4">
                          {campaign.status === 'SENT' && (
                            <div className="text-sm">
                              <div className="text-green-600 font-medium">
                                {campaign.sentCount} sent
                              </div>
                              {campaign.failedCount > 0 && (
                                <div className="text-red-600 font-medium">
                                  {campaign.failedCount} failed
                                </div>
                              )}
                            </div>
                          )}
                          {campaign.status === 'SCHEDULED' && campaign.scheduledFor && (
                            <div className="text-sm text-gray-600">
                              {new Date(campaign.scheduledFor).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {campaign.sentAt
                            ? new Date(campaign.sentAt).toLocaleDateString()
                            : new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => router.push(`/email-campaigns/${campaign.id}`)}
                              className="text-[#0176d3] hover:text-[#014486] text-sm font-medium"
                            >
                              View
                            </button>
                            {['DRAFT', 'FAILED', 'CANCELLED'].includes(campaign.status) && (
                              <button
                                onClick={() => handleDelete(campaign.id, campaign.name)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                  </tr>
                ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
