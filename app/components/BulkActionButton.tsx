'use client';

import { ReactNode } from 'react';

interface BulkActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  children: ReactNode;
}

export default function BulkActionButton({
  onClick,
  icon,
  variant = 'default',
  disabled = false,
  children,
}: BulkActionButtonProps) {
  const variantStyles = {
    default: 'bg-gray-800 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
      `}
    >
      {icon}
      {children}
    </button>
  );
}
