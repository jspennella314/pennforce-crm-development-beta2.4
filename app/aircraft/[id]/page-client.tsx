'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentList from '../../components/DocumentList';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AircraftDetailClientPage() {
  const params = useParams();
  const aircraftId = params.id as string;

  const [aircraft, setAircraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    fetchAircraft();
  }, [aircraftId]);

  const fetchAircraft = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/aircraft/${aircraftId}`);
      if (!response.ok) {
        throw new Error('Aircraft not found');
      }
      const data = await response.json();
      setAircraft(data);
    } catch (error) {
      console.error('Error fetching aircraft:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading aircraft...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!aircraft) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Aircraft not found</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const openWorkOrders = aircraft.workOrders?.filter((wo: any) =>
    wo.status !== 'COMPLETED' && wo.status !== 'CANCELED'
  ) || [];
  const completedWorkOrders = aircraft.workOrders?.filter((wo: any) =>
    wo.status === 'COMPLETED' || wo.status === 'CANCELED'
  ) || [];

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/aircraft" className="hover:text-gray-900">Aircraft</Link>
            <span>→</span>
            <span>{aircraft.tailNumber}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {aircraft.make} {aircraft.model}
              </h1>
              <p className="text-lg text-gray-600 mt-2">{aircraft.tailNumber}</p>
            </div>
            <div className={`
              px-4 py-2 rounded-full text-sm font-medium
              ${aircraft.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                aircraft.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800' :
                aircraft.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {aircraft.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Aircraft Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Aircraft Information</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Make</label>
                  <div className="mt-1 text-gray-900">{aircraft.make}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <div className="mt-1 text-gray-900">{aircraft.model}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tail Number</label>
                  <div className="mt-1 text-gray-900 font-medium">{aircraft.tailNumber}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Serial Number</label>
                  <div className="mt-1 text-gray-900">{aircraft.serialNumber || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Year</label>
                  <div className="mt-1 text-gray-900">{aircraft.year || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${aircraft.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        aircraft.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800' :
                        aircraft.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {aircraft.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Account</label>
                  <div className="mt-1">
                    {aircraft.ownerAccount ? (
                      <Link
                        href={`/accounts/${aircraft.ownerAccount.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {aircraft.ownerAccount.name}
                      </Link>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Operator Account</label>
                  <div className="mt-1">
                    {aircraft.operatorAccount ? (
                      <Link
                        href={`/accounts/${aircraft.operatorAccount.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {aircraft.operatorAccount.name}
                      </Link>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="mt-1 text-gray-900">{aircraft.locationIcao || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Time</label>
                  <div className="mt-1 text-gray-900">
                    {aircraft.totalTimeHrs ? `${aircraft.totalTimeHrs} hrs` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunities */}
            {aircraft.opportunities && aircraft.opportunities.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Opportunities ({aircraft.opportunities.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {aircraft.opportunities.map((opp: any) => (
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
                </div>
              </div>
            )}

            {/* Work Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Work Orders ({aircraft.workOrders?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {openWorkOrders.length > 0 && (
                  <>
                    <div className="bg-gray-50 px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-700">Open ({openWorkOrders.length})</h3>
                    </div>
                    {openWorkOrders.map((wo: any) => (
                      <div key={wo.id} className="p-4 hover:bg-gray-50">
                        <div className="font-medium text-gray-900">{wo.title}</div>
                        {wo.description && (
                          <div className="text-sm text-gray-600 mt-1">{wo.description}</div>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </div>
                        <div className={`
                          inline-block px-2 py-1 rounded text-xs font-medium mt-2
                          ${wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {wo.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {completedWorkOrders.length > 0 && (
                  <>
                    <div className="bg-gray-50 px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-700">Completed ({completedWorkOrders.length})</h3>
                    </div>
                    {completedWorkOrders.slice(0, 5).map((wo: any) => (
                      <div key={wo.id} className="p-4 hover:bg-gray-50 opacity-75">
                        <div className="font-medium text-gray-900 line-through">{wo.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {(!aircraft.workOrders || aircraft.workOrders.length === 0) && (
                  <div className="p-8 text-center text-gray-500">No work orders yet</div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{aircraft.trips?.length || 0}</div>
                  <div className="text-sm text-gray-600">Total Trips</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{openWorkOrders.length}</div>
                  <div className="text-sm text-gray-600">Open Work Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{aircraft.opportunities?.length || 0}</div>
                  <div className="text-sm text-gray-600">Related Opportunities</div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {aircraft.activities?.slice(0, 10).map((activity: any) => (
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
                {(!aircraft.activities || aircraft.activities.length === 0) && (
                  <div className="text-center text-gray-500">No activity yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
