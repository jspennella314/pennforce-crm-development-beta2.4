'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import ActivityLogDialog from '../../components/ActivityLogDialog';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Define the stage progression path
const STAGE_PATH = [
  { stage: 'QUALIFICATION', label: 'Qualification', color: 'bg-gray-200' },
  { stage: 'PROPOSAL', label: 'Proposal', color: 'bg-blue-200' },
  { stage: 'NEGOTIATION', label: 'Negotiation', color: 'bg-purple-200' },
  { stage: 'WON', label: 'Won', color: 'bg-green-200' },
];

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

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading opportunity...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!opportunity) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Opportunity not found</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentStageIndex = STAGE_PATH.findIndex(s => s.stage === opportunity.stage);
  const isClosed = opportunity.stage === 'WON' || opportunity.stage === 'LOST';

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/opportunities" className="hover:text-gray-900">Opportunities</Link>
            <span>→</span>
            <span>{opportunity.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{opportunity.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{opportunity.pipeline}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowActivityDialog(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Log Activity
              </button>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${(parseFloat(opportunity.amount) / 1000000).toFixed(1)}M
                </div>
                <div className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium mt-2
                  ${opportunity.stage === 'WON' ? 'bg-green-100 text-green-800' :
                    opportunity.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                    opportunity.stage === 'NEGOTIATION' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {opportunity.stage}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Path Visualization */}
        {!isClosed && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stage Path</h2>
            <div className="flex items-center gap-2">
              {STAGE_PATH.map((pathStage, index) => {
                const isActive = index === currentStageIndex;
                const isCompleted = index < currentStageIndex;

                return (
                  <div key={pathStage.stage} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isCompleted ? 'bg-green-500 text-white' :
                          isActive ? 'bg-blue-500 text-white' :
                          'bg-gray-200 text-gray-500'}
                      `}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className={`
                        text-xs font-medium mt-2 text-center
                        ${isActive ? 'text-blue-600' : 'text-gray-600'}
                      `}>
                        {pathStage.label}
                      </div>
                    </div>
                    {index < STAGE_PATH.length - 1 && (
                      <div className={`
                        flex-1 h-1 mb-6
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunity Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Opportunity Information</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account</label>
                  <div className="mt-1">
                    {opportunity.account ? (
                      <Link
                        href={`/accounts/${opportunity.account.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {opportunity.account.name}
                      </Link>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <div className="mt-1">
                    {opportunity.contact ? (
                      <Link
                        href={`/contacts/${opportunity.contact.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {opportunity.contact.firstName} {opportunity.contact.lastName}
                      </Link>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Aircraft</label>
                  <div className="mt-1">
                    {opportunity.aircraft ? (
                      <Link
                        href={`/aircraft/${opportunity.aircraft.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {opportunity.aircraft.make} {opportunity.aircraft.model} ({opportunity.aircraft.tailNumber})
                      </Link>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <div className="mt-1 text-gray-900 font-semibold">
                    ${parseFloat(opportunity.amount).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Probability</label>
                  <div className="mt-1 text-gray-900">{opportunity.probability}%</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expected Close Date</label>
                  <div className="mt-1 text-gray-900">
                    {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pipeline</label>
                  <div className="mt-1 text-gray-900">{opportunity.pipeline}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stage</label>
                  <div className="mt-1">
                    <span className={`
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${opportunity.stage === 'WON' ? 'bg-green-100 text-green-800' :
                        opportunity.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                        opportunity.stage === 'NEGOTIATION' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {opportunity.stage}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Opportunity Owner</label>
                  <div className="mt-1 text-gray-900">{opportunity.owner?.name || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <div className="mt-1 text-gray-900">
                    {new Date(opportunity.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {opportunity.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap">{opportunity.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ${(parseFloat(opportunity.amount) * opportunity.probability / 100 / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Weighted Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{opportunity.probability}%</div>
                  <div className="text-sm text-gray-600 mt-1">Win Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {opportunity.closeDate ?
                      Math.ceil((new Date(opportunity.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : '—'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Days to Close</div>
                </div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {opportunity.activities?.slice(0, 10).map((activity: any) => (
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
                {(!opportunity.activities || opportunity.activities.length === 0) && (
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
                {opportunity.tasks?.map((task: any) => (
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
                {(!opportunity.tasks || opportunity.tasks.length === 0) && (
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
