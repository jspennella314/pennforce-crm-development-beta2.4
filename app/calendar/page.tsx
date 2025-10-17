'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/app/contexts/NotificationContext';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  eventType: string;
  status: string;
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const notification = useNotification();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = getStartDate();
      const end = getEndDate();

      const response = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      notification.error('Failed to load events', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setHours(0, 0, 0, 0);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - date.getDay() + 6);
      date.setHours(23, 59, 59, 999);
    } else {
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const navigate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(date);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MEETING: 'bg-blue-100 text-blue-800 border-blue-200',
      CALL: 'bg-green-100 text-green-800 border-green-200',
      TASK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DEMO: 'bg-purple-100 text-purple-800 border-purple-200',
      INSPECTION: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              ...(viewMode === 'day' && { day: 'numeric' }),
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No events scheduled</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-4 ${getEventTypeColor(event.eventType)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm mt-1 opacity-90">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span>
                          {new Date(event.startTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(event.endTime).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded">
                      {event.eventType}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
