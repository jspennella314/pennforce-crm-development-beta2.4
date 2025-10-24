'use client';

import { useState } from 'react';
import { Phone, Mail, Calendar, CheckSquare, MessageSquare, Filter } from 'lucide-react';
import { TaskStatus } from '@prisma/client';
import { fromTaskStatus } from '@/lib/status';

interface Activity {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE';
  subject: string;
  content?: string;
  loggedAt: Date | string;
  user?: {
    name: string;
    email?: string;
  };
  status?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onRefresh?: () => void;
}

const activityConfig = {
  CALL: {
    icon: Phone,
    color: 'bg-green-100 text-green-700',
    label: 'Call',
  },
  EMAIL: {
    icon: Mail,
    color: 'bg-blue-100 text-blue-700',
    label: 'Email',
  },
  MEETING: {
    icon: Calendar,
    color: 'bg-purple-100 text-purple-700',
    label: 'Meeting',
  },
  TASK: {
    icon: CheckSquare,
    color: 'bg-orange-100 text-orange-700',
    label: 'Task',
  },
  NOTE: {
    icon: MessageSquare,
    color: 'bg-gray-100 text-gray-700',
    label: 'Note',
  },
};

export default function ActivityTimeline({ activities, onRefresh }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className="bg-white rounded border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Activity Timeline</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
              filter !== 'all' ? 'bg-[#0176d3] text-white hover:bg-[#014486]' : 'text-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#0176d3] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {Object.entries(activityConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filter === type
                    ? 'bg-[#0176d3] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No activities to display
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div key={activity.id} className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.subject}
                        </p>
                        {activity.content && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {activity.content}
                          </p>
                        )}
                      </div>
                      {activity.status && (
                        <span className={`
                          inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap
                          ${activity.status === TaskStatus.DONE ? 'bg-green-100 text-green-800' :
                            activity.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                            activity.status === TaskStatus.OPEN ? 'bg-gray-100 text-gray-800' :
                            activity.status === TaskStatus.BLOCKED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {fromTaskStatus(activity.status as TaskStatus)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{formatDate(activity.loggedAt)}</span>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span>{activity.user.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
