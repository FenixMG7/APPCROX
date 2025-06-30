import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Child, Category, WeeklyArchive } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, HistoryIcon } from './icons';
import { getAvatarComponent } from '../constants';
import {
  REWARD_TIER_1_CHORES,
  REWARD_TIER_1_CASH,
  REWARD_TIER_1_CATEGORIES,
  REWARD_TIER_2_CHORES,
  REWARD_TIER_2_CASH,
  REWARD_TIER_2_CATEGORIES,
} from '../constants';

interface ChildLaneProps {
  child: Child;
  categories: Category[];
  onMarkChore: (childId: string, categoryId: string) => void;
  onUnmarkChore: (childId: string, categoryId: string) => void;
  onUpdateName: (childId: string, newName: string) => void;
  onUpdateEarnings: (childId: string, newAmount: number) => void;
  onOpenAvatarPicker: (childId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const ChildLane: React.FC<ChildLaneProps> = ({ child, categories, onMarkChore, onUnmarkChore, onUpdateName, onUpdateEarnings, onOpenAvatarPicker, onDeleteCategory }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEarnings, setIsEditingEarnings] = useState(false);
  const [tempName, setTempName] = useState(child.name);
  const [tempEarnings, setTempEarnings] = useState(child.totalEarnings.toString());
  const [highlightTotal, setHighlightTotal] = useState(false);
  const prevTotalEarningsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevTotalEarningsRef.current !== undefined && child.totalEarnings > prevTotalEarningsRef.current) {
        setHighlightTotal(true);
        const timer = setTimeout(() => {
            setHighlightTotal(false);
        }, 1200);
        return () => clearTimeout(timer);
    }
    prevTotalEarningsRef.current = child.totalEarnings;
  }, [child.totalEarnings]);


  const { totalChores, distinctCategories, weeklyEarnings } = useMemo(() => {
    const chores = Object.values(child.chores);
    const total = chores.reduce((sum: number, count: number) => sum + count, 0);
    const distinct = Object.keys(child.chores).filter(catId => child.chores[catId] > 0).length;
    
    let earnings = 0;
    if (total >= REWARD_TIER_2_CHORES && distinct >= REWARD_TIER_2_CATEGORIES) {
        earnings = REWARD_TIER_2_CASH;
    } else if (total >= REWARD_TIER_1_CHORES && distinct >= REWARD_TIER_1_CATEGORIES) {
        earnings = REWARD_TIER_1_CASH;
    }
    return { totalChores: total, distinctCategories: distinct, weeklyEarnings: earnings };
  }, [child.chores]);

  const progressPercentage = Math.min((totalChores / REWARD_TIER_2_CHORES) * 100, 100);
  const AvatarComponent = getAvatarComponent(child.avatarId);

  const handleNameBlur = () => {
    if (tempName.trim()) {
      onUpdateName(child.id, tempName.trim());
    } else {
      setTempName(child.name);
    }
    setIsEditingName(false);
  };
  
  const handleEarningsBlur = () => {
    const newAmount = parseFloat(tempEarnings);
    if (!isNaN(newAmount)) {
      onUpdateEarnings(child.id, newAmount);
    } else {
      setTempEarnings(child.totalEarnings.toString());
    }
    setIsEditingEarnings(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
            <button onClick={() => onOpenAvatarPicker(child.id)} className="w-16 h-16 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105" aria-label={`Changer l'avatar de ${child.name}`}>
                <AvatarComponent />
            </button>
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
                className="text-2xl font-bold bg-slate-100 rounded p-1 -m-1 w-36"
                autoFocus
              />
            ) : (
              <h2 onClick={() => setIsEditingName(true)} className="text-2xl font-bold text-slate-800 cursor-pointer">{child.name}</h2>
            )}
        </div>

        <div className="text-right flex-shrink-0">
            <div className="text-xs text-slate-500">Gains semaine</div>
            <div className="text-2xl font-bold text-indigo-600">{weeklyEarnings} €</div>
        </div>
      </div>
      
      <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>Progression ({totalChores}/{REWARD_TIER_2_CHORES})</span>
              <span>Objectif: {REWARD_TIER_2_CASH} €</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex justify-between items-center">
            <span>Catégories distinctes: <span className="font-semibold">{distinctCategories}</span></span>
            <span className="text-right font-medium">But: {REWARD_TIER_1_CATEGORIES} pour {REWARD_TIER_1_CASH}€ / {REWARD_TIER_2_CATEGORIES} pour {REWARD_TIER_2_CASH}€</span>
          </div>
      </div>

      <div className="flex-grow space-y-3 pr-2 -mr-2 overflow-y-auto max-h-48 custom-scrollbar">
        {categories.length === 0 && <p className="text-slate-500 text-center py-4">Ajoutez une catégorie pour commencer !</p>}
        {categories.map(category => (
          <div key={category.id} className="group flex items-center justify-between bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-1.5 min-w-0">
                <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="flex-shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 focus:opacity-100"
                    aria-label={`Supprimer la tâche ${category.name}`}
                >
                    <TrashIcon />
                </button>
                <span className="text-slate-700 truncate">{category.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-bold text-lg text-slate-800 w-8 text-center">{child.chores[category.id] || 0}</span>
              <button
                onClick={() => onUnmarkChore(child.id, category.id)}
                aria-label={`Retirer une tâche ${category.name}`}
                className="bg-slate-200 text-slate-600 rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-300 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(child.chores[category.id] || 0) === 0}
              >
                <MinusIcon />
              </button>
              <button
                onClick={() => onMarkChore(child.id, category.id)}
                aria-label={`Ajouter une tâche ${category.name}`}
                className="bg-indigo-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-transform"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
        <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
                <HistoryIcon />
                Historique des semaines
            </h3>
            <div className="space-y-2 max-h-24 overflow-y-auto pr-2 -mr-2 text-sm custom-scrollbar">
                {(child.archive || []).length === 0 ? (
                    <p className="text-slate-400 text-xs italic">Aucun historique pour le moment.</p>
                ) : (
                    (child.archive || []).map((entry, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                            <span className="text-slate-600 font-medium">{entry.weekOf}</span>
                            <span className="text-slate-800 font-bold">{entry.totalChores} tâches / {entry.earnings} €</span>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-600">Argent total :</span>
            {isEditingEarnings ? (
              <input
                type="number"
                step="0.01"
                value={tempEarnings}
                onChange={(e) => setTempEarnings(e.target.value)}
                onBlur={handleEarningsBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleEarningsBlur()}
                className="text-xl font-bold bg-slate-100 rounded p-1 -m-1 w-24 text-right"
                autoFocus
              />
            ) : (
                <div 
                    onClick={() => setIsEditingEarnings(true)} 
                    className={`text-xl font-bold p-1 -m-1 cursor-pointer transition-all duration-300 ease-in-out ${highlightTotal ? 'scale-125 text-emerald-500' : 'text-green-600'}`}
                >
                    {child.totalEarnings.toFixed(2)} €
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChildLane;