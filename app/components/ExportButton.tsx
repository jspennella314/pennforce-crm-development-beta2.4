'use client';

import { useState } from 'react';
import { downloadCSV } from '@/app/lib/csvUtils';
import { useNotification } from '@/app/contexts/NotificationContext';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: string[];
  label?: string;
}

export default function ExportButton({
  data,
  filename,
  headers,
  label = 'Export to CSV',
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const notification = useNotification();

  const handleExport = async () => {
    try {
      setExporting(true);

      if (data.length === 0) {
        notification.warning('No data to export');
        return;
      }

      downloadCSV(data, filename, headers);
      notification.success('Export successful', `Downloaded ${filename}`);
    } catch (error) {
      notification.error('Export failed', 'Failed to export data to CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {exporting ? 'Exporting...' : label}
    </button>
  );
}
