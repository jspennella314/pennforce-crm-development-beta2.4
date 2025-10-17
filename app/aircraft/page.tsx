'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAircraft();
  }, [statusFilter]);

  const fetchAircraft = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/aircraft?${params}`);
      const data = await response.json();
      setAircraft(data);
    } catch (error) {
      console.error('Error fetching aircraft:', error);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['ACTIVE', 'FOR_SALE', 'MAINTENANCE', 'IN_ACQUISITION', 'RETIRED'];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aircraft</h1>
            <p className="text-gray-600 mt-1">{aircraft.length} total aircraft</p>
          </div>
          <Link
            href="/aircraft/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Aircraft
          </Link>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Aircraft Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading aircraft...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aircraft.map((ac) => (
              <Link
                key={ac.id}
                href={`/aircraft/${ac.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
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
                    <div className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${ac.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        ac.status === 'FOR_SALE' ? 'bg-blue-100 text-blue-800' :
                        ac.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
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
                    <div>{ac._count.opportunities} opps</div>
                    <div>{ac._count.workOrders} work orders</div>
                    <div>{ac._count.trips} trips</div>
                  </div>
                </div>
              </Link>
            ))}

            {aircraft.length === 0 && (
              <div className="col-span-3 bg-white rounded-lg shadow p-12 text-center text-gray-500">
                No aircraft found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
