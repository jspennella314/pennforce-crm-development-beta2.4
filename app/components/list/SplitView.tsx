'use client';

import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface SplitViewProps {
  columns: Column[];
  data: any[];
  onSelectionChange?: (selectedIds: string[]) => void;
  detailPanel?: (record: any) => React.ReactNode;
  emptyMessage?: string;
}

export default function SplitView({
  columns,
  data,
  onSelectionChange,
  detailPanel,
  emptyMessage = 'No records to display',
}: SplitViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(data.map(record => record.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
  };

  const handleCloseDetail = () => {
    setSelectedRecord(null);
  };

  return (
    <div className="flex h-full">
      {/* List View */}
      <div className={`${selectedRecord && detailPanel ? 'w-1/2' : 'flex-1'} flex flex-col bg-white border-r border-gray-200 transition-all`}>
        {/* Selection Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="px-4 py-3 bg-[#0176d3] text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">{selectedIds.size} selected</span>
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  onSelectionChange?.([]);
                }}
                className="text-sm underline hover:no-underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white text-[#0176d3] rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                Change Owner
              </button>
              <button className="px-3 py-1.5 bg-white text-[#0176d3] rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                Update Field
              </button>
              <button className="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-sm">{emptyMessage}</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  {/* Checkbox Column */}
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#0176d3] focus:ring-[#0176d3] cursor-pointer"
                    />
                  </th>

                  {/* Data Columns */}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}

                  {/* Detail Icon Column */}
                  {detailPanel && (
                    <th className="w-12 px-4 py-3"></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((record) => {
                  const isSelected = selectedIds.has(record.id);
                  const isDetailOpen = selectedRecord?.id === record.id;

                  return (
                    <tr
                      key={record.id}
                      className={`
                        hover:bg-gray-50 transition-colors cursor-pointer
                        ${isSelected ? 'bg-blue-50' : ''}
                        ${isDetailOpen ? 'bg-blue-100' : ''}
                      `}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectOne(record.id);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#0176d3] focus:ring-[#0176d3] cursor-pointer"
                        />
                      </td>

                      {/* Data Columns */}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-sm text-gray-900"
                          onClick={() => handleRowClick(record)}
                        >
                          {column.render
                            ? column.render(record[column.key], record)
                            : record[column.key] || '—'}
                        </td>
                      ))}

                      {/* Detail Icon */}
                      {detailPanel && (
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(record);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedRecord && detailPanel && (
        <div className="w-1/2 flex flex-col bg-white">
          {/* Detail Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Record Details</h3>
            <button
              onClick={handleCloseDetail}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-auto p-4">
            {detailPanel(selectedRecord)}
          </div>
        </div>
      )}
    </div>
  );
}
