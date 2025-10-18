'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Users, Plane, Target, CheckSquare, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/accounts', label: 'Accounts', icon: Building2 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/aircraft', label: 'Aircraft', icon: Plane },
  { href: '/opportunities', label: 'Opportunities', icon: Target },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function LightningSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-16 bg-[#032d60] flex flex-col items-center py-4 space-y-1">
      {/* App Waffle Icon */}
      <Link
        href="/dashboard"
        className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#0a4073] rounded mb-4"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="7" height="7" rx="1" />
          <rect x="2" y="12" width="7" height="7" rx="1" />
          <rect x="12" y="2" width="7" height="7" rx="1" />
          <rect x="12" y="12" width="7" height="7" rx="1" />
        </svg>
      </Link>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              w-full flex flex-col items-center py-2 px-1 text-xs
              transition-colors relative group
              ${active
                ? 'text-white bg-[#0a4073]'
                : 'text-[#a8b7c7] hover:text-white hover:bg-[#0a4073]'
              }
            `}
            title={item.label}
          >
            {/* Active indicator */}
            {active && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0176d3]" />
            )}

            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] leading-tight text-center truncate w-full px-0.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
