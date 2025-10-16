'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AircraftFormProps {
  aircraftId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AircraftForm({ aircraftId, onSuccess, onCancel }: AircraftFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    tailNumber: '',
    make: '',
    model: '',
    year: '',
    serialNumber: '',
    status: 'ACTIVE',
    ownerAccountId: '',
    operatorAccountId: '',
    baseLocation: '',
    registrationDate: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const accountsRes = await fetch('/api/accounts');
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);

        if (aircraftId) {
          const aircraftRes = await fetch(`/api/aircraft/${aircraftId}`);
          const aircraftData = await aircraftRes.json();

          setFormData({
            tailNumber: aircraftData.tailNumber,
            make: aircraftData.make,
            model: aircraftData.model,
            year: aircraftData.year?.toString() || '',
            serialNumber: aircraftData.serialNumber || '',
            status: aircraftData.status,
            ownerAccountId: aircraftData.ownerAccountId || '',
            operatorAccountId: aircraftData.operatorAccountId || '',
            baseLocation: aircraftData.baseLocation || '',
            registrationDate: aircraftData.registrationDate ? new Date(aircraftData.registrationDate).toISOString().slice(0, 10) : '',
            notes: aircraftData.notes || '',
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
  }, [aircraftId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        tailNumber: formData.tailNumber,
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        serialNumber: formData.serialNumber || null,
        status: formData.status,
        ownerAccountId: formData.ownerAccountId || null,
        operatorAccountId: formData.operatorAccountId || null,
        baseLocation: formData.baseLocation || null,
        registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : null,
        notes: formData.notes || null,
      };

      const url = aircraftId ? `/api/aircraft/${aircraftId}` : '/api/aircraft';
      const method = aircraftId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save aircraft');
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/aircraft/${result.id}`);
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

  const statuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'FOR_SALE', label: 'For Sale' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'RETIRED', label: 'Retired' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {aircraftId ? 'Edit Aircraft' : 'New Aircraft'}
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tail Number and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tailNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Tail Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tailNumber"
              value={formData.tailNumber}
              onChange={(e) => setFormData({ ...formData, tailNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="N12345"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Make and Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Gulfstream"
              required
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="G650"
              required
            />
          </div>
        </div>

        {/* Year and Serial Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2020"
              min="1900"
              max="2100"
            />
          </div>

          <div>
            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="6123"
            />
          </div>
        </div>

        {/* Owner and Operator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ownerAccountId" className="block text-sm font-medium text-gray-700 mb-2">
              Owner Account
            </label>
            <select
              id="ownerAccountId"
              value={formData.ownerAccountId}
              onChange={(e) => setFormData({ ...formData, ownerAccountId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select owner...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="operatorAccountId" className="block text-sm font-medium text-gray-700 mb-2">
              Operator Account
            </label>
            <select
              id="operatorAccountId"
              value={formData.operatorAccountId}
              onChange={(e) => setFormData({ ...formData, operatorAccountId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select operator...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Base Location and Registration Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="baseLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Base Location
            </label>
            <input
              type="text"
              id="baseLocation"
              value={formData.baseLocation}
              onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="KTEB - Teterboro Airport"
            />
          </div>

          <div>
            <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Date
            </label>
            <input
              type="date"
              id="registrationDate"
              value={formData.registrationDate}
              onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            placeholder="Additional information about this aircraft..."
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
          {loading ? 'Saving...' : aircraftId ? 'Save Changes' : 'Create Aircraft'}
        </button>
      </div>
    </form>
  );
}
