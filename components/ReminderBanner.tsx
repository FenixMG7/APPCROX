import React from 'react';
import { Child } from '../types';
import { REWARD_TIER_1_CHORES, REWARD_TIER_2_CHORES } from '../constants';

interface ReminderBannerProps {
  children: Child[];
}

const ReminderBanner: React.FC<ReminderBannerProps> = ({ children }) => {
  const today = new Date().getDay(); // Sunday - 0, Monday - 1...
  // Show reminder on Friday, Saturday, Sunday
  if (![0, 5, 6].includes(today)) {
    return null;
  }

  const reminders = children.map(child => {
    const totalChores = Object.values(child.chores).reduce((sum: number, count: number) => sum + count, 0);
    
    if (totalChores < REWARD_TIER_1_CHORES) {
      const remaining = REWARD_TIER_1_CHORES - totalChores;
      return `${child.name}, plus que ${remaining} tâche${remaining > 1 ? 's' : ''} pour ton premier objectif ! 💪`;
    }
    if (totalChores < REWARD_TIER_2_CHORES) {
      const remaining = REWARD_TIER_2_CHORES - totalChores;
      return `${child.name}, encore ${remaining} tâche${remaining > 1 ? 's' : ''} pour atteindre le grand objectif ! 🚀`;
    }
    return null;
  }).filter(Boolean);

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded-r-lg shadow">
      <p className="font-bold">Rappel de fin de semaine !</p>
      <ul className="list-disc list-inside mt-2">
        {reminders.map((msg, index) => <li key={index}>{msg}</li>)}
      </ul>
    </div>
  );
};

export default ReminderBanner;