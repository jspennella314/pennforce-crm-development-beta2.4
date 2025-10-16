'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AuditHistoryProps {
  entityType?: string;
  entityId?: string;
  limit?: number;
}

export default function AuditHistory({
  entityType,
  entityId,
  limit = 20,
}: AuditHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [entityType, entityId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityType) params.set('entityType', entityType);
      if (entityId) params.set('entityId', entityId);
      params.set('limit', limit.toString());

      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="text-green-600">+</span>;
      case 'UPDATE':
        return <span className="text-blue-600">✎</span>;
      case 'DELETE':
        return <span className="text-red-600">×</span>;
      default:
        return <span className="text-gray-600">•</span>;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'UPDATE':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'DELETE':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 mb-4">Change History</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-600">{log.entityType}</span>
                      {log.entityName && (
                        <span className="text-sm font-medium text-gray-900">
                          {log.entityName}
                        </span>
                      )}
                    </div>
                    {log.user && (
                      <p className="text-sm text-gray-600 mt-1">
                        by {log.user.name || log.user.email}
                      </p>
                    )}
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(log.changes).map(([field, change]: [string, any]) => (
                          <div key={field} className="text-xs">
                            <span className="font-medium text-gray-700">{field}:</span>{' '}
                            <span className="text-red-600 line-through">
                              {JSON.stringify(change.before)}
                            </span>{' '}
                            → <span className="text-green-600">{JSON.stringify(change.after)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <time className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
