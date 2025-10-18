'use client';

import { LucideIcon, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  type?: 'page' | 'inline';
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actions = [],
  type = 'page',
}: EmptyStateProps) {
  if (type === 'inline') {
    return (
      <div className="bg-white border border-gray-200 rounded p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        {actions.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            {actions.map((action, index) => {
              const buttonClass = action.primary
                ? 'px-4 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium'
                : 'px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium';

              if (action.href) {
                return (
                  <Link key={index} href={action.href} className={buttonClass}>
                    {action.label}
                  </Link>
                );
              }

              return (
                <button key={index} onClick={action.onClick} className={buttonClass}>
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default: full page empty state
  return (
    <div className="flex items-center justify-center h-full bg-[#f3f3f3] p-8">
      <div className="bg-white rounded border border-gray-200 p-12 max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mb-6">{description}</p>
        )}
        {actions.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            {actions.map((action, index) => {
              const buttonClass = action.primary
                ? 'px-6 py-2.5 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium'
                : 'px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium';

              if (action.href) {
                return (
                  <Link key={index} href={action.href} className={buttonClass}>
                    {action.label}
                  </Link>
                );
              }

              return (
                <button key={index} onClick={action.onClick} className={buttonClass}>
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
