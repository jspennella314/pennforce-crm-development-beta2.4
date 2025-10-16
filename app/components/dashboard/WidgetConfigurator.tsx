'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/app/contexts/NotificationContext';
import {
  AVAILABLE_WIDGETS,
  DashboardLayout,
  saveDashboardLayout,
  DEFAULT_LAYOUT,
  type WidgetConfig,
} from '@/app/lib/dashboardWidgets';

interface WidgetConfiguratorProps {
  currentLayout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
  onClose: () => void;
}

export default function WidgetConfigurator({
  currentLayout,
  onLayoutChange,
  onClose,
}: WidgetConfiguratorProps) {
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(
    new Set(currentLayout.widgets)
  );
  const [saving, setSaving] = useState(false);
  const notification = useNotification();

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const newLayout: DashboardLayout = {
        ...currentLayout,
        widgets: Array.from(selectedWidgets),
      };

      await saveDashboardLayout(newLayout);
      onLayoutChange(newLayout);
      notification.success('Dashboard customized', 'Your changes have been saved');
      onClose();
    } catch (error) {
      notification.error('Failed to save', 'Could not save dashboard configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedWidgets(new Set(DEFAULT_LAYOUT.widgets));
  };

  const groupedWidgets = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetConfig[]>);

  const categoryLabels: Record<string, string> = {
    metric: 'Metrics',
    chart: 'Charts',
    list: 'Lists',
    'quick-action': 'Quick Actions',
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-lg shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customize Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Select which widgets to display</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {Object.entries(groupedWidgets).map(([category, widgets]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {categoryLabels[category] || category}
                </h3>
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <label
                      key={widget.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWidgets.has(widget.id)}
                        onChange={() => toggleWidget(widget.id)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{widget.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{widget.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {widget.size}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
