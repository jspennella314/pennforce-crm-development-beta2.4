'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/app/contexts/NotificationContext';
import Link from 'next/link';

interface WorkflowRule {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: string;
  objectType: string;
  lastTriggered: string | null;
  timesTriggered: number;
  createdAt: string;
}

export default function WorkflowsPage() {
  const { data: session } = useSession();
  const notification = useNotification();
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      notification.error('Failed to load workflows', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (response.ok) {
        notification.success(
          currentState ? 'Workflow deactivated' : 'Workflow activated',
          'Changes saved successfully'
        );
        fetchWorkflows();
      } else {
        throw new Error('Failed to update workflow');
      }
    } catch (error) {
      notification.error('Update failed', 'Could not update workflow status');
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notification.success('Workflow deleted', 'Workflow removed successfully');
        fetchWorkflows();
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      notification.error('Delete failed', 'Could not delete workflow');
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      RECORD_CREATED: 'Record Created',
      RECORD_UPDATED: 'Record Updated',
      FIELD_CHANGED: 'Field Changed',
      TIME_BASED: 'Time Based',
    };
    return labels[type] || type;
  };

  const getObjectTypeLabel = (type: string) => {
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (filter === 'active') return w.isActive;
    if (filter === 'inactive') return !w.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-gray-600 mt-1">
            Automate your business processes with custom workflows
          </p>
        </div>
        <Link
          href="/workflows/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Workflow
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({workflows.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Active ({workflows.filter((w) => w.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'inactive'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Inactive ({workflows.filter((w) => !w.isActive).length})
        </button>
      </div>

      {/* Workflow List */}
      {filteredWorkflows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first workflow to automate repetitive tasks
          </p>
          <Link
            href="/workflows/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Workflow
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        workflow.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {workflow.description && (
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Trigger:</span>
                      {getTriggerTypeLabel(workflow.triggerType)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Object:</span>
                      {getObjectTypeLabel(workflow.objectType)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Executions:</span>
                      {workflow.timesTriggered}
                    </div>
                    {workflow.lastTriggered && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Last run:</span>
                        {new Date(workflow.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleWorkflow(workflow.id, workflow.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      workflow.isActive
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={workflow.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {workflow.isActive ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </button>
                  <Link
                    href={`/workflows/${workflow.id}/edit`}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
