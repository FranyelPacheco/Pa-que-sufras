import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as Crypto from 'expo-crypto';

import type { GameLevel, Player } from '../types/game';
import { avatarColors } from '../theme/colors';
import {
  addGameToHistory,
  incrementGamesPlayed,
  getCustomQuestions,
  getMixCustomQuestionsEnabled,
  setMixCustomQuestionsEnabled,
  saveCustomQuestion,
  deleteCustomQuestion,
  type CustomQuestionEntry,
} from '../storage/mmkv';

type GameContextValue = {
  players: Player[];
  currentLevel: GameLevel;
  isPlaying: boolean;
  isLevel3Unlocked: boolean;
  isLevel4Unlocked: boolean;
  isMuted: boolean;
  scores: Record<string, number>;
  customQuestions: CustomQuestionEntry[];
  isMixEnabled: boolean;
  addPlayer: (name: string, gender: 'H' | 'M') => string | null;
  removePlayer: (id: string) => void;
  resetPlayers: () => void;
  startGame: (level: GameLevel) => void;
  quitGame: () => void;
  unlockLevel3: () => void;
  unlockLevel4: () => void;
  isNameDuplicate: (name: string) => boolean;
  awardPoint: (playerId: string) => void;
  resetScores: () => void;
  toggleMute: () => void;
  recordGameSession: (questionsAsked: number) => void;
  addCustomQuestion: (text: string, genderTarget: 'all' | 'H' | 'M') => void;
  removeCustomQuestion: (id: string) => void;
  toggleMixCustomQuestions: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

type GameProviderProps = {
  children: ReactNode;
};

const MAX_PLAYERS = 20;

export const GameProvider = ({ children }: GameProviderProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLevel3Unlocked, setIsLevel3Unlocked] = useState(false);
  const [isLevel4Unlocked, setIsLevel4Unlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionEntry[]>(() => getCustomQuestions());
  const [isMixEnabled, setIsMixEnabled] = useState<boolean>(() => getMixCustomQuestionsEnabled());

  const isNameDuplicate = useCallback(
    (name: string) => {
      const trimmed = name.trim().toLowerCase();
      return players.some((p) => p.name.toLowerCase() === trimmed);
    },
    [players],
  );

  const addPlayer = useCallback(
    (name: string, gender: 'H' | 'M'): string | null => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return 'El nombre no puede estar vacío';
      }

      if (players.length >= MAX_PLAYERS) {
        return `Máximo ${MAX_PLAYERS} jugadores`;
      }

      const duplicate = players.some(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (duplicate) {
        return 'Ya existe un jugador con ese nombre';
      }

      const newPlayer: Player = {
        id: Crypto.randomUUID(),
        name: trimmedName,
        gender,
        avatarColor: avatarColors[players.length % avatarColors.length],
        avatarIndex: players.length % 6,
      };

      setPlayers((prev) => [...prev, newPlayer]);
      return null;
    },
    [players],
  );

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  }, []);

  const resetPlayers = useCallback(() => {
    setPlayers([]);
  }, []);

  const startGame = useCallback((level: GameLevel) => {
    setCurrentLevel(level);
    setScores({});
    setIsPlaying(true);
  }, []);

  const quitGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const unlockLevel3 = useCallback(() => {
    setIsLevel3Unlocked(true);
  }, []);

  const unlockLevel4 = useCallback(() => {
    setIsLevel4Unlocked(true);
  }, []);

  const addCustomQuestion = useCallback((text: string, genderTarget: 'all' | 'H' | 'M') => {
    saveCustomQuestion({ text, genderTarget });
    setCustomQuestions(getCustomQuestions());
  }, []);

  const removeCustomQuestion = useCallback((id: string) => {
    deleteCustomQuestion(id);
    setCustomQuestions(getCustomQuestions());
  }, []);

  const toggleMixCustomQuestions = useCallback(() => {
    setIsMixEnabled((prev) => {
      const next = !prev;
      setMixCustomQuestionsEnabled(next);
      return next;
    });
  }, []);

  const awardPoint = useCallback((playerId: string) => {
    setScores((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] ?? 0) + 1,
    }));
  }, []);

  const resetScores = useCallback(() => {
    setScores({});
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const recordGameSession = useCallback(
    (questionsAsked: number) => {
      incrementGamesPlayed();
      addGameToHistory({
        date: new Date().toISOString(),
        level: currentLevel,
        playerCount: players.length,
        questionsAsked,
      });
    },
    [currentLevel, players.length],
  );

  const value = useMemo(
    () => ({
      players,
      currentLevel,
      isPlaying,
      isLevel3Unlocked,
      isLevel4Unlocked,
      isMuted,
      scores,
      customQuestions,
      isMixEnabled,
      addPlayer,
      removePlayer,
      resetPlayers,
      startGame,
      quitGame,
      unlockLevel3,
      unlockLevel4,
      isNameDuplicate,
      awardPoint,
      resetScores,
      toggleMute,
      recordGameSession,
      addCustomQuestion,
      removeCustomQuestion,
      toggleMixCustomQuestions,
    }),
    [
      players,
      currentLevel,
      isPlaying,
      isLevel3Unlocked,
      isLevel4Unlocked,
      isMuted,
      scores,
      customQuestions,
      isMixEnabled,
      addPlayer,
      removePlayer,
      resetPlayers,
      startGame,
      quitGame,
      unlockLevel3,
      unlockLevel4,
      isNameDuplicate,
      awardPoint,
      resetScores,
      toggleMute,
      recordGameSession,
      addCustomQuestion,
      removeCustomQuestion,
      toggleMixCustomQuestions,
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
