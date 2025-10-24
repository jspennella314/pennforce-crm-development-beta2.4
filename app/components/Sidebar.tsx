'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Accounts', href: '/accounts', icon: '🏢' },
  { name: 'Contacts', href: '/contacts', icon: '👥' },
  { name: 'Aircraft', href: '/aircraft', icon: '✈️' },
  { name: 'Opportunities', href: '/opportunities', icon: '💼' },
  { name: 'Tasks', href: '/tasks', icon: '✓' },
  { name: 'Activities', href: '/activities', icon: '📝' },
  { name: 'Calendar', href: '/calendar', icon: '📅' },
  { name: 'Workflows', href: '/workflows', icon: '⚡' },
  { name: 'Reports', href: '/reports', icon: '📈' },
];

// Marketing campaigns navigation items
const marketingNavigation = [
  { name: 'Mailing Lists', href: '/mailing-lists', icon: '📋' },
  { name: 'Email Campaigns', href: '/email-campaigns', icon: '📧' },
];

const settingsNavigation = [
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">PennForce CRM</h1>
          <NotificationBell />
        </div>
        <p className="text-gray-400 text-sm mb-4">Aviation Management</p>
        <GlobalSearch />
      </div>

      <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}

        {/* Marketing Campaigns Section */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Marketing Campaigns
            </h3>
          </div>
          {marketingNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-colors
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          {settingsNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-colors
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-800">
        <div className="p-4 relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 w-full hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {getInitials(session?.user?.name)}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{session?.user?.name || 'User'}</div>
              <div className="text-xs text-gray-400 capitalize">{session?.user?.role || 'User'}</div>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <Link
                href="/profile"
                className="block px-4 py-3 hover:bg-gray-700 transition-colors text-sm"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Settings</span>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-sm text-red-400"
              >
                <div className="flex items-center gap-2">
                  <span>🚪</span>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
