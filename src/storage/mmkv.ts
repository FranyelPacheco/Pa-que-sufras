import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'pa-que-sufras-storage' });

const KEYS = {
  GAME_HISTORY: 'game_history',
  TOTAL_GAMES_PLAYED: 'total_games_played',
  CUSTOM_QUESTIONS: 'custom_questions',
  MIX_CUSTOM_QUESTIONS: 'mix_custom_questions',
} as const;

export type CustomQuestionEntry = {
  id: string;
  text: string;
  genderTarget: 'all' | 'H' | 'M';
  createdAt: string;
};

export const getTotalGamesPlayed = (): number => {
  return storage.getNumber(KEYS.TOTAL_GAMES_PLAYED) ?? 0;
};

export const incrementGamesPlayed = (): void => {
  const current = getTotalGamesPlayed();
  storage.set(KEYS.TOTAL_GAMES_PLAYED, current + 1);
};

export type GameHistoryEntry = {
  date: string;
  level: number;
  playerCount: number;
  questionsAsked: number;
};

export const getGameHistory = (): GameHistoryEntry[] => {
  const raw = storage.getString(KEYS.GAME_HISTORY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GameHistoryEntry[]) : [];
  } catch {
    return [];
  }
};

export const addGameToHistory = (entry: GameHistoryEntry): void => {
  const history = getGameHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 50);
  storage.set(KEYS.GAME_HISTORY, JSON.stringify(trimmed));
};

export const getCustomQuestions = (): CustomQuestionEntry[] => {
  const raw = storage.getString(KEYS.CUSTOM_QUESTIONS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomQuestionEntry[]) : [];
  } catch {
    return [];
  }
};

export const saveCustomQuestion = (question: Omit<CustomQuestionEntry, 'id' | 'createdAt'>): CustomQuestionEntry => {
  const list = getCustomQuestions();
  const newEntry: CustomQuestionEntry = {
    id: `cq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: question.text.trim(),
    genderTarget: question.genderTarget,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newEntry);
  storage.set(KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
  return newEntry;
};

export const deleteCustomQuestion = (id: string): void => {
  const list = getCustomQuestions().filter((q) => q.id !== id);
  storage.set(KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
};

export const getMixCustomQuestionsEnabled = (): boolean => {
  return storage.getBoolean(KEYS.MIX_CUSTOM_QUESTIONS) ?? false;
};

export const setMixCustomQuestionsEnabled = (enabled: boolean): void => {
  storage.set(KEYS.MIX_CUSTOM_QUESTIONS, enabled);
};


