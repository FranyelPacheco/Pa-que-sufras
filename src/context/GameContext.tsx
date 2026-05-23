import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Player } from '../types/game';

type GameLevel = 1 | 2 | 3;

type GameContextValue = {
  players: Player[];
  currentLevel: GameLevel;
  isPlaying: boolean;
  addPlayer: (name: string, gender: 'H' | 'M') => void;
  removePlayer: (id: string) => void;
  startGame: (level: GameLevel) => void;
  quitGame: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

type GameProviderProps = {
  children: ReactNode;
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const addPlayer = useCallback((name: string, gender: 'H' | 'M') => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: trimmedName,
      gender,
    };

    setPlayers((prev) => [...prev, newPlayer]);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  }, []);

  const startGame = useCallback((level: GameLevel) => {
    setCurrentLevel(level);
    setIsPlaying(true);
  }, []);

  const quitGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const value = useMemo(
    () => ({
      players,
      currentLevel,
      isPlaying,
      addPlayer,
      removePlayer,
      startGame,
      quitGame,
    }),
    [
      players,
      currentLevel,
      isPlaying,
      addPlayer,
      removePlayer,
      startGame,
      quitGame,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame debe usarse dentro de un <GameProvider>.');
  }

  return context;
};
