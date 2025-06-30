import React from 'react';
import { AVATARS } from '../constants';

interface AvatarPickerModalProps {
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
  currentAvatarId: string;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ onClose, onSelectAvatar, currentAvatarId }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Choisis un avatar</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {AVATARS.map(({ id, component: AvatarComponent }) => (
            <button
              key={id}
              onClick={() => onSelectAvatar(id)}
              className={`p-2 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-110 ${currentAvatarId === id ? 'ring-4 ring-indigo-500' : 'ring-2 ring-transparent'}`}
              aria-label={`Choisir avatar ${id}`}
            >
              <div className="rounded-full overflow-hidden w-20 h-20 mx-auto">
                 <AvatarComponent />
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition"
            >
              Fermer
            </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
