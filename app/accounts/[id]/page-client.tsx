'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import ActivityLogDialog from '../../components/ActivityLogDialog';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AccountDetailClientPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounts/${accountId}`);
      if (!response.ok) {
        throw new Error('Account not found');
      }
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Error fetching account:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading account...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!account) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Account not found</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/accounts" className="hover:text-gray-900">Accounts</Link>
            <span>→</span>
            <span>{account.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {account.type.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={() => setShowActivityDialog(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Log Activity
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <div className="mt-1 text-gray-900">{account.website || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="mt-1 text-gray-900">{account.phone || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 text-gray-900">{account.email || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Owner</label>
                  <div className="mt-1 text-gray-900">{account.owner?.name || '—'}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Billing Address</label>
                  <div className="mt-1 text-gray-900">{account.billingAddr || '—'}</div>
                </div>
                {account.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <div className="mt-1 text-gray-900">{account.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contacts ({account.contacts?.length || 0})
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {account.contacts?.map((contact: any) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.title && (
                          <div className="text-sm text-gray-600">{contact.title}</div>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          {contact.email && <div>{contact.email}</div>}
                          {contact.phone && <div>{contact.phone}</div>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {(!account.contacts || account.contacts.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No contacts yet</div>
                )}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Opportunities ({account.opportunities?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {account.opportunities?.map((opp: any) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{opp.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{opp.pipeline}</div>
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
                {(!account.opportunities || account.opportunities.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No opportunities yet</div>
                )}
              </div>
            </div>

            {/* Aircraft */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Aircraft ({account.aircraft?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {account.aircraft?.map((aircraft: any) => (
                  <Link
                    key={aircraft.id}
                    href={`/aircraft/${aircraft.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {aircraft.make} {aircraft.model}
                        </div>
                        <div className="text-sm text-gray-600">{aircraft.tailNumber}</div>
                      </div>
                      <div className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${aircraft.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          aircraft.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {aircraft.status.replace('_', ' ')}
                      </div>
                    </div>
                  </Link>
                ))}
                {(!account.aircraft || account.aircraft.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No aircraft yet</div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
              </div>
              <div className="p-6 space-y-6">
                <DocumentUpload
                  relatedTo={{
                    type: 'account',
                    id: account.id,
                  }}
                  organizationId={account.organizationId}
                  onSuccess={() => setDocumentRefresh(prev => prev + 1)}
                />
                <DocumentList
                  relatedTo={{
                    type: 'account',
                    id: account.id,
                  }}
                  refreshTrigger={documentRefresh}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {account.activities?.slice(0, 10).map((activity: any) => (
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
                      <div className="text-sm text-gray-600 mt-1">{activity.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.loggedAt).toLocaleString()} • {activity.user?.name}
                      </div>
                    </div>
                  </div>
                ))}
                {(!account.activities || account.activities.length === 0) && (
                  <div className="text-center text-gray-500">No activity yet</div>
                )}
              </div>
            </div>

            {/* Open Tasks */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Open Tasks</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {account.tasks?.map((task: any) => (
                  <div key={task.id} className="p-4">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className={`
                      inline-block px-2 py-1 rounded text-xs font-medium mt-2
                      ${task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
                {(!account.tasks || account.tasks.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No open tasks</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log Dialog */}
        <ActivityLogDialog
          isOpen={showActivityDialog}
          onClose={() => setShowActivityDialog(false)}
          relatedTo={{
            type: 'account',
            id: account.id,
            name: account.name,
          }}
          onSuccess={fetchAccount}
        />
      </div>
    </AppLayout>
  );
}
