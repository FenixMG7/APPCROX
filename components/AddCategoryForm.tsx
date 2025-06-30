
import React, { useState } from 'react';
import { suggestChore } from '../services/geminiService';
import { MagicWandIcon, PlusIcon } from './icons';

interface AddCategoryFormProps {
  onAddCategory: (name: string) => void;
  onClose: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onAddCategory, onClose }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      onClose();
    }
  };

  const handleSuggestChore = async () => {
    setIsSuggesting(true);
    const suggestion = await suggestChore();
    setNewCategoryName(suggestion);
    setIsSuggesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Nouvelle Catégorie de Tâche</h2>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Ranger sa chambre"
              className="w-full p-3 pr-20 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={isSuggesting}
            />
            <button
              type="button"
              onClick={handleSuggestChore}
              disabled={isSuggesting}
              className="absolute inset-y-0 right-0 flex items-center px-4 bg-purple-100 text-purple-600 rounded-r-lg hover:bg-purple-200 transition disabled:opacity-50 disabled:cursor-wait"
            >
              {isSuggesting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              ) : (
                <MagicWandIcon />
              )}
              <span className="ml-2 hidden sm:inline">Suggérer</span>
            </button>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-indigo-300"
              disabled={!newCategoryName.trim()}
            >
              <PlusIcon /> Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;
