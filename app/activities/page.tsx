'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      const response = await fetch(`/api/activities?${params}`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity =>
    search === '' ||
    activity.subject?.toLowerCase().includes(search.toLowerCase()) ||
    activity.content?.toLowerCase().includes(search.toLowerCase()) ||
    activity.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    activity.account?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return '📞';
      case 'EMAIL': return '📧';
      case 'MEETING': return '👥';
      case 'NOTE': return '📝';
      case 'TASK': return '✓';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'bg-blue-100';
      case 'EMAIL': return 'bg-purple-100';
      case 'MEETING': return 'bg-green-100';
      case 'NOTE': return 'bg-yellow-100';
      case 'TASK': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups: any, activity: any) => {
    const date = new Date(activity.loggedAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600 mt-1">{activities.length} total activities</p>
          </div>
          <Link
            href="/activities/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Activity
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Activities
              </label>
              <input
                type="text"
                placeholder="Search by subject, content, user, or account..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Types</option>
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Meeting</option>
                <option value="NOTE">Note</option>
                <option value="TASK">Task</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities Timeline */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading activities...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedActivities).length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                No activities found matching your criteria.
              </div>
            ) : (
              Object.keys(groupedActivities).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((date) => (
                <div key={date}>
                  <div className="flex items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
                    <div className="flex-1 h-px bg-gray-200 ml-4"></div>
                  </div>
                  <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                    {groupedActivities[date].map((activity: any) => (
                      <div key={activity.id} className="p-6 hover:bg-gray-50">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-2xl`}>
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {activity.subject || activity.type}
                                  </h3>
                                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    {activity.type}
                                  </span>
                                </div>
                                {activity.content && (
                                  <p className="text-sm text-gray-600 mt-2">{activity.content}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                  {activity.user && (
                                    <div>
                                      <span className="font-medium">Logged by:</span> {activity.user.name}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium">Time:</span>{' '}
                                    {new Date(activity.loggedAt).toLocaleTimeString()}
                                  </div>
                                  {activity.duration && (
                                    <div>
                                      <span className="font-medium">Duration:</span> {activity.duration} min
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  {activity.account && (
                                    <Link
                                      href={`/accounts/${activity.account.id}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {activity.account.name}
                                    </Link>
                                  )}
                                  {activity.contact && (
                                    <Link
                                      href={`/contacts/${activity.contact.id}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {activity.contact.firstName} {activity.contact.lastName}
                                    </Link>
                                  )}
                                  {activity.opportunity && (
                                    <Link
                                      href={`/opportunities/${activity.opportunity.id}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {activity.opportunity.name}
                                    </Link>
                                  )}
                                  {activity.aircraft && (
                                    <Link
                                      href={`/aircraft/${activity.aircraft.id}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {activity.aircraft.make} {activity.aircraft.model}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
