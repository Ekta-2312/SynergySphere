import React from 'react';

interface GoogleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onClick,
  disabled = false,
  children,
  className = '',
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};
