import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Child, Category, WeeklyArchive } from './types';
import { 
    REWARD_TIER_1_CHORES, 
    REWARD_TIER_2_CHORES,
    REWARD_TIER_1_CASH,
    REWARD_TIER_2_CASH,
    REWARD_TIER_1_CATEGORIES,
    REWARD_TIER_2_CATEGORIES 
} from './constants';
import ChildLane from './components/ChildLane';
import Confetti from './components/Confetti';
import AddCategoryForm from './components/AddCategoryForm';
import ReminderBanner from './components/ReminderBanner';
import AvatarPickerModal from './components/AvatarPickerModal';
import { PlusIcon, ResetIcon, TrophyIcon, SyncIcon, CheckCircleIcon, ExclamationTriangleIcon } from './components/icons';
import RewardToast from './components/RewardToast';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import ConfirmationModal from './components/ConfirmationModal';
import { loadData, saveData, isJsonBinConfigured } from './services/jsonBinService';


export const calculateWeeklyEarnings = (chores: Record<string, number>): number => {
    const totalChores = Object.values(chores).reduce((sum: number, count: number) => sum + count, 0);
    const distinctCategories = Object.keys(chores).filter(catId => chores[catId] > 0).length;

    if (totalChores >= REWARD_TIER_2_CHORES && distinctCategories >= REWARD_TIER_2_CATEGORIES) {
        return REWARD_TIER_2_CASH;
    }
    if (totalChores >= REWARD_TIER_1_CHORES && distinctCategories >= REWARD_TIER_1_CATEGORIES) {
        return REWARD_TIER_1_CASH;
    }
    return 0;
};

const StatusIndicator: React.FC<{ status: 'loading' | 'saving' | 'saved' | 'error'; error: string | null }> = ({ status, error }) => {
  const statusMap = {
    loading: { text: 'Chargement...', icon: <SyncIcon className="animate-spin" />, color: 'text-blue-500' },
    saving: { text: 'Sauvegarde...', icon: <SyncIcon className="animate-spin" />, color: 'text-amber-500' },
    saved: { text: 'À jour', icon: <CheckCircleIcon />, color: 'text-green-500' },
    error: { text: error, icon: <ExclamationTriangleIcon />, color: 'text-red-500' },
  };

  const currentStatus = statusMap[status];

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${currentStatus.color} transition-colors`}>
      {currentStatus.icon}
      <span>{currentStatus.text}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  
  const [isFiringConfetti, setIsFiringConfetti] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ amount: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvatarForChild, setEditingAvatarForChild] = useState<Child | null>(null);
  
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Effet de chargement des données
  useEffect(() => {
    const fetchData = async () => {
      if (!isJsonBinConfigured()) {
        setError("Config manquante. Définir JSONBIN_BIN_ID et JSONBIN_API_KEY.");
        setStatus('error');
        setChildren([
          { id: 'child1', name: 'Alex', avatarId: 'avatar1', chores: {}, totalEarnings: 0, archive: [] },
          { id: 'child2', name: 'Léa', avatarId: 'avatar2', chores: {}, totalEarnings: 0, archive: [] },
          { id: 'child3', name: 'Tom', avatarId: 'avatar3', chores: {}, totalEarnings: 0, archive: [] },
        ]);
        setCategories([
          {id: 'cat1', name: 'Mettre la table'},
          {id: 'cat2', name: 'Débarrasser la table'},
          {id: 'cat3', name: 'Ranger sa chambre'}
        ]);
        return;
      }

      setStatus('loading');
      try {
        const data = await loadData();
        setChildren(data.children || []);
        setCategories(data.categories || []);
        setStatus('saved');
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    };
    fetchData();
  }, []);

  // Effet de sauvegarde "débattue"
  useEffect(() => {
    if (isInitialMount.current || status === 'loading') {
      isInitialMount.current = false;
      return;
    }

    if (status === 'error' || !isJsonBinConfigured()) {
      return;
    }

    setStatus('saving');
    const handler = setTimeout(async () => {
      try {
        await saveData({ children, categories });
        setStatus('saved');
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    }, 1000); // Débat de 1 seconde

    return () => {
      clearTimeout(handler);
    };
  }, [children, categories]);


  const handleMarkChore = useCallback((childId: string, categoryId: string) => {
    const newChildren = children.map(child => {
      if (child.id === childId) {
        const oldEarnings = calculateWeeklyEarnings(child.chores);
        const newChores = { ...child.chores, [categoryId]: (child.chores[categoryId] || 0) + 1 };
        const newEarnings = calculateWeeklyEarnings(newChores);

        if (newEarnings > oldEarnings) {
          setIsFiringConfetti(true);
          setRewardToast({ amount: newEarnings });
          setTimeout(() => {
              setIsFiringConfetti(false);
              setRewardToast(null);
          }, 3500);
        }
        return { ...child, chores: newChores };
      }
      return child;
    });
    setChildren(newChildren);
  }, [children]);
  
  const handleUnmarkChore = useCallback((childId: string, categoryId: string) => {
    const newChildren = children.map(child => {
        if (child.id === childId && (child.chores[categoryId] || 0) > 0) {
            const newChores = { ...child.chores, [categoryId]: child.chores[categoryId] - 1 };
            if (newChores[categoryId] === 0) delete newChores[categoryId];
            return { ...child, chores: newChores };
        }
        return child;
    });
    setChildren(newChildren);
  }, [children]);

  const handleUpdateName = (childId: string, newName: string) => {
    const newChildren = children.map(c => c.id === childId ? { ...c, name: newName } : c);
    setChildren(newChildren);
  };
  
  const handleUpdateEarnings = (childId: string, newAmount: number) => {
    const newChildren = children.map(c => c.id === childId ? { ...c, totalEarnings: newAmount } : c);
    setChildren(newChildren);
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = { id: `cat-${Date.now()}`, name };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
  };
  
  const handleDeleteCategory = useCallback((categoryId: string) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${categoryToDelete.name}" ?`)) {
        const newCategories = categories.filter(c => c.id !== categoryId);
        const newChildren = children.map(child => {
            const newChores = { ...child.chores };
            delete newChores[categoryId];
            return { ...child, chores: newChores };
        });
        setCategories(newCategories);
        setChildren(newChildren);
    }
  }, [categories, children]);

  const handleSelectAvatar = (childId: string, avatarId: string) => {
    const newChildren = children.map(c => c.id === childId ? { ...c, avatarId } : c);
    setChildren(newChildren);
    setEditingAvatarForChild(null);
  };

  const handleArchiveWeek = () => setIsConfirmingArchive(true);
  const handleConfirmArchive = () => {
    setIsConfirmingArchive(false);
    setShowWeeklySummary(true);
  };

  const finalizeWeekAndCloseSummary = () => {
    setShowWeeklySummary(false);
    setIsResetting(true);

    setTimeout(() => {
      const newChildren = children.map(child => {
        const weeklyEarnings = calculateWeeklyEarnings(child.chores);
        const totalChores = Object.values(child.chores).reduce((sum, count) => sum + count, 0);
        
        const newArchiveEntry: WeeklyArchive | null = totalChores > 0 ? {
            weekOf: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            totalChores,
            earnings: weeklyEarnings,
        } : null;

        return {
          ...child,
          chores: {},
          totalEarnings: (Number(child.totalEarnings) || 0) + weeklyEarnings,
          archive: newArchiveEntry ? [newArchiveEntry, ...(child.archive || [])] : (child.archive || []),
        };
      });

      setChildren(newChildren);
      setIsResetting(false);
    }, 500);
  };
  
  const openAvatarPicker = (childId: string) => {
    setEditingAvatarForChild(children.find(c => c.id === childId) || null);
  }

  const isArchiving = isConfirmingArchive || showWeeklySummary || isResetting;
  const isSyncing = status === 'loading' || status === 'saving';

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <Confetti isFiring={isFiringConfetti} />
      <RewardToast reward={rewardToast} />
      {isModalOpen && <AddCategoryForm onAddCategory={handleAddCategory} onClose={() => setIsModalOpen(false)} />}
      {editingAvatarForChild && (
        <AvatarPickerModal 
            onClose={() => setEditingAvatarForChild(null)}
            currentAvatarId={editingAvatarForChild.avatarId}
            onSelectAvatar={(avatarId) => handleSelectAvatar(editingAvatarForChild.id, avatarId)}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmingArchive}
        onClose={() => setIsConfirmingArchive(false)}
        onConfirm={handleConfirmArchive}
        title="Archiver la semaine ?"
        message="Cette action va calculer les gains, les ajouter au total, et préparer une nouvelle semaine."
      />
      {showWeeklySummary && (
        <WeeklySummaryModal
          children={children}
          onComplete={finalizeWeekAndCloseSummary}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <TrophyIcon />
            <h1 className="text-4xl font-bold text-slate-800">Tableau de Tâches</h1>
          </div>
          <div className="flex items-center gap-4">
             {status !== 'idle' && <StatusIndicator status={status as 'loading' | 'saving' | 'saved' | 'error'} error={error} />}
            <button
              onClick={handleArchiveWeek}
              disabled={isArchiving || isSyncing}
              className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <ResetIcon />
              Archiver la semaine
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isArchiving || isSyncing}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <PlusIcon />
              Nouvelle Tâche
            </button>
          </div>
        </header>

        <ReminderBanner children={children} />

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-500 ${isResetting || status === 'loading' ? 'opacity-0' : 'opacity-100'}`}>
          {children.map(child => (
            <ChildLane
              key={child.id}
              child={child}
              categories={categories}
              onMarkChore={handleMarkChore}
              onUnmarkChore={handleUnmarkChore}
              onUpdateName={handleUpdateName}
              onUpdateEarnings={handleUpdateEarnings}
              onOpenAvatarPicker={openAvatarPicker}
              onDeleteCategory={handleDeleteCategory}
            />
          ))}
        </div>

        <footer className="text-center text-slate-500 mt-12">
            <p>Cliquez sur l'avatar, le nom, ou le total d'argent pour modifier.</p>
            <p>Application de suivi des tâches conçue avec amour.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;