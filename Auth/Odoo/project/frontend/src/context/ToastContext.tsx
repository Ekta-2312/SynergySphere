import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message });
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}

      {/* Toast Container */}
      <div className='fixed top-4 right-4 z-[9999] space-y-2'>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
              toast.type === 'success'
                ? 'border-l-4 border-green-500'
                : toast.type === 'error'
                  ? 'border-l-4 border-red-500'
                  : toast.type === 'warning'
                    ? 'border-l-4 border-yellow-500'
                    : 'border-l-4 border-blue-500'
            }`}
          >
            <div className='p-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  {toast.type === 'success' && (
                    <svg
                      className='h-6 w-6 text-green-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg
                      className='h-6 w-6 text-red-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  )}
                </div>
                <div className='ml-3 w-0 flex-1 pt-0.5'>
                  <p className='text-sm font-medium text-gray-900'>{toast.title}</p>
                  {toast.message && <p className='mt-1 text-sm text-gray-500'>{toast.message}</p>}
                </div>
                <div className='ml-4 flex-shrink-0 flex'>
                  <button
                    className='bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    onClick={() => removeToast(toast.id)}
                  >
                    <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                      <path
                        fillRule='evenodd'
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
