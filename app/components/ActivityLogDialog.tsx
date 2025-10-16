'use client';

import { useState } from 'react';

interface ActivityLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relatedTo?: {
    type: 'account' | 'contact' | 'opportunity' | 'aircraft';
    id: string;
    name: string;
  };
  onSuccess?: () => void;
}

export default function ActivityLogDialog({ isOpen, onClose, relatedTo, onSuccess }: ActivityLogDialogProps) {
  const [formData, setFormData] = useState({
    type: 'CALL',
    subject: '',
    content: '',
    duration: '',
    loggedAt: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        type: formData.type,
        subject: formData.subject,
        content: formData.content,
        loggedAt: new Date(formData.loggedAt).toISOString(),
      };

      if (formData.duration) {
        payload.duration = parseInt(formData.duration);
      }

      // Add relationship based on relatedTo
      if (relatedTo) {
        switch (relatedTo.type) {
          case 'account':
            payload.accountId = relatedTo.id;
            break;
          case 'contact':
            payload.contactId = relatedTo.id;
            break;
          case 'opportunity':
            payload.opportunityId = relatedTo.id;
            break;
          case 'aircraft':
            payload.aircraftId = relatedTo.id;
            break;
        }
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log activity');
      }

      // Reset form
      setFormData({
        type: 'CALL',
        subject: '',
        content: '',
        duration: '',
        loggedAt: new Date().toISOString().slice(0, 16),
      });

      // Notify parent and close
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activityTypes = [
    { value: 'CALL', label: 'Call', icon: '📞' },
    { value: 'EMAIL', label: 'Email', icon: '📧' },
    { value: 'MEETING', label: 'Meeting', icon: '👥' },
    { value: 'NOTE', label: 'Note', icon: '📝' },
    { value: 'TASK', label: 'Task', icon: '✓' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Log an Activity</h2>
            {relatedTo && (
              <p className="text-sm text-gray-600 mt-1">
                Related to: <span className="font-medium">{relatedTo.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`
                    p-3 border-2 rounded-lg flex flex-col items-center justify-center transition-all
                    ${formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <span className="text-2xl mb-1">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the activity"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Details
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add notes, outcomes, or next steps..."
            />
          </div>

          {/* Date/Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="loggedAt" className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="loggedAt"
                value={formData.loggedAt}
                onChange={(e) => setFormData({ ...formData, loggedAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
                min="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
