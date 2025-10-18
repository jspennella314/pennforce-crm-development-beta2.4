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
import { Plane, Building2, Target, Wrench, MapPin, Clock } from 'lucide-react';

export default function AircraftDetailClientPage() {
  const params = useParams();
  const aircraftId = params.id as string;

  const [aircraft, setAircraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    fetchAircraft();
  }, [aircraftId]);

  const fetchAircraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/aircraft/${aircraftId}`);
      if (!response.ok) {
        throw new Error('Aircraft not found');
      }
      const data = await response.json();
      setAircraft(data);
    } catch (error) {
      console.error('Error fetching aircraft:', error);
      setError(error instanceof Error ? error.message : 'Failed to load aircraft');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <ErrorState
          title="Unable to Load Aircraft"
          message={error}
          onRetry={fetchAircraft}
        />
      </AppLayout>
    );
  }

  if (loading || !aircraft) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-auto bg-[#f3f3f3]">
          <LoadingSkeleton type="detail" />
        </div>
      </AppLayout>
    );
  }

  const openWorkOrders = aircraft.workOrders?.filter((wo: any) =>
    wo.status !== 'COMPLETED' && wo.status !== 'CANCELED'
  ) || [];

  const chips = [
    { label: 'Status', value: aircraft.status?.replace('_', ' ') || '—' },
    { label: 'Location', value: aircraft.locationIcao || '—' },
    { label: 'Total Time', value: aircraft.totalTimeHrs ? `${aircraft.totalTimeHrs} hrs` : '—' },
  ];

  const detailsContent = (
    <div className="p-6">
      <div className="max-w-4xl space-y-6">
        {/* Aircraft Information Card */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Aircraft Information</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Make</label>
              <div className="text-sm text-gray-900 mt-1 font-medium">{aircraft.make}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Model</label>
              <div className="text-sm text-gray-900 mt-1 font-medium">{aircraft.model}</div>
            </div>

            {aircraft.variant && (
              <div>
                <label className="text-xs font-medium text-gray-600">Variant</label>
                <div className="text-sm text-gray-900 mt-1">{aircraft.variant}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600">Tail Number</label>
              <div className="text-sm text-gray-900 mt-1 font-semibold">{aircraft.tailNumber}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Serial Number</label>
              <div className="text-sm text-gray-900 mt-1">{aircraft.serialNumber || '—'}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Year</label>
              <div className="text-sm text-gray-900 mt-1">{aircraft.year || '—'}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Status</label>
              <div className="text-sm mt-1">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${aircraft.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    aircraft.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800' :
                    aircraft.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {aircraft.status?.replace('_', ' ') || '—'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Location (ICAO)</label>
              <div className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {aircraft.locationIcao || '—'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Owner Account</label>
              <div className="text-sm mt-1">
                {aircraft.ownerAccount ? (
                  <Link
                    href={`/accounts/${aircraft.ownerAccount.id}`}
                    className="text-[#0176d3] hover:underline flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    {aircraft.ownerAccount.name}
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Operator Account</label>
              <div className="text-sm mt-1">
                {aircraft.operatorAccount ? (
                  <Link
                    href={`/accounts/${aircraft.operatorAccount.id}`}
                    className="text-[#0176d3] hover:underline flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    {aircraft.operatorAccount.name}
                  </Link>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Total Time</label>
              <div className="text-sm text-gray-900 mt-1 flex items-center gap-2 font-semibold">
                <Clock className="w-4 h-4" />
                {aircraft.totalTimeHrs ? `${aircraft.totalTimeHrs.toFixed(1)} hrs` : '—'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Cycles</label>
              <div className="text-sm text-gray-900 mt-1">{aircraft.totalCycles || '—'}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Quick Statistics</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{aircraft.trips?.length || 0}</div>
              <div className="text-xs text-gray-600 mt-1">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{openWorkOrders.length}</div>
              <div className="text-xs text-gray-600 mt-1">Open Work Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{aircraft.opportunities?.length || 0}</div>
              <div className="text-xs text-gray-600 mt-1">Opportunities</div>
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
                type: 'aircraft',
                id: aircraft.id,
              }}
              organizationId={aircraft.organizationId}
              onSuccess={() => setDocumentRefresh(prev => prev + 1)}
            />
            <DocumentList
              relatedTo={{
                type: 'aircraft',
                id: aircraft.id,
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
        {/* Opportunities */}
        {aircraft.opportunities && aircraft.opportunities.length > 0 && (
          <div className="bg-white rounded border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Opportunities ({aircraft.opportunities.length})
              </h3>
              <Link
                href={`/opportunities/new?aircraftId=${aircraft.id}`}
                className="text-xs text-[#0176d3] hover:underline font-medium"
              >
                New
              </Link>
            </div>
            <div>
              <div className="divide-y divide-gray-200">
                {aircraft.opportunities.map((opp: any) => (
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
                          ${opp.stage === 'WON' ? 'bg-green-100 text-green-800' :
                            opp.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                            opp.stage === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800' :
                            opp.stage === 'PROPOSAL' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'}
                        `}>
                          {opp.stage}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Work Orders */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Work Orders ({aircraft.workOrders?.length || 0})
            </h3>
            <button className="text-xs text-[#0176d3] hover:underline font-medium">
              New
            </button>
          </div>
          <div>
            {aircraft.workOrders && aircraft.workOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {openWorkOrders.length > 0 && (
                  <>
                    <div className="bg-gray-50 px-4 py-2">
                      <h4 className="text-xs font-semibold text-gray-700">Open ({openWorkOrders.length})</h4>
                    </div>
                    {openWorkOrders.map((wo: any) => (
                      <div key={wo.id} className="p-4 hover:bg-gray-50">
                        <div className="text-sm font-medium text-gray-900">{wo.title}</div>
                        {wo.description && (
                          <div className="text-xs text-gray-600 mt-1">{wo.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`
                            inline-block px-2 py-0.5 rounded text-xs font-medium
                            ${wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                          `}>
                            {wo.status?.replace('_', ' ')}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(wo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {aircraft.workOrders.filter((wo: any) => wo.status === 'COMPLETED' || wo.status === 'CANCELED').length > 0 && (
                  <>
                    <div className="bg-gray-50 px-4 py-2">
                      <h4 className="text-xs font-semibold text-gray-700">
                        Completed ({aircraft.workOrders.filter((wo: any) => wo.status === 'COMPLETED' || wo.status === 'CANCELED').length})
                      </h4>
                    </div>
                    {aircraft.workOrders
                      .filter((wo: any) => wo.status === 'COMPLETED' || wo.status === 'CANCELED')
                      .slice(0, 5)
                      .map((wo: any) => (
                        <div key={wo.id} className="p-4 hover:bg-gray-50 opacity-60">
                          <div className="text-sm font-medium text-gray-900">{wo.title}</div>
                          <span className="text-xs text-gray-500">
                            {new Date(wo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No work orders yet
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
          title={`${aircraft.make} ${aircraft.model}`}
          subtitle={aircraft.tailNumber}
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
            <ActivityPanel recordId={aircraftId} recordType="aircraft" />
          </div>
        </div>

        {/* Activity Log Dialog */}
        <ActivityLogDialog
          isOpen={showActivityDialog}
          onClose={() => setShowActivityDialog(false)}
          relatedTo={{
            type: 'aircraft',
            id: aircraft.id,
            name: `${aircraft.make} ${aircraft.model} (${aircraft.tailNumber})`,
          }}
          onSuccess={fetchAircraft}
        />
      </div>
    </AppLayout>
  );
}
