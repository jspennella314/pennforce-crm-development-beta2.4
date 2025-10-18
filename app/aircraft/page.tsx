'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import ListViewToolbar from '../components/list/ListViewToolbar';
import LoadingSkeleton from '../components/list/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('all');

  useEffect(() => {
    fetchAircraft();
  }, []);

  const fetchAircraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/aircraft');
      if (!response.ok) {
        throw new Error('Failed to fetch aircraft');
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

  const listViews = [
    { id: 'all', name: 'All Aircraft', isPinned: true, isDefault: true },
    { id: 'recent', name: 'Recently Viewed', isPinned: true },
    { id: 'active', name: 'Active Aircraft', isPinned: false },
    { id: 'for_sale', name: 'For Sale', isPinned: false },
    { id: 'maintenance', name: 'In Maintenance', isPinned: false },
  ];

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          {/* Page Header */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Aircraft</h1>
                <p className="text-sm text-gray-600 mt-1">Loading...</p>
              </div>
            </div>
          </div>

          {/* List View Toolbar Skeleton */}
          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Loading Skeleton - Grid layout */}
          <div className="flex-1 overflow-auto bg-[#f3f3f3]">
            <LoadingSkeleton rows={9} type="grid" />
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
              <h1 className="text-2xl font-semibold text-gray-900">Aircraft</h1>
              <p className="text-sm text-gray-600 mt-1">{aircraft.length} total aircraft</p>
            </div>
            <Link
              href="/aircraft/new"
              className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
            >
              New Aircraft
            </Link>
          </div>
        </div>

        {/* List View Toolbar */}
        <ListViewToolbar
          views={listViews}
          currentView={currentView}
          onViewChange={setCurrentView}
          onRefresh={fetchAircraft}
          totalRecords={aircraft.length}
        />

        {/* Aircraft Grid */}
        <div className="flex-1 overflow-auto bg-[#f3f3f3]">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aircraft.map((ac) => (
                <Link
                  key={ac.id}
                  href={`/aircraft/${ac.id}`}
                  className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {ac.make} {ac.model}
                        </h3>
                        {ac.variant && (
                          <div className="text-sm text-gray-600">{ac.variant}</div>
                        )}
                      </div>
                      <div
                        className={`
                          px-2 py-1 rounded text-xs font-medium
                          transition-all duration-150 hover:scale-105 cursor-default
                          ${ac.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            ac.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                            ac.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                            'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                        `}
                        role="status"
                        aria-label={`Status: ${ac.status.replace('_', ' ')}`}
                        title={`Aircraft Status: ${ac.status.replace('_', ' ')}`}
                      >
                        {ac.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tail Number</span>
                        <span className="font-medium text-gray-900">{ac.tailNumber || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Year</span>
                        <span className="font-medium text-gray-900">{ac.year || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Location</span>
                        <span className="font-medium text-gray-900">{ac.locationIcao || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Time</span>
                        <span className="font-medium text-gray-900">
                          {ac.totalTimeHrs ? `${ac.totalTimeHrs.toFixed(1)} hrs` : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <div>Owner: {ac.ownerAccount?.name || '—'}</div>
                        {ac.operatorAccount && (
                          <div>Operator: {ac.operatorAccount.name}</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4 text-xs text-gray-500">
                      <div>{ac._count?.opportunities || 0} opps</div>
                      <div>{ac._count?.workOrders || 0} work orders</div>
                      <div>{ac._count?.trips || 0} trips</div>
                    </div>
                  </div>
                </Link>
              ))}

              {aircraft.length === 0 && (
                <div className="col-span-3 bg-white rounded border border-gray-200 p-12 text-center text-gray-500">
                  No aircraft found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
