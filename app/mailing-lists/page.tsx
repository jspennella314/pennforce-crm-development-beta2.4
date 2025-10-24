'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

// Mailing Lists page with theme matching
interface MailingList {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    contacts: number;
  };
}

export default function MailingListsPage() {
  const router = useRouter();
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMailingLists();
  }, []);

  const fetchMailingLists = async () => {
    try {
      const res = await fetch('/api/mailing-lists');
      if (res.ok) {
        const data = await res.json();
        setMailingLists(data);
      }
    } catch (error) {
      console.error('Error fetching mailing lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/mailing-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewList({ name: '', description: '' });
        fetchMailingLists();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create mailing list');
      }
    } catch (error) {
      console.error('Error creating mailing list:', error);
      alert('Failed to create mailing list');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/mailing-lists/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchMailingLists();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete mailing list');
      }
    } catch (error) {
      console.error('Error deleting mailing list:', error);
      alert('Failed to delete mailing list');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Mailing Lists</h1>
            <p className="text-sm text-gray-600 mt-1">Loading...</p>
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
              <h1 className="text-2xl font-semibold text-gray-900">Mailing Lists</h1>
              <p className="text-sm text-gray-600 mt-1">
                {mailingLists.length} total lists
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
            >
              New Mailing List
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            {mailingLists.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mailing lists yet</h3>
                <p className="text-sm text-gray-500 mb-6">Get started by creating your first mailing list</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium"
                >
                  Create Your First List
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {mailingLists.map((list) => (
                  <div
                    key={list.id}
                    className="bg-white rounded border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => router.push(`/mailing-lists/${list.id}`)}>
                          <h3 className="text-lg font-semibold text-[#0176d3] hover:underline">
                            {list.name}
                          </h3>
                          {list.description && (
                            <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {list._count.contacts} contact{list._count.contacts !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs text-gray-500">
                              Created {new Date(list.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(list.id, list.name)}
                          className="ml-4 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">New Mailing List</h3>
              </div>
              <form onSubmit={handleCreate} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newList.name}
                    onChange={(e) =>
                      setNewList({ ...newList, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0176d3] focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newList.description}
                    onChange={(e) =>
                      setNewList({ ...newList, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0176d3] focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors disabled:opacity-50"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create List'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
