'use client';

import { useState, ReactNode, KeyboardEvent } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface RecordTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function RecordTabs({ tabs, defaultTab }: RecordTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveTab(tabs[index - 1].id);
      document.getElementById(`tab-${tabs[index - 1].id}`)?.focus();
    } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
      setActiveTab(tabs[index + 1].id);
      document.getElementById(`tab-${tabs[index + 1].id}`)?.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center gap-6" role="tablist" aria-label="Record Details">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                title={`View ${tab.label}`}
                className={`
                  py-3 text-sm font-medium border-b-2 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-[#0176d3] focus:ring-offset-2
                  ${activeTab === tab.id
                    ? 'text-[#0176d3] border-[#0176d3]'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 overflow-auto bg-[#f3f3f3]"
      >
        {activeTabContent}
      </div>
    </div>
  );
}
