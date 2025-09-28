"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useConsole, ConsoleTab } from './console-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  X,
  Pin,
  PinOff,
  MoreHorizontal,
  Building2,
  User,
  Target,
  Plane,
  BarChart3,
  Home,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OBJECT_ICONS = {
  account: Building2,
  contact: User,
  opportunity: Target,
  aircraft: Plane,
  dashboard: BarChart3,
};

const OBJECT_COLORS = {
  account: 'bg-blue-600',
  contact: 'bg-purple-600',
  opportunity: 'bg-green-600',
  aircraft: 'bg-orange-600',
  dashboard: 'bg-indigo-600',
};

export function ConsoleTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { tabs, activeTabId, setActiveTab, closeTab, pinTab, unpinTab, closeAllTabs } = useConsole();

  // Handle middle-click to close tabs
  const handleTabClick = (e: React.MouseEvent, tab: ConsoleTab) => {
    e.preventDefault();

    if (e.button === 1) { // Middle click
      closeTab(tab.id);
    } else if (e.button === 0) { // Left click
      setActiveTab(tab.id);
      router.push(tab.url);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handlePinToggle = (e: React.MouseEvent, tab: ConsoleTab) => {
    e.stopPropagation();
    if (tab.isPinned) {
      unpinTab(tab.id);
    } else {
      pinTab(tab.id);
    }
  };

  const handleCloseOthers = (tabId: string) => {
    tabs.forEach(tab => {
      if (tab.id !== tabId && !tab.isPinned) {
        closeTab(tab.id);
      }
    });
  };

  const handleCloseAll = () => {
    closeAllTabs();
  };

  const getTabTitle = (tab: ConsoleTab) => {
    if (tab.title.length > 25) {
      return tab.title.substring(0, 22) + '...';
    }
    return tab.title;
  };

  if (tabs.length === 0) {
    return null;
  }

  // Sort tabs: pinned first, then by creation order
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden">
      <div className="flex items-center">
        {/* Home Tab */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 px-3 rounded-none border-r border-gray-200 hover:bg-gray-50",
            !activeTabId && "bg-gray-100 border-b-2 border-b-blue-600"
          )}
          onClick={() => {
            router.push('/dashboard');
          }}
        >
          <Home className="h-4 w-4" />
        </Button>

        {/* Tab List */}
        <div className="flex flex-1 overflow-x-auto scrollbar-hide">
          {sortedTabs.map((tab) => {
            const IconComponent = OBJECT_ICONS[tab.objectType];
            const iconColor = OBJECT_COLORS[tab.objectType];
            const isActive = tab.id === activeTabId;

            return (
              <div
                key={tab.id}
                className={cn(
                  "group flex items-center min-w-0 border-r border-gray-200 hover:bg-gray-50 cursor-pointer",
                  isActive && "bg-gray-100 border-b-2 border-b-blue-600"
                )}
                onMouseDown={(e) => handleTabClick(e, tab)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="flex items-center px-3 py-2 min-w-0 flex-1">
                  {/* Icon */}
                  <div className={cn("w-6 h-6 rounded-sm flex items-center justify-center mr-2 flex-shrink-0", iconColor)}>
                    <IconComponent className="h-3 w-3 text-white" />
                  </div>

                  {/* Title */}
                  <span
                    className="text-sm font-medium text-gray-900 truncate"
                    title={tab.title}
                  >
                    {getTabTitle(tab)}
                  </span>

                  {/* Indicators */}
                  <div className="flex items-center ml-2 flex-shrink-0">
                    {tab.isPinned && (
                      <Pin className="h-3 w-3 text-gray-500 mr-1" />
                    )}
                    {tab.isDirty && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center pr-1">
                  {/* Tab Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => handlePinToggle(e, tab)}>
                        {tab.isPinned ? (
                          <>
                            <PinOff className="h-4 w-4 mr-2" />
                            Unpin Tab
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Tab
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCloseOthers(tab.id)}>
                        Close Others
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => closeTab(tab.id)}>
                        Close Tab
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200 ml-1"
                    onClick={(e) => handleCloseTab(e, tab.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Actions */}
        {tabs.length > 0 && (
          <div className="flex items-center border-l border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-3 rounded-none hover:bg-gray-50"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCloseAll}>
                  Close All Tabs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  tabs.filter(tab => !tab.isPinned).forEach(tab => closeTab(tab.id));
                }}>
                  Close Unpinned Tabs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsoleTabs;