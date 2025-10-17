'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string }>({ type: 'bulk' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    search === '' ||
    contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
    contact.email?.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone?.includes(search) ||
    contact.account?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteClick = (id?: string) => {
    if (id) {
      setDeleteTarget({ type: 'single', id });
    } else {
      setDeleteTarget({ type: 'bulk' });
    }
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        await fetch(`/api/contacts/${deleteTarget.id}`, { method: 'DELETE' });
      } else {
        // Bulk delete
        await Promise.all(
          Array.from(selectedIds).map(id =>
            fetch(`/api/contacts/${id}`, { method: 'DELETE' })
          )
        );
        setSelectedIds(new Set());
      }
      await fetchContacts();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting contact(s):', error);
      alert('Failed to delete contact(s)');
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">{contacts.length} total contacts</p>
          </div>
          <div className="flex gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => handleDeleteClick()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete {selectedIds.size} Selected
              </button>
            )}
            <Link
              href="/contacts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Contact
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Contacts
          </label>
          <input
            type="text"
            placeholder="Search by name, email, phone, or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Contacts List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500">Loading contacts...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={(e) => handleSelectOne(contact.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {contact.title || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {contact.email && <div>{contact.email}</div>}
                      {contact.phone && <div className="text-gray-500">{contact.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {contact.account ? (
                        <Link
                          href={`/accounts/${contact.account.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {contact.account.name}
                        </Link>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {contact.owner?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/contacts/${contact.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(contact.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContacts.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No contacts found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              {deleteTarget.type === 'single'
                ? 'Are you sure you want to delete this contact? This action cannot be undone.'
                : `Are you sure you want to delete ${selectedIds.size} contact(s)? This action cannot be undone.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
