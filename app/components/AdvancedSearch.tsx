'use client';

import { useState } from 'react';

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
  value: any;
}

export interface AdvancedSearchProps {
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: Array<{ value: string; label: string }>;
  }>;
  onSearch: (filters: SearchFilter[]) => void;
  onClear: () => void;
}

export default function AdvancedSearch({ fields, onSearch, onClear }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilter[]>([
    { field: fields[0]?.name || '', operator: 'contains', value: '' },
  ]);

  const operatorOptions = [
    { value: 'eq', label: 'Equals' },
    { value: 'ne', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'gte', label: 'Greater or Equal' },
    { value: 'lt', label: 'Less Than' },
    { value: 'lte', label: 'Less or Equal' },
    { value: 'in', label: 'In List' },
  ];

  const addFilter = () => {
    setFilters([...filters, { field: fields[0]?.name || '', operator: 'contains', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    const validFilters = filters.filter((f) => f.value !== '' && f.value !== null);
    onSearch(validFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters([{ field: fields[0]?.name || '', operator: 'contains', value: '' }]);
    onClear();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Advanced Search
        {filters.filter((f) => f.value).length > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {filters.filter((f) => f.value).length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Advanced Search</h3>
              <p className="text-sm text-gray-600 mt-1">Add multiple filters to refine your search</p>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {filters.map((filter, index) => {
                const field = fields.find((f) => f.name === filter.field);
                return (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(index, { field: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    >
                      {fields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    >
                      {operatorOptions.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    {field?.type === 'select' && field.options ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field?.type === 'boolean' ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value === 'true' })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        type={field?.type || 'text'}
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                        placeholder="Enter value..."
                      />
                    )}

                    <button
                      onClick={() => removeFilter(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove filter"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}

              <button
                onClick={addFilter}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                + Add Filter
              </button>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between gap-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Clear All
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
