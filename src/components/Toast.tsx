import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#171715] text-[#F5F1E8] px-4 py-3.5 rounded-xl shadow-2xl border border-[#3A3831] flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4.5 h-4.5 text-[#DCE96A] shrink-0" />
        <span className="text-xs font-medium leading-tight">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-[#9E988B] hover:text-white p-1 rounded-md"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
