import React from 'react';
import { QuestionMarkCircleIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 pt-8 w-full max-w-sm text-center animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
        `}</style>
        <QuestionMarkCircleIcon />
        <h2 className="text-2xl font-bold mb-2 text-slate-800">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="w-full px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition font-semibold">
            Annuler
          </button>
          <button onClick={onConfirm} className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold">
            Oui, Archiver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;