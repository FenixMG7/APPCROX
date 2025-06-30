export interface WeeklyArchive {
  weekOf: string;
  totalChores: number;
  earnings: number;
}

export interface Chore {
  categoryId: string;
  count: number;
}

export interface Child {
  id: string;
  name: string;
  avatarId: string; // ID de l'avatar sélectionné
  chores: Record<string, number>; // Tâches de la semaine en cours
  totalEarnings: number;
  archive: WeeklyArchive[]; // Historique des semaines passées
}

export interface Category {
  id: string;
  name: string;
}