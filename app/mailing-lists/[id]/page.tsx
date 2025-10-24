'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  account: {
    id: string;
    name: string;
  } | null;
}

interface MailingListContact {
  id: string;
  contact: Contact;
}

interface MailingList {
  id: string;
  name: string;
  description: string | null;
  contacts: MailingListContact[];
  _count: {
    contacts: number;
  };
}

export default function MailingListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mailingList, setMailingList] = useState<MailingList | null>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMailingList();
    fetchAllContacts();
  }, [id]);

  const fetchMailingList = async () => {
    try {
      const res = await fetch(`/api/mailing-lists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMailingList(data);
      }
    } catch (error) {
      console.error('Error fetching mailing list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setAllContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleAddContacts = async () => {
    if (selectedContacts.length === 0) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/mailing-lists/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: selectedContacts }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setSelectedContacts([]);
        fetchMailingList();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add contacts');
      }
    } catch (error) {
      console.error('Error adding contacts:', error);
      alert('Failed to add contacts');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm('Remove this contact from the mailing list?')) return;

    try {
      const res = await fetch(`/api/mailing-lists/${id}/contacts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: [contactId] }),
      });

      if (res.ok) {
        fetchMailingList();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to remove contact');
      }
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Failed to remove contact');
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Filter out contacts already in the list
  const availableContacts = allContacts.filter(
    (c) => !mailingList?.contacts.some((mc) => mc.contact.id === c.id)
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!mailingList) {
    return (
      <div className="p-8">
        <div className="text-center">Mailing list not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/mailing-lists')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Mailing Lists
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{mailingList.name}</h1>
              {mailingList.description && (
                <p className="text-gray-600 mt-2">{mailingList.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {mailingList._count.contacts} contacts
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Contacts
            </button>
          </div>
        </div>

        {mailingList.contacts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No contacts in this list yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Contacts
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mailingList.contacts.map((mc) => (
                  <tr key={mc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {mc.contact.firstName} {mc.contact.lastName}
                    </td>
                    <td className="px-4 py-3">{mc.contact.email}</td>
                    <td className="px-4 py-3">{mc.contact.phone || '-'}</td>
                    <td className="px-4 py-3">
                      {mc.contact.account?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemoveContact(mc.contact.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Contacts Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Add Contacts</h2>
              <div className="flex-1 overflow-auto mb-4">
                {availableContacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No more contacts available to add
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableContacts.map((contact) => (
                      <label
                        key={contact.id}
                        className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.email}
                            {contact.account && ` • ${contact.account.name}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-between items-center border-t pt-4">
                <span className="text-sm text-gray-600">
                  {selectedContacts.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedContacts([]);
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    disabled={adding}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContacts}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={adding || selectedContacts.length === 0}
                  >
                    {adding ? 'Adding...' : `Add ${selectedContacts.length} Contact(s)`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
