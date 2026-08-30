import { QUESTIONS } from '../constants/questions';
import { getCustomQuestions, getMixCustomQuestionsEnabled } from '../storage/mmkv';
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
  // 1. Cargar preguntas personalizadas de MMKV
  const customList = getCustomQuestions().map(
    (cq): Question => ({
      id: cq.id,
      text: cq.text,
      level: 4,
      genderTarget: cq.genderTarget,
    }),
  );

  let pool: Question[] = [];

  if (level === 4) {
    // Si es nivel 4, el mazo principal son las personalizadas
    pool = customList;
  } else {
    // Si es nivel 1, 2 o 3, cargar las oficiales
    pool = QUESTIONS.filter((q) => q.level === level);
    // Si el usuario activó mezclar preguntas personalizadas, agregarlas
    if (getMixCustomQuestionsEnabled() && customList.length > 0) {
      pool = [...pool, ...customList];
    }
  }

  return pool.filter((question) => {
    if (excludedIds.includes(question.id)) return false;
    const eligiblePlayers = getPlayersForGenderTarget(players, question.genderTarget);
    return eligiblePlayers.length > 0;
  });
};
