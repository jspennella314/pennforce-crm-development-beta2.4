'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, Bell, HelpCircle } from 'lucide-react';

const objectTabs = [
  { href: '/dashboard', label: 'Home' },
  { href: '/leads', label: 'Leads' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/reports', label: 'Reports' },
  { href: '/dashboards', label: 'Dashboards' },
];

export default function LightningTopbar() {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-12 flex items-center px-4 gap-4">
      {/* App Selector */}
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded group">
        <div className="w-6 h-6 bg-gradient-to-br from-[#0176d3] to-[#1b96ff] rounded flex items-center justify-center text-white text-xs font-semibold">
          S
        </div>
        <span className="text-sm font-medium text-gray-900">Sales</span>
        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Object Tabs */}
      <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
        {objectTabs.map((tab) => {
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                px-3 py-1.5 text-sm whitespace-nowrap rounded relative
                ${active
                  ? 'text-[#0176d3] font-medium'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0176d3]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className={`
            w-full pl-10 pr-4 py-1.5 text-sm
            border rounded
            ${searchFocused
              ? 'border-[#0176d3] shadow-sm'
              : 'border-gray-300 hover:border-gray-400'
            }
            focus:outline-none focus:border-[#0176d3] focus:shadow-sm
            transition-all
          `}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Utility Icons */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0176d3] text-white text-sm font-medium">
          U
        </button>
      </div>
    </header>
  );
}
