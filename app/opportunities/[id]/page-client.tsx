'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import ActivityLogDialog from '../../components/ActivityLogDialog';
import ActivityPanel from '../../components/activity/ActivityPanel';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import StagePath, { defaultOpportunityStages } from '../../components/opportunity/StagePath';
import RecordHeader, { RecordHeaderButton } from '../../components/records/RecordHeader';
import RecordTabs from '../../components/records/RecordTabs';
import LoadingSkeleton from '../../components/list/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Target, Building2, User, Plane, Calendar, DollarSign, TrendingUp, Mail, Phone } from 'lucide-react';

export default function OpportunityDetailClientPage() {
  const params = useParams();
  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] = useState<any>(null);
  const [relatedContacts, setRelatedContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    fetchOpportunity();
  }, [opportunityId]);

  const fetchOpportunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      if (!response.ok) {
        throw new Error('Opportunity not found');
      }
      const data = await response.json();
      setOpportunity(data);

      // Fetch related contacts from the account
      if (data.accountId) {
        const contactsResponse = await fetch(`/api/contacts?accountId=${data.accountId}`);
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setRelatedContacts(contactsData);
        }
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      setError(error instanceof Error ? error.message : 'Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stage');
      }

      await fetchOpportunity();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Opportunity"
          message={error}
          onRetry={fetchOpportunity}
        />
      </AppLayout>
    );
  }

  if (loading || !opportunity) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-auto bg-[#f3f3f3]">
          <LoadingSkeleton type="detail" />
        </div>
      </AppLayout>
    );
  }

  const isClosed = opportunity.stage === 'CLOSED_WON' || opportunity.stage === 'CLOSED_LOST';

  const chips = [
    { label: 'Amount', value: `$${(parseFloat(opportunity.amount) / 1000000).toFixed(1)}M` },
    { label: 'Probability', value: `${opportunity.probability}%` },
    { label: 'Close Date', value: opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : '—' },
  ];

  const detailsContent = (
    <div className="p-6">
      <div className="max-w-4xl space-y-6">
        {/* Opportunity Details Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Opportunity Information</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Opportunity Name</label>
              <div className="text-sm text-gray-900 mt-1.5 font-medium">{opportunity.name}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Opportunity Owner</label>
              <div className="text-sm text-gray-900 mt-1.5">{opportunity.owner?.name || '—'}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Account Name</label>
              <div className="text-sm mt-1.5">
                {opportunity.account ? (
                  <Link
                    href={`/accounts/${opportunity.account.id}`}
                    className="text-[#0176d3] hover:underline flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    {opportunity.account.name}
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Primary Contact</label>
              <div className="text-sm mt-1.5">
                {opportunity.contact ? (
                  <Link
                    href={`/contacts/${opportunity.contact.id}`}
                    className="text-[#0176d3] hover:underline flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {opportunity.contact.firstName} {opportunity.contact.lastName}
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Amount</label>
              <div className="text-sm text-gray-900 mt-1.5 font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                ${parseFloat(opportunity.amount).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Close Date</label>
              <div className="text-sm text-gray-900 mt-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : '—'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stage</label>
              <div className="text-sm text-gray-900 mt-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all duration-150 hover:scale-105 cursor-default">
                  {opportunity.stage?.replace('_', ' ') || '—'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Probability</label>
              <div className="text-sm text-gray-900 mt-1.5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {opportunity.probability}%
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pipeline</label>
              <div className="text-sm text-gray-900 mt-1.5">{opportunity.pipeline}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Source</label>
              <div className="text-sm text-gray-900 mt-1.5">{opportunity.source || '—'}</div>
            </div>

            {opportunity.aircraft && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Aircraft</label>
                <div className="text-sm mt-1.5">
                  <Link
                    href={`/aircraft/${opportunity.aircraft.id}`}
                    className="text-[#0176d3] hover:underline flex items-center gap-2"
                  >
                    <Plane className="w-4 h-4" />
                    {opportunity.aircraft.make} {opportunity.aircraft.model} ({opportunity.aircraft.tailNumber})
                  </Link>
                </div>
              </div>
            )}

            {opportunity.description && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</label>
                <div className="text-sm text-gray-900 mt-1.5 leading-relaxed">{opportunity.description}</div>
              </div>
            )}

            {opportunity.nextStep && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Next Step</label>
                <div className="text-sm text-gray-900 mt-1.5 leading-relaxed">{opportunity.nextStep}</div>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics Card */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Key Metrics</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${(parseFloat(opportunity.amount) * opportunity.probability / 100 / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-600 mt-1">Weighted Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{opportunity.probability}%</div>
              <div className="text-xs text-gray-600 mt-1">Win Probability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {opportunity.closeDate ?
                  Math.ceil((new Date(opportunity.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : '—'}
              </div>
              <div className="text-xs text-gray-600 mt-1">Days to Close</div>
            </div>
          </div>
        </div>

        {/* Related Contacts */}
        {relatedContacts.length > 0 && (
          <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                <User className="w-4 h-4" />
                Related Contacts ({relatedContacts.length})
              </h3>
              <span className="text-xs text-gray-500">From {opportunity.account?.name}</span>
            </div>
            <div className="divide-y divide-gray-200">
              {relatedContacts.map((contact: any) => (
                <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="text-sm font-medium text-[#0176d3] hover:underline"
                      >
                        {contact.firstName} {contact.lastName}
                        {opportunity.contactId === contact.id && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Primary
                          </span>
                        )}
                      </Link>
                      <div className="mt-1 text-xs text-gray-600">{contact.title || 'No title'}</div>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-xs text-gray-600 hover:text-[#0176d3] flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-xs text-gray-600 hover:text-[#0176d3] flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Documents</h3>
          </div>
          <div className="p-4 space-y-4">
            <DocumentUpload
              relatedTo={{
                type: 'opportunity',
                id: opportunity.id,
              }}
              organizationId={opportunity.organizationId}
              onSuccess={() => setDocumentRefresh(prev => prev + 1)}
            />
            <DocumentList
              relatedTo={{
                type: 'opportunity',
                id: opportunity.id,
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
      <div className="max-w-4xl">
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Related Items</h3>
          </div>
          <div className="p-8 text-center text-sm text-gray-500">
            Related items coming soon...
          </div>
        </div>
      </div>
    </div>
  );

  const activityContent = (
    <div className="h-full">
      <ActivityPanel
        recordType="opportunity"
        recordId={opportunityId}
        recordName={opportunity.name}
      />
    </div>
  );

  const tabs = [
    { id: 'details', label: 'Details', content: detailsContent },
    { id: 'activity', label: 'Activity', content: activityContent },
    { id: 'related', label: 'Related', content: relatedContent },
  ];

  const headerButtons: RecordHeaderButton[] = [
    {
      label: 'Edit',
      href: `/opportunities/${opportunityId}/edit`,
      variant: 'primary',
    },
    {
      label: 'Log Activity',
      onClick: () => setShowActivityDialog(true),
      variant: 'secondary',
    },
  ];

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f3f3f3]">
        {/* Record Header */}
        <RecordHeader
          icon={Target}
          title={opportunity.name}
          subtitle={opportunity.account?.name}
          chips={chips}
          buttons={headerButtons}
        />

        {/* Stage Path */}
        {!isClosed && (
          <StagePath
            stages={defaultOpportunityStages}
            currentStage={opportunity.stage}
            onChange={handleStageChange}
          />
        )}

        {/* Record Tabs */}
        <RecordTabs tabs={tabs} defaultTab="details" />
      </div>

      {/* Activity Log Dialog */}
      {showActivityDialog && (
        <ActivityLogDialog
          isOpen={showActivityDialog}
          onClose={() => setShowActivityDialog(false)}
          relatedTo={{
            type: 'opportunity',
            id: opportunity.id,
            name: opportunity.name,
          }}
          onSuccess={fetchOpportunity}
        />
      )}
    </AppLayout>
  );
}
