import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'pa-que-sufras-storage' });

const KEYS = {
  GAME_HISTORY: 'game_history',
  TOTAL_GAMES_PLAYED: 'total_games_played',
} as const;

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
    return JSON.parse(raw) as GameHistoryEntry[];
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


