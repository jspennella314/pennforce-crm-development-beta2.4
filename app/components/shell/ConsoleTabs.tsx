'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Users, Building2, Target, Plane, Home } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  path: string;
  type?: 'home' | 'contact' | 'account' | 'opportunity' | 'aircraft';
  isPinned?: boolean;
}

interface ConsoleTabsProps {
  onTabChange?: (tab: Tab) => void;
}

const getIconForType = (type?: string) => {
  switch (type) {
    case 'home':
      return Home;
    case 'contact':
      return Users;
    case 'account':
      return Building2;
    case 'opportunity':
      return Target;
    case 'aircraft':
      return Plane;
    default:
      return Home;
  }
};

export default function ConsoleTabs({ onTabChange }: ConsoleTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Load tabs from localStorage on mount
  useEffect(() => {
    const savedTabs = localStorage.getItem('consoleTabs');
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        setTabs(parsed);
      } catch (error) {
        console.error('Failed to parse console tabs:', error);
      }
    }
  }, []);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('consoleTabs', JSON.stringify(tabs));
    }
  }, [tabs]);

  // Sync active tab with current pathname
  useEffect(() => {
    if (pathname) {
      const existingTab = tabs.find(tab => tab.path === pathname);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        // Create a new tab for the current page
        const newTab = createTabFromPath(pathname);
        if (newTab) {
          addTab(newTab);
        }
      }
    }
  }, [pathname]);

  const createTabFromPath = (path: string): Tab | null => {
    if (path === '/dashboard') {
      return {
        id: `tab-${Date.now()}`,
        label: 'Home',
        path,
        type: 'home',
      };
    }

    if (path.startsWith('/contacts/')) {
      return {
        id: `tab-${Date.now()}`,
        label: 'Contact',
        path,
        type: 'contact',
      };
    }

    if (path.startsWith('/accounts/')) {
      return {
        id: `tab-${Date.now()}`,
        label: 'Account',
        path,
        type: 'account',
      };
    }

    if (path.startsWith('/opportunities/')) {
      return {
        id: `tab-${Date.now()}`,
        label: 'Opportunity',
        path,
        type: 'opportunity',
      };
    }

    if (path.startsWith('/aircraft/')) {
      return {
        id: `tab-${Date.now()}`,
        label: 'Aircraft',
        path,
        type: 'aircraft',
      };
    }

    return null;
  };

  const addTab = (tab: Tab) => {
    // Check if tab already exists
    const exists = tabs.find(t => t.path === tab.path);
    if (!exists) {
      setTabs([...tabs, tab]);
      setActiveTabId(tab.id);
    } else {
      setActiveTabId(exists.id);
    }
  };

  const closeTab = (tabId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const closingActiveTab = tabId === activeTabId;

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    // If closing the active tab, navigate to the previous tab or home
    if (closingActiveTab && newTabs.length > 0) {
      const nextTab = newTabs[Math.max(0, tabIndex - 1)];
      router.push(nextTab.path);
      setActiveTabId(nextTab.id);
    } else if (closingActiveTab && newTabs.length === 0) {
      router.push('/dashboard');
      setActiveTabId(null);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTabId(tab.id);
    router.push(tab.path);
    onTabChange?.(tab);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = getIconForType(tab.type);
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              onClick={() => switchTab(tab)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium border-r border-gray-200
                transition-colors relative group min-w-[140px] max-w-[200px] cursor-pointer
                ${isActive
                  ? 'bg-[#f3f3f3] text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#0176d3]" />
              )}

              {/* Icon */}
              <Icon className="w-4 h-4 flex-shrink-0" />

              {/* Label */}
              <span className="truncate flex-1 text-left">{tab.label}</span>

              {/* Close Button */}
              {!tab.isPinned && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className={`
                    p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
