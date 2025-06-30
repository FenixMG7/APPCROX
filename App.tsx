import React, { useState, useEffect, useCallback } from 'react';
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
import { PlusIcon, ResetIcon, TrophyIcon } from './components/icons';
import RewardToast from './components/RewardToast';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import ConfirmationModal from './components/ConfirmationModal';
import { db } from './services/firebaseService';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ConfigError } from './components/ConfigError';


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


const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFiringConfetti, setIsFiringConfetti] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ amount: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvatarForChild, setEditingAvatarForChild] = useState<Child | null>(null);
  
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Si la base de données n'est pas configurée, afficher un message d'erreur clair.
  if (!db) {
    return <ConfigError />;
  }

  // Référence au document Firestore
  const dataDocRef = doc(db, 'choreBoard', 'mainState');

  useEffect(() => {
    const unsubscribe = onSnapshot(dataDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setChildren(data.children || []);
            setCategories(data.categories || []);
        } else {
            // Le document n'existe pas, on initialise avec des données par défaut
            const defaultChildren: Child[] = [
                { id: 'child1', name: 'Enfant 1', avatarId: 'avatar1', chores: {}, totalEarnings: 0, archive: [] },
                { id: 'child2', name: 'Enfant 2', avatarId: 'avatar2', chores: {}, totalEarnings: 0, archive: [] },
                { id: 'child3', name: 'Enfant 3', avatarId: 'avatar3', chores: {}, totalEarnings: 0, archive: [] },
            ];
            const defaultCategories: Category[] = [
                {id: 'cat1', name: 'Mettre la table'},
                {id: 'cat2', name: 'Débarrasser la table'},
                {id: 'cat3', name: 'Ranger sa chambre'}
            ];
            
            setChildren(defaultChildren);
            setCategories(defaultCategories);
            
            // On sauvegarde ces données par défaut dans Firestore
            setDoc(dataDocRef, { children: defaultChildren, categories: defaultCategories });
        }
    });

    // Nettoyage de l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [dataDocRef]);


  const persistState = async (newState: { children?: Child[]; categories?: Category[] }) => {
    if (dataDocRef) {
      try {
        await setDoc(dataDocRef, newState, { merge: true });
      } catch (error) {
        console.error("Erreur de sauvegarde sur Firestore : ", error);
        // On pourrait implémenter une logique pour annuler la mise à jour optimiste ici
      }
    }
  };

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
    setChildren(newChildren); // Mise à jour optimiste
    persistState({ children: newChildren });
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
    persistState({ children: newChildren });
  }, [children]);

  const handleUpdateName = (childId: string, newName: string) => {
    const newChildren = children.map(c => c.id === childId ? { ...c, name: newName } : c);
    setChildren(newChildren);
    persistState({ children: newChildren });
  };
  
  const handleUpdateEarnings = (childId: string, newAmount: number) => {
    const newChildren = children.map(c => c.id === childId ? { ...c, totalEarnings: newAmount } : c);
    setChildren(newChildren);
    persistState({ children: newChildren });
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = { id: `cat-${Date.now()}`, name };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    persistState({ categories: newCategories });
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
        persistState({ children: newChildren, categories: newCategories });
    }
  }, [categories, children]);

  const handleSelectAvatar = (childId: string, avatarId: string) => {
    const newChildren = children.map(c => c.id === childId ? { ...c, avatarId } : c);
    setChildren(newChildren);
    persistState({ children: newChildren });
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
      persistState({ children: newChildren });
      setIsResetting(false);
    }, 500);
  };
  
  const openAvatarPicker = (childId: string) => {
    setEditingAvatarForChild(children.find(c => c.id === childId) || null);
  }

  const isArchiving = isConfirmingArchive || showWeeklySummary || isResetting;

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
          <div className="flex gap-4">
            <button
              onClick={handleArchiveWeek}
              disabled={isArchiving || !dataDocRef}
              className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-wait"
            >
              <ResetIcon />
              Archiver la semaine
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isArchiving || !dataDocRef}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              <PlusIcon />
              Nouvelle Tâche
            </button>
          </div>
        </header>

        <ReminderBanner children={children} />

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-500 ${isResetting ? 'opacity-0' : 'opacity-100'}`}>
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
