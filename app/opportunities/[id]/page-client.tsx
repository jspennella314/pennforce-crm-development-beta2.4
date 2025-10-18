'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import ActivityLogDialog from '../../components/ActivityLogDialog';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import StagePath, { defaultOpportunityStages } from '../../components/opportunity/StagePath';
import RecordHeader, { RecordHeaderButton } from '../../components/records/RecordHeader';
import RecordTabs from '../../components/records/RecordTabs';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OpportunityDetailClientPage() {
  const params = useParams();
  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    fetchOpportunity();
  }, [opportunityId]);

  const fetchOpportunity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      if (!response.ok) {
        throw new Error('Opportunity not found');
      }
      const data = await response.json();
      setOpportunity(data);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading opportunity...</div>
        </div>
      </AppLayout>
    );
  }

  if (!opportunity) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Opportunity not found</div>
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
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Opportunity Information</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Account</label>
              <div className="text-sm mt-1">
                {opportunity.account ? (
                  <Link
                    href={`/accounts/${opportunity.account.id}`}
                    className="text-[#0176d3] hover:underline"
                  >
                    {opportunity.account.name}
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Contact</label>
              <div className="text-sm mt-1">
                {opportunity.contact ? (
                  <Link
                    href={`/contacts/${opportunity.contact.id}`}
                    className="text-[#0176d3] hover:underline"
                  >
                    {opportunity.contact.firstName} {opportunity.contact.lastName}
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Aircraft</label>
              <div className="text-sm mt-1">
                {opportunity.aircraft ? (
                  <Link
                    href={`/aircraft/${opportunity.aircraft.id}`}
                    className="text-[#0176d3] hover:underline"
                  >
                    {opportunity.aircraft.make} {opportunity.aircraft.model} ({opportunity.aircraft.tailNumber})
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Amount</label>
              <div className="text-sm text-gray-900 font-semibold mt-1">
                ${parseFloat(opportunity.amount).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Probability</label>
              <div className="text-sm text-gray-900 mt-1">{opportunity.probability}%</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Expected Close Date</label>
              <div className="text-sm text-gray-900 mt-1">
                {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : '—'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Pipeline</label>
              <div className="text-sm text-gray-900 mt-1">{opportunity.pipeline}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Opportunity Owner</label>
              <div className="text-sm text-gray-900 mt-1">{opportunity.owner?.name || '—'}</div>
            </div>

            {opportunity.notes && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Notes</label>
                <div className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{opportunity.notes}</div>
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

        {/* Documents Card */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
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
          title={opportunity.name}
          subtitle={opportunity.pipeline}
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

        {/* Stage Path */}
        {!isClosed && (
          <StagePath
            stages={defaultOpportunityStages}
            currentStage={opportunity.stage}
            onChange={handleStageChange}
          />
        )}

        {/* Record Tabs */}
        <div className="flex-1 overflow-hidden">
          <RecordTabs tabs={tabs} defaultTab="details" />
        </div>

        {/* Activity Log Dialog */}
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
      </div>
    </AppLayout>
  );
}
