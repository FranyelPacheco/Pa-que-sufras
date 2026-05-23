import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import DynamicBackground from '../components/DynamicBackground';
import { QUESTIONS } from '../constants/questions';
import { useGame } from '../context/GameContext';
import type { Player, Question } from '../types/game';

type GameScreenProps = {
  onQuit: () => void;
};

type TurnState = {
  player: Player;
  question: Question;
};

const pickRandomItem = <T,>(items: T[]): T | null => {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? null;
};

const getPlayersForGenderTarget = (
  players: Player[],
  genderTarget: Question['genderTarget'],
): Player[] => {
  if (genderTarget === 'all') {
    return players;
  }

  return players.filter((player) => player.gender === genderTarget);
};

const getAssignableQuestions = (
  level: Question['level'],
  players: Player[],
  excludedIds: string[] = [],
): Question[] => {
  return QUESTIONS.filter((question) => {
    if (question.level !== level) {
      return false;
    }

    if (excludedIds.includes(question.id)) {
      return false;
    }

    const eligiblePlayers = getPlayersForGenderTarget(
      players,
      question.genderTarget,
    );
    return eligiblePlayers.length > 0;
  });
};

const DECK_RESET_MESSAGE =
  '¡Se terminaron las preguntas de este nivel! Reiniciando mazo...';

const GameScreen = ({ onQuit }: GameScreenProps) => {
  const { players, currentLevel, quitGame } = useGame();
  const [turn, setTurn] = useState<TurnState | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [deckResetNotice, setDeckResetNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!deckResetNotice) {
      return;
    }

    const timeout = setTimeout(() => {
      setDeckResetNotice(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [deckResetNotice]);

  const handleNextQuestion = useCallback(() => {
    let pool = getAssignableQuestions(currentLevel, players, usedQuestionIds);

    if (pool.length === 0) {
      const fullLevelPool = getAssignableQuestions(currentLevel, players);

      if (fullLevelPool.length === 0) {
        return;
      }

      setDeckResetNotice(DECK_RESET_MESSAGE);
      setUsedQuestionIds([]);
      pool = fullLevelPool;
    }

    const question = pickRandomItem(pool);

    if (!question) {
      return;
    }

    const eligiblePlayers = getPlayersForGenderTarget(
      players,
      question.genderTarget,
    );
    const player = pickRandomItem(eligiblePlayers);

    if (!player) {
      return;
    }

    setUsedQuestionIds((prev) => [...prev, question.id]);
    setTurn({ player, question });
    setQuestionCount((prev) => prev + 1);
  }, [currentLevel, players, usedQuestionIds]);

  const handleQuit = () => {
    quitGame();
    onQuit();
  };

  const genderLabel = turn?.player.gender === 'H' ? 'Hombre' : 'Mujer';

  return (
    <DynamicBackground currentLevel={currentLevel}>
      <View style={styles.screen}>
        <Pressable
          onPress={handleQuit}
          style={({ pressed }) => [
            styles.quitButton,
            pressed && styles.quitButtonPressed,
          ]}
        >
          <Text style={styles.quitButtonText}>Salir del juego</Text>
        </Pressable>

        {deckResetNotice && (
          <View style={styles.resetNotice}>
            <Text style={styles.resetNoticeText}>{deckResetNotice}</Text>
          </View>
        )}

        <View style={styles.main}>
          {turn ? (
            <>
              <Text style={styles.turnLabel}>Turno de:</Text>
              <Text style={styles.playerName}>{turn.player.name}</Text>
              <Text style={styles.playerGender}>{genderLabel}</Text>

              <Text style={styles.questionText}>{turn.question.text}</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>
              Pulsa "Siguiente Pregunta" para comenzar la ronda
            </Text>
          )}

          {questionCount > 0 && (
            <Text style={styles.counterText}>Pregunta #{questionCount}</Text>
          )}
        </View>

        <Pressable
          onPress={handleNextQuestion}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
        >
          <Text style={styles.nextButtonText}>Siguiente Pregunta</Text>
        </Pressable>
      </View>
    </DynamicBackground>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  quitButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  quitButtonPressed: {
    opacity: 0.7,
  },
  quitButtonText: {
    color: '#777777',
    fontSize: 13,
    fontWeight: '600',
  },
  resetNotice: {
    backgroundColor: 'rgba(255, 46, 99, 0.12)',
    borderColor: 'rgba(255, 46, 99, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resetNoticeText: {
    color: '#FF2E63',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  main: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  turnLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  playerGender: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 32,
  },
  questionText: {
    color: '#F2F2F2',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 32,
    textAlign: 'center',
  },
  placeholderText: {
    color: '#888888',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  counterText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 28,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: '#FF2E63',
    borderRadius: 12,
    paddingVertical: 16,
  },
  nextButtonPressed: {
    opacity: 0.9,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
