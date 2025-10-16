'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OpportunityFormProps {
  opportunityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OpportunityForm({ opportunityId, onSuccess, onCancel }: OpportunityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    accountId: '',
    contactId: '',
    aircraftId: '',
    amount: '',
    probability: '50',
    closeDate: '',
    pipeline: 'Sales',
    stage: 'QUALIFICATION',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch accounts, contacts, and aircraft in parallel
        const [accountsRes, contactsRes, aircraftRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/contacts'),
          fetch('/api/aircraft'),
        ]);

        const [accountsData, contactsData, aircraftData] = await Promise.all([
          accountsRes.json(),
          contactsRes.json(),
          aircraftRes.json(),
        ]);

        setAccounts(accountsData);
        setContacts(contactsData);
        setAircraft(aircraftData);

        // If editing, fetch the opportunity data
        if (opportunityId) {
          const oppRes = await fetch(`/api/opportunities/${opportunityId}`);
          const oppData = await oppRes.json();

          setFormData({
            name: oppData.name,
            accountId: oppData.accountId || '',
            contactId: oppData.contactId || '',
            aircraftId: oppData.aircraftId || '',
            amount: oppData.amount,
            probability: oppData.probability.toString(),
            closeDate: oppData.closeDate ? new Date(oppData.closeDate).toISOString().slice(0, 10) : '',
            pipeline: oppData.pipeline,
            stage: oppData.stage,
            notes: oppData.notes || '',
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
  }, [opportunityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        accountId: formData.accountId || null,
        contactId: formData.contactId || null,
        aircraftId: formData.aircraftId || null,
        amount: parseFloat(formData.amount),
        probability: parseInt(formData.probability),
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : null,
        pipeline: formData.pipeline,
        stage: formData.stage,
        notes: formData.notes || null,
      };

      const url = opportunityId ? `/api/opportunities/${opportunityId}` : '/api/opportunities';
      const method = opportunityId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save opportunity');
      }

      const result = await response.json();

      // Notify parent or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/opportunities/${result.id}`);
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

  const pipelines = ['Sales', 'Management', 'Charter', 'Maintenance'];
  const stages = [
    { value: 'QUALIFICATION', label: 'Qualification' },
    { value: 'PROPOSAL', label: 'Proposal' },
    { value: 'NEGOTIATION', label: 'Negotiation' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
  ];

  // Filter contacts by selected account
  const filteredContacts = formData.accountId
    ? contacts.filter(c => c.accountId === formData.accountId)
    : contacts;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {opportunityId ? 'Edit Opportunity' : 'New Opportunity'}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Opportunity Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Opportunity Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Aircraft Management Agreement - 2025"
            required
          />
        </div>

        {/* Account and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
              Account
            </label>
            <select
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value, contactId: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an account...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-2">
              Contact
            </label>
            <select
              id="contactId"
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.accountId && filteredContacts.length === 0}
            >
              <option value="">Select a contact...</option>
              {filteredContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
            {formData.accountId && filteredContacts.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No contacts for this account</p>
            )}
          </div>
        </div>

        {/* Aircraft */}
        <div>
          <label htmlFor="aircraftId" className="block text-sm font-medium text-gray-700 mb-2">
            Aircraft
          </label>
          <select
            id="aircraftId"
            value={formData.aircraftId}
            onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select aircraft...</option>
            {aircraft.map((ac) => (
              <option key={ac.id} value={ac.id}>
                {ac.make} {ac.model} ({ac.tailNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Amount and Probability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100000"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-2">
              Probability <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                id="probability"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="flex-1"
                min="0"
                max="100"
                step="5"
              />
              <span className="text-sm font-medium text-gray-900 w-12 text-right">
                {formData.probability}%
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline and Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pipeline" className="block text-sm font-medium text-gray-700 mb-2">
              Pipeline <span className="text-red-500">*</span>
            </label>
            <select
              id="pipeline"
              value={formData.pipeline}
              onChange={(e) => setFormData({ ...formData, pipeline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {pipelines.map((pipeline) => (
                <option key={pipeline} value={pipeline}>
                  {pipeline}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
              Stage <span className="text-red-500">*</span>
            </label>
            <select
              id="stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {stages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Close Date */}
        <div>
          <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Close Date
          </label>
          <input
            type="date"
            id="closeDate"
            value={formData.closeDate}
            onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional details about this opportunity..."
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
          {loading ? 'Saving...' : opportunityId ? 'Save Changes' : 'Create Opportunity'}
        </button>
      </div>
    </form>
  );
}
