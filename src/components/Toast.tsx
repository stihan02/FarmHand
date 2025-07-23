import React from 'react';
import { ToastType } from './ToastContext';

interface ToastProps {
  toasts: { id: number; type: ToastType; message: string }[];
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

const Toast: React.FC<ToastProps> = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`min-w-[220px] px-4 py-2 rounded shadow-lg flex items-center gap-2 ${typeStyles[toast.type]}`}
        role="alert"
      >
        {toast.type === 'success' && <span>✅</span>}
        {toast.type === 'error' && <span>❌</span>}
        {toast.type === 'info' && <span>ℹ️</span>}
        <span>{toast.message}</span>
      </div>
    ))}
  </div>
);

export default Toast; 