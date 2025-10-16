'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

const stages = [
  { id: 'PROSPECT', name: 'Prospect', color: 'bg-gray-100' },
  { id: 'QUALIFY', name: 'Qualify', color: 'bg-blue-100' },
  { id: 'PROPOSAL', name: 'Proposal', color: 'bg-purple-100' },
  { id: 'NEGOTIATION', name: 'Negotiation', color: 'bg-orange-100' },
  { id: 'WON', name: 'Won', color: 'bg-green-100' },
  { id: 'LOST', name: 'Lost', color: 'bg-red-100' },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/opportunities');
      const data = await response.json();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const getTotalValueByStage = (stage: string) => {
    return getOpportunitiesByStage(stage).reduce((sum, opp) => {
      return sum + (parseFloat(opp.amount) || 0);
    }, 0);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="text-center">Loading opportunities...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
              <p className="text-gray-600 mt-1">{opportunities.length} total opportunities</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/opportunities/kanban"
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Kanban View
              </Link>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List
              </button>
              <Link
                href="/opportunities/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + New
              </Link>
            </div>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageOpps = getOpportunitiesByStage(stage.id);
              const totalValue = getTotalValueByStage(stage.id);

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className={`${stage.color} rounded-t-lg p-4`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="bg-white px-2 py-1 rounded text-sm font-medium">
                        {stageOpps.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      ${(totalValue / 1000000).toFixed(1)}M
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-b-lg p-2 space-y-2 min-h-[500px]">
                    {stageOpps.map((opp) => (
                      <Link
                        key={opp.id}
                        href={`/opportunities/${opp.id}`}
                        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200"
                      >
                        <div className="font-medium text-gray-900 mb-2">{opp.name}</div>

                        <div className="text-sm text-gray-600 mb-2">
                          {opp.account.name}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-gray-900">
                            ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                          </div>
                          {opp.probability && (
                            <div className="text-sm text-gray-600">
                              {opp.probability}%
                            </div>
                          )}
                        </div>

                        {opp.closeDate && (
                          <div className="text-xs text-gray-500 mt-2">
                            Close: {new Date(opp.closeDate).toLocaleDateString()}
                          </div>
                        )}

                        {opp.aircraft && (
                          <div className="text-xs text-blue-600 mt-2">
                            ✈️ {opp.aircraft.make} {opp.aircraft.model}
                          </div>
                        )}

                        {opp.owner && (
                          <div className="text-xs text-gray-500 mt-2">
                            Owner: {opp.owner.name}
                          </div>
                        )}
                      </Link>
                    ))}

                    {stageOpps.length === 0 && (
                      <div className="text-center text-gray-400 py-8 text-sm">
                        No opportunities
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Opportunity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Close Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {opp.name}
                      </Link>
                      {opp.aircraft && (
                        <div className="text-sm text-gray-500">
                          ✈️ {opp.aircraft.make} {opp.aircraft.model}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {opp.account.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${opp.stage === 'WON' ? 'bg-green-100 text-green-800' :
                          opp.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                          opp.stage === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800' :
                          opp.stage === 'PROPOSAL' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {opp.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${(parseFloat(opp.amount) / 1000000).toFixed(1)}M
                      {opp.probability && (
                        <span className="text-gray-500 font-normal ml-1">
                          ({opp.probability}%)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {opp.owner?.name || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {opportunities.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No opportunities found.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
