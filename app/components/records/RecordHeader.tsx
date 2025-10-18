'use client';

import { ChevronDown } from 'lucide-react';

interface RecordChip {
  label: string;
  value: string | number;
}

interface RecordHeaderProps {
  title: string;
  subtitle?: string;
  chips?: RecordChip[];
  actions?: React.ReactNode;
}

export default function RecordHeader({
  title,
  subtitle,
  chips = [],
  actions,
}: RecordHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-5">
        {/* Title and Subtitle */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1.5 font-medium">{subtitle}</p>
            )}
          </div>

          {/* Action Buttons */}
          {actions && (
            <div className="flex items-center gap-2 ml-6">
              {actions}
            </div>
          )}
        </div>

        {/* Chips Row */}
        {chips.length > 0 && (
          <div className="flex items-center gap-6 text-sm border-t border-gray-100 pt-3.5 -mb-1">
            {chips.map((chip, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{chip.label}</span>
                <span className="font-semibold text-gray-900">{chip.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Action button components for easy use
export function RecordHeaderButton({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary';
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium rounded border
        transition-all duration-150 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-1
        active:scale-[0.98]
        ${variant === 'primary'
          ? 'bg-[#0176d3] text-white border-[#0176d3] hover:bg-[#014486] hover:border-[#014486] focus:ring-[#0176d3] shadow-sm hover:shadow'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-300 hover:shadow-sm'
        }
      `}
    >
      {children}
    </button>
  );
}

export function RecordHeaderDropdown({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
        {label}
        <ChevronDown className="w-4 h-4" />
      </button>
      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10 min-w-[160px]">
        {children}
      </div>
    </div>
  );
}
