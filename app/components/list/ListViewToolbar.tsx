'use client';

import { useState } from 'react';
import { ChevronDown, Filter, RefreshCw, Settings, Star, Share2 } from 'lucide-react';

interface ListView {
  id: string;
  name: string;
  isPinned?: boolean;
  isDefault?: boolean;
}

interface ListViewToolbarProps {
  views: ListView[];
  currentView: string;
  onViewChange: (viewId: string) => void;
  onRefresh?: () => void;
  onSaveView?: () => void;
  onPinView?: (viewId: string) => void;
  onShareView?: (viewId: string) => void;
  totalRecords?: number;
}

export default function ListViewToolbar({
  views,
  currentView,
  onViewChange,
  onRefresh,
  onSaveView,
  onPinView,
  onShareView,
  totalRecords,
}: ListViewToolbarProps) {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const selectedView = views.find(v => v.id === currentView);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: View Selector and Filters */}
          <div className="flex items-center gap-3">
            {/* View Selector */}
            <div className="relative">
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <span>{selectedView?.name || 'Select View'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showViewDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowViewDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[240px]">
                    <div className="py-1">
                      {/* Pinned Views */}
                      {views.filter(v => v.isPinned).length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Pinned
                          </div>
                          {views.filter(v => v.isPinned).map((view) => (
                            <button
                              key={view.id}
                              onClick={() => {
                                onViewChange(view.id);
                                setShowViewDropdown(false);
                              }}
                              className={`
                                w-full text-left px-3 py-2 text-sm flex items-center justify-between
                                ${currentView === view.id ? 'bg-blue-50 text-[#0176d3]' : 'text-gray-700 hover:bg-gray-50'}
                              `}
                            >
                              <span>{view.name}</span>
                              {view.isPinned && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                            </button>
                          ))}
                          <div className="border-t border-gray-200 my-1" />
                        </>
                      )}

                      {/* All Views */}
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        All List Views
                      </div>
                      {views.filter(v => !v.isPinned).map((view) => (
                        <button
                          key={view.id}
                          onClick={() => {
                            onViewChange(view.id);
                            setShowViewDropdown(false);
                          }}
                          className={`
                            w-full text-left px-3 py-2 text-sm
                            ${currentView === view.id ? 'bg-blue-50 text-[#0176d3]' : 'text-gray-700 hover:bg-gray-50'}
                          `}
                        >
                          {view.name}
                        </button>
                      ))}

                      {/* New View Action */}
                      <div className="border-t border-gray-200 mt-1 pt-1">
                        <button
                          onClick={() => {
                            onSaveView?.();
                            setShowViewDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-[#0176d3] hover:bg-gray-50 font-medium"
                        >
                          + New List View
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border transition-colors
                ${showFilterPanel
                  ? 'bg-[#0176d3] text-white border-[#0176d3]'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Record Count */}
            {totalRecords !== undefined && (
              <span className="text-sm text-gray-600">
                {totalRecords} {totalRecords === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Pin View */}
            {onPinView && (
              <button
                onClick={() => onPinView(currentView)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Pin this view"
              >
                <Star className={`w-4 h-4 ${selectedView?.isPinned ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            )}

            {/* Share View */}
            {onShareView && (
              <button
                onClick={() => onShareView(currentView)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Share this view"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Settings */}
            <button
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="List settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-3">
              {/* Filter Example */}
              <div className="flex items-center gap-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>Account Name</option>
                  <option>Owner</option>
                  <option>Created Date</option>
                  <option>Last Modified</option>
                </select>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>equals</option>
                  <option>contains</option>
                  <option>starts with</option>
                  <option>does not equal</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter value..."
                  className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                />
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Remove
                </button>
              </div>

              {/* Add Filter Button */}
              <div className="flex items-center gap-2">
                <button className="text-sm text-[#0176d3] hover:underline font-medium">
                  + Add Filter
                </button>
                <button className="text-sm text-gray-600 hover:underline">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
