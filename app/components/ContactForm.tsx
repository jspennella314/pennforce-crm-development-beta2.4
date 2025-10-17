'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContactFormProps {
  contactId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ContactForm({ contactId, onSuccess, onCancel }: ContactFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    accountId: '',
    address: '',
    preferredContact: 'EMAIL',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const accountsRes = await fetch('/api/accounts');
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);

        if (contactId) {
          const contactRes = await fetch(`/api/contacts/${contactId}`);
          const contactData = await contactRes.json();

          setFormData({
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            title: contactData.title || '',
            email: contactData.email || '',
            phone: contactData.phone || '',
            mobile: contactData.mobile || '',
            accountId: contactData.accountId || '',
            address: contactData.address || '',
            preferredContact: contactData.preferredContact || 'EMAIL',
            notes: contactData.notes || '',
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [contactId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title || null,
        email: formData.email || null,
        phone: formData.phone || null,
        accountId: formData.accountId || null,
      };

      const url = contactId ? `/api/contacts/${contactId}` : '/api/contacts';
      const method = contactId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save contact');
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/contacts/${result.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  const contactMethods = [
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Phone' },
    { value: 'MOBILE', label: 'Mobile' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {contactId ? 'Edit Contact' : 'New Contact'}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="John"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Title and Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Chief Pilot"
            />
          </div>

          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
              Account
            </label>
            <select
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select an account...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile
            </label>
            <input
              type="tel"
              id="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>

        {/* Preferred Contact Method */}
        <div>
          <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Method
          </label>
          <select
            id="preferredContact"
            value={formData.preferredContact}
            onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {contactMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="123 Main St, City, State 12345"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Additional information about this contact..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : contactId ? 'Save Changes' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
}
