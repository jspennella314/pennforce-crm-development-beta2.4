'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import RecordHeader, { RecordHeaderButton } from '../../components/records/RecordHeader';
import RecordTabs from '../../components/records/RecordTabs';
import ActivityPanel from '../../components/activity/ActivityPanel';
import ActivityLogDialog from '../../components/ActivityLogDialog';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import LoadingSkeleton from '../../components/list/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import { Building2, Mail, Phone, Globe, Users, Target, Plane } from 'lucide-react';

export default function AccountDetailClientPage() {
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    fetchAccount();
  }, [accountId]);

  const fetchAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/accounts/${accountId}`);
      if (!response.ok) {
        throw new Error('Account not found');
      }
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Error fetching account:', error);
      setError(error instanceof Error ? error.message : 'Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Account"
          message={error}
          onRetry={fetchAccount}
        />
      </AppLayout>
    );
  }

  if (loading || !account) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-auto bg-[#f3f3f3]">
          <LoadingSkeleton type="detail" />
        </div>
      </AppLayout>
    );
  }

  const chips = [
    { label: 'Type', value: account.type?.replace('_', ' ') || '—' },
    { label: 'Phone', value: account.phone || '—' },
    { label: 'Website', value: account.website || '—' },
  ];

  const detailsContent = (
    <div className="p-6">
      <div className="max-w-4xl space-y-6">
        {/* Account Information Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Account Information</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Name</label>
              <div className="text-sm text-gray-900 mt-1.5 font-medium">{account.name}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Owner</label>
              <div className="text-sm text-gray-900 mt-1.5">{account.owner?.name || '—'}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Phone</label>
              <div className="text-sm mt-1.5">
                {account.phone ? (
                  <a href={`tel:${account.phone}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {account.phone}
                  </a>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email</label>
              <div className="text-sm mt-1.5">
                {account.email ? (
                  <a href={`mailto:${account.email}`} className="text-[#0176d3] hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {account.email}
                  </a>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Website</label>
              <div className="text-sm mt-1.5">
                {account.website ? (
                  <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-[#0176d3] hover:underline flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {account.website}
                  </a>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Type</label>
              <div className="text-sm text-gray-900 mt-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all duration-150 hover:scale-105 cursor-default">
                  {account.type?.replace('_', ' ') || '—'}
                </span>
              </div>
            </div>

            {account.billingAddr && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Billing Address</label>
                <div className="text-sm text-gray-900 mt-1.5 leading-relaxed">{account.billingAddr}</div>
              </div>
            )}

            {account.shippingAddr && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Shipping Address</label>
                <div className="text-sm text-gray-900 mt-1.5 leading-relaxed">{account.shippingAddr}</div>
              </div>
            )}

            {account.notes && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Notes</label>
                <div className="text-sm text-gray-900 mt-1.5 whitespace-pre-wrap leading-relaxed">{account.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Documents</h3>
          </div>
          <div className="p-4 space-y-4">
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
    </div>
  );

  const relatedContent = (
    <div className="p-6">
      <div className="max-w-4xl space-y-6">
        {/* Contacts */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contacts ({account.contacts?.length || 0})
            </h3>
            <Link
              href={`/contacts/new?accountId=${account.id}`}
              className="text-xs text-[#0176d3] hover:underline font-medium"
            >
              New
            </Link>
          </div>
          <div>
            {account.contacts && account.contacts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {account.contacts.map((contact: any) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-[#0176d3] hover:underline">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.title && (
                          <div className="text-xs text-gray-600 mt-1">{contact.title}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {contact.email && <div>{contact.email}</div>}
                          {contact.phone && <div>{contact.phone}</div>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No contacts yet
              </div>
            )}
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Opportunities ({account.opportunities?.length || 0})
            </h3>
            <Link
              href={`/opportunities/new?accountId=${account.id}`}
              className="text-xs text-[#0176d3] hover:underline font-medium"
            >
              New
            </Link>
          </div>
          <div>
            {account.opportunities && account.opportunities.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {account.opportunities.map((opp: any) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#0176d3] hover:underline">
                          {opp.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{opp.pipeline}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                        </div>
                        <div className={`
                          inline-block px-2 py-0.5 rounded text-xs font-medium mt-1
                          transition-all duration-150 hover:scale-105 cursor-default
                          ${opp.stage === 'WON' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            opp.stage === 'LOST' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                            opp.stage === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                            opp.stage === 'PROPOSAL' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                            'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                        `}>
                          {opp.stage}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No opportunities yet
              </div>
            )}
          </div>
        </div>

        {/* Aircraft */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Aircraft ({account.aircraft?.length || 0})
            </h3>
            <Link
              href={`/aircraft/new?accountId=${account.id}`}
              className="text-xs text-[#0176d3] hover:underline font-medium"
            >
              New
            </Link>
          </div>
          <div>
            {account.aircraft && account.aircraft.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {account.aircraft.map((aircraft: any) => (
                  <Link
                    key={aircraft.id}
                    href={`/aircraft/${aircraft.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-[#0176d3] hover:underline">
                          {aircraft.make} {aircraft.model}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{aircraft.tailNumber}</div>
                      </div>
                      <div className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        transition-all duration-150 hover:scale-105 cursor-default
                        ${aircraft.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          aircraft.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                          aircraft.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                          'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                      `}>
                        {aircraft.status?.replace('_', ' ') || '—'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No aircraft yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const chatterContent = (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <div className="text-sm text-gray-500">Chatter feed coming soon...</div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'details', label: 'Details', content: detailsContent },
    { id: 'related', label: 'Related', content: relatedContent },
    { id: 'chatter', label: 'Chatter', content: chatterContent },
  ];

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Record Header */}
        <RecordHeader
          title={account.name}
          subtitle={account.type?.replace('_', ' ')}
          chips={chips}
          actions={
            <>
              <RecordHeaderButton onClick={() => setShowActivityDialog(true)}>
                Log Activity
              </RecordHeaderButton>
              <RecordHeaderButton onClick={() => {}}>
                Edit
              </RecordHeaderButton>
            </>
          }
        />

        {/* Two-Column Layout: Tabs on left, Activity on right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Record Tabs */}
          <div className="flex-1 overflow-hidden">
            <RecordTabs tabs={tabs} defaultTab="details" />
          </div>

          {/* Right: Activity Panel */}
          <div className="w-96 border-l border-gray-200 overflow-auto bg-[#f3f3f3] p-4">
            <ActivityPanel recordId={accountId} recordType="account" />
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
