import React, { useEffect, useRef } from 'react';
import { shadows, borderRadius, zIndex } from '../design-system/tokens';
import { 
  focusUtilities, 
  keyboardKeys,
  srOnly 
} from '../design-system/accessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocus,
  restoreFocus = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${React.useId()}`;
  const descriptionId = description ? `modal-description-${React.useId()}` : undefined;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus management
      const focusTarget = initialFocus?.current || modalRef.current;
      if (focusTarget) {
        setTimeout(() => {
          if (initialFocus?.current) {
            initialFocus.current.focus();
          } else {
            focusUtilities.focusFirst(modalRef.current!);
          }
        }, 0);
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to previous element
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialFocus, restoreFocus]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyboardKeys.ESCAPE && closeOnEscape) {
        e.preventDefault();
        onClose();
      }

      if (e.key === keyboardKeys.TAB && modalRef.current) {
        focusUtilities.trapFocus(modalRef.current, e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: zIndex.modal 
      }}
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl max-h-full overflow-auto
          ${sizeClasses[size]} w-full
          ${className}
        `}
        style={{
          borderRadius: borderRadius.lg,
          boxShadow: shadows['2xl'],
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen reader only close instruction */}
        <div style={srOnly}>
          Press Escape to close this dialog
        </div>

        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 
              id={titleId}
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            {description && (
              <p 
                id={descriptionId}
                className="mt-1 text-sm text-gray-600"
              >
                {description}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="
              p-2 text-gray-400 hover:text-gray-600 rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors
            "
            aria-label="Close dialog"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccessibleModal;
