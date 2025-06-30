import React from 'react';
import { Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6 } from './components/avatars';

export const REWARD_TIER_1_CHORES = 10;
export const REWARD_TIER_1_CASH = 3;
export const REWARD_TIER_1_CATEGORIES = 2;

export const REWARD_TIER_2_CHORES = 15;
export const REWARD_TIER_2_CASH = 5;
export const REWARD_TIER_2_CATEGORIES = 3;

export const AVATARS: { id: string, component: React.FC }[] = [
  { id: 'avatar1', component: Avatar1 },
  { id: 'avatar2', component: Avatar2 },
  { id: 'avatar3', component: Avatar3 },
  { id: 'avatar4', component: Avatar4 },
  { id: 'avatar5', component: Avatar5 },
  { id: 'avatar6', component: Avatar6 },
];

export const getAvatarComponent = (avatarId?: string) => {
    return AVATARS.find(a => a.id === avatarId)?.component || Avatar1;
}
