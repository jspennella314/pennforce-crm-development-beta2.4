'use client';

import { useRef, useState } from 'react';
import { parseCSV } from '@/app/lib/csvUtils';
import { useNotification } from '@/app/contexts/NotificationContext';

interface ImportButtonProps {
  onImport: (data: any[]) => Promise<void>;
  label?: string;
  acceptedHeaders?: string[];
}

export default function ImportButton({
  onImport,
  label = 'Import from CSV',
  acceptedHeaders,
}: ImportButtonProps) {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);

      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        notification.warning('No data found in CSV file');
        return;
      }

      // Validate headers if provided
      if (acceptedHeaders && acceptedHeaders.length > 0) {
        const fileHeaders = Object.keys(data[0]);
        const missingHeaders = acceptedHeaders.filter((h) => !fileHeaders.includes(h));

        if (missingHeaders.length > 0) {
          notification.error(
            'Invalid CSV format',
            `Missing required columns: ${missingHeaders.join(', ')}`
          );
          return;
        }
      }

      await onImport(data);
      notification.success('Import successful', `Imported ${data.length} records`);
    } catch (error: any) {
      notification.error('Import failed', error.message || 'Failed to import CSV file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {importing ? 'Importing...' : label}
      </button>
    </>
  );
}
