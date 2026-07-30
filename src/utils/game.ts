import { QUESTIONS } from '../constants/questions';
import type { Player, Question } from '../types/game';

export const pickRandomItem = <T,>(items: T[]): T | null => {
  if (items.length === 0) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? null;
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
