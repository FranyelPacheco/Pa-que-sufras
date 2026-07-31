import { QUESTIONS } from '../constants/questions';
import type { Player, Question } from '../types/game';

export const pickRandomItem = <T,>(items: T[]): T | null => {
  if (items.length === 0) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? null;
};

export const shuffleArray = <T,>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getPlayersForGenderTarget = (
  players: Player[],
  genderTarget: Question['genderTarget'],
): Player[] => {
  if (genderTarget === 'all') return players;
  return players.filter((player) => player.gender === genderTarget);
};

export const getAssignableQuestions = (
  level: Question['level'],
  players: Player[],
  excludedIds: string[] = [],
): Question[] => {
  return QUESTIONS.filter((question) => {
    if (question.level !== level) return false;
    if (excludedIds.includes(question.id)) return false;
    const eligiblePlayers = getPlayersForGenderTarget(players, question.genderTarget);
    return eligiblePlayers.length > 0;
  });
};
