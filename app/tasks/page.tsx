'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const response = await fetch(`/api/tasks?${params}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task =>
    search === '' ||
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase()) ||
    task.owner?.name.toLowerCase().includes(search.toLowerCase()) ||
    task.account?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openTasks = filteredTasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELED');
  const completedTasks = filteredTasks.filter(t => t.status === 'DONE' || t.status === 'CANCELED');

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              {openTasks.length} open, {completedTasks.length} completed
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Tasks
              </label>
              <input
                type="text"
                placeholder="Search by title, description, owner, or account..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : (
          <>
            {/* Open Tasks */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Open Tasks ({openTasks.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {openTasks.map((task) => (
                  <div key={task.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {task.title}
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          {task.owner && (
                            <div>
                              <span className="font-medium">Owner:</span> {task.owner.name}
                            </div>
                          )}
                          {task.account && (
                            <div>
                              <Link
                                href={`/accounts/${task.account.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.account.name}
                              </Link>
                            </div>
                          )}
                          {task.contact && (
                            <div>
                              <Link
                                href={`/contacts/${task.contact.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.contact.firstName} {task.contact.lastName}
                              </Link>
                            </div>
                          )}
                          {task.opportunity && (
                            <div>
                              <Link
                                href={`/opportunities/${task.opportunity.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.opportunity.name}
                              </Link>
                            </div>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Due:</span>{' '}
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-600 font-medium' : 'text-gray-900'}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {openTasks.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    No open tasks found.
                  </div>
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Completed Tasks ({completedTasks.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="p-6 hover:bg-gray-50 opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-gray-900 line-through">
                              {task.title}
                            </h3>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            {task.owner && (
                              <div>
                                <span className="font-medium">Owner:</span> {task.owner.name}
                              </div>
                            )}
                            {task.completedAt && (
                              <div>
                                <span className="font-medium">Completed:</span>{' '}
                                {new Date(task.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
