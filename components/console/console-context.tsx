"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ConsoleTab {
  id: string;
  title: string;
  icon?: string;
  objectType: 'account' | 'contact' | 'opportunity' | 'aircraft' | 'dashboard';
  recordId?: string;
  url: string;
  isActive: boolean;
  isPinned?: boolean;
  isDirty?: boolean;
}

interface ConsoleContextType {
  tabs: ConsoleTab[];
  activeTabId: string | null;
  openTab: (tab: Omit<ConsoleTab, 'id' | 'isActive'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<ConsoleTab>) => void;
  closeAllTabs: () => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

const STORAGE_KEY = 'salesforce-console-tabs';

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<ConsoleTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Load tabs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { tabs: savedTabs, activeTabId: savedActiveId } = JSON.parse(saved);
        if (savedTabs && Array.isArray(savedTabs)) {
          setTabs(savedTabs);
          setActiveTabId(savedActiveId || null);
        }
      }
    } catch (error) {
      console.warn('Failed to load console tabs from localStorage:', error);
    }
  }, []);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
    } catch (error) {
      console.warn('Failed to save console tabs to localStorage:', error);
    }
  }, [tabs, activeTabId]);

  const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const openTab = (newTab: Omit<ConsoleTab, 'id' | 'isActive'>) => {
    // Check if tab already exists
    const existingTab = tabs.find(tab =>
      tab.url === newTab.url ||
      (tab.objectType === newTab.objectType && tab.recordId === newTab.recordId)
    );

    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const tabId = generateTabId();
    const tab: ConsoleTab = {
      ...newTab,
      id: tabId,
      isActive: true,
    };

    setTabs(prev => {
      // Deactivate all other tabs and add new one
      const updatedTabs = prev.map(t => ({ ...t, isActive: false }));
      return [...updatedTabs, tab];
    });
    setActiveTabId(tabId);
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const updatedTabs = prev.filter(tab => tab.id !== tabId);

      // If closing the active tab, set a new active tab
      if (tabId === activeTabId) {
        if (updatedTabs.length > 0) {
          const newActiveTab = updatedTabs[updatedTabs.length - 1];
          newActiveTab.isActive = true;
          setActiveTabId(newActiveTab.id);
        } else {
          setActiveTabId(null);
        }
      }

      return updatedTabs;
    });
  };

  const setActiveTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
    setActiveTabId(tabId);
  };

  const updateTab = (tabId: string, updates: Partial<ConsoleTab>) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  };

  const closeAllTabs = () => {
    setTabs([]);
    setActiveTabId(null);
  };

  const pinTab = (tabId: string) => {
    updateTab(tabId, { isPinned: true });
  };

  const unpinTab = (tabId: string) => {
    updateTab(tabId, { isPinned: false });
  };

  return (
    <ConsoleContext.Provider value={{
      tabs,
      activeTabId,
      openTab,
      closeTab,
      setActiveTab,
      updateTab,
      closeAllTabs,
      pinTab,
      unpinTab,
    }}>
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (context === undefined) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
}