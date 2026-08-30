import { NavigationBar } from 'expo-navigation-bar';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize, useInterstitialAd, useRewardedAd } from 'react-native-google-mobile-ads';

import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import DynamicBackground from '../components/DynamicBackground';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import QuestionTimer from '../components/ui/QuestionTimer';
import Podium from '../components/Podium';
import { useGame } from '../context/GameContext';
import { getAssignableQuestions, pickRandomItem, getPlayersForGenderTarget, shuffleArray } from '../utils/game';
import { AD_UNIT_IDS } from '../ads/adUnits';
import { CHALLENGES } from '../constants/challenges';
import type { Player, Question } from '../types/game';

type GameScreenProps = {
  onQuit: () => void;
};

type TurnState = {
  player: Player;
  question: Question;
};

type AnswerState = 'idle' | 'correct' | 'incorrect';

const DECK_RESET_MESSAGE = '¡Se terminaron las preguntas! Reiniciando mazo...';
const INTERSTITIAL_INTERVAL = 25; // Cada 25 preguntas
const INTERSTITIAL_COOLDOWN_MS = 240000; // 4 minutos de cooldown

const GameScreen = ({ onQuit }: GameScreenProps) => {
  const { players, currentLevel, scores, awardPoint, isMuted, toggleMute, quitGame, startGame, recordGameSession } = useGame();
  const [turn, setTurn] = useState<TurnState | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [questionCount, setQuestionCount] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [deckResetNotice, setDeckResetNotice] = useState<string | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [isWatchingFakeAd, setIsWatchingFakeAd] = useState(false);
  const [turnKey, setTurnKey] = useState(0);
  // Modo Retos: contador de fallos por jugador (id → streak)
  const [failStreaks, setFailStreaks] = useState<Record<string, number>>({});
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const pulseOpacity = useSharedValue(1);
  const questionCountRef = useRef(0);
  const playerQueueRef = useRef<string[]>([]);
  const fakeAdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInterstitialTimeRef = useRef<number>(Date.now());
  const revanchaAdShownRef = useRef(false);

  const rewardAd = useRewardedAd(AD_UNIT_IDS.rewarded);
  const interstitialAd = useInterstitialAd(AD_UNIT_IDS.interstitial);

  useEffect(() => {
    interstitialAd.load();
  }, []);

  useEffect(() => {
    if (interstitialAd.isClosed) {
      interstitialAd.load();
    }
  }, [interstitialAd.isClosed]);

  useEffect(() => {
    if (!rewardAd.error) return;
    const err = rewardAd.error as Error & { code?: number };
    console.warn(
      `[AdMob] Error cargando rewarded (revancha): code=${err.code ?? 'N/A'} message=${err.message}`,
    );
  }, [rewardAd.error]);

  useEffect(() => {
    if (rewardAd.isLoaded) {
      console.log('[AdMob] Rewarded de revancha listo');
    }
  }, [rewardAd.isLoaded]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const triggerPulse = useCallback(() => {
    pulseOpacity.value = withSequence(
      withTiming(0.6, { duration: 150 }),
      withTiming(1, { duration: 150 }),
    );
  }, [pulseOpacity]);

  const handleExitGame = useCallback(() => {
    setShowQuitModal(false);
    recordGameSession(questionCountRef.current);
    quitGame();

    if (Platform.OS === 'android') {
      NavigationBar.setHidden(false);
    }

    onQuit();
  }, [onQuit, quitGame, recordGameSession]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setHidden(true);

      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        setShowQuitModal(true);
        return true;
      });

      return () => {
        backHandler.remove();
        NavigationBar.setHidden(false);
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!deckResetNotice) return;

    const timeout = setTimeout(() => {
      setDeckResetNotice(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [deckResetNotice]);

  const pickPlayerForQuestion = useCallback(
    (eligiblePlayers: Player[]): Player | null => {
      if (eligiblePlayers.length === 0) return null;

      if (playerQueueRef.current.length === 0) {
        playerQueueRef.current = shuffleArray(players.map((p) => p.id));
      }

      const eligibleIds = new Set(eligiblePlayers.map((p) => p.id));
      const queueIndex = playerQueueRef.current.findIndex((id) => eligibleIds.has(id));

      if (queueIndex !== -1) {
        const [chosenId] = playerQueueRef.current.splice(queueIndex, 1);
        return eligiblePlayers.find((p) => p.id === chosenId) ?? null;
      }

      const fallback = pickRandomItem(eligiblePlayers);
      if (fallback) {
        playerQueueRef.current = playerQueueRef.current.filter((id) => id !== fallback.id);
      }
      return fallback;
    },
    [players],
  );

  const handleNextQuestion = useCallback(() => {
    setAnswerState('idle');

    let pool = getAssignableQuestions(currentLevel, players, usedQuestionIds);

    if (pool.length === 0) {
      const fullLevelPool = getAssignableQuestions(currentLevel, players);

      if (fullLevelPool.length === 0) return;

      setDeckResetNotice(DECK_RESET_MESSAGE);
      setUsedQuestionIds([]);
      pool = fullLevelPool;
    }

    const question = pickRandomItem(pool);
    if (!question) return;

    const eligiblePlayers = getPlayersForGenderTarget(players, question.genderTarget);
    const player = pickPlayerForQuestion(eligiblePlayers);
    if (!player) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    triggerPulse();

    setUsedQuestionIds((prev) => [...prev, question.id]);
    setTurn({ player, question });
    setTurnKey((prev) => prev + 1);
    setQuestionCount((prev) => {
      const next = prev + 1;
      questionCountRef.current = next;

      // Interstitial cada 25 preguntas si no está en nivel 3 y se cumplió el cooldown
      if (
        next > 0 &&
        next % INTERSTITIAL_INTERVAL === 0 &&
        currentLevel !== 3 &&
        interstitialAd.isLoaded
      ) {
        const now = Date.now();
        if (now - lastInterstitialTimeRef.current >= INTERSTITIAL_COOLDOWN_MS) {
          lastInterstitialTimeRef.current = now;
          setTimeout(() => {
            interstitialAd.show();
          }, 350);
        }
      }

      return next;
    });
  }, [currentLevel, players, usedQuestionIds, triggerPulse, pickPlayerForQuestion, interstitialAd]);

  const doRevancha = useCallback(() => {
    startGame(currentLevel);
    setTurn(null);
    setAnswerState('idle');
    setQuestionCount(0);
    questionCountRef.current = 0;
    setUsedQuestionIds([]);
    setFailStreaks({});
    playerQueueRef.current = [];
    setTurnKey((prev) => prev + 1);
  }, [currentLevel, startGame]);

  const handleRevancha = useCallback(() => {
    if (rewardAd.isLoaded) {
      revanchaAdShownRef.current = true;
      rewardAd.show();
      return;
    }

    setIsWatchingFakeAd(true);
    fakeAdTimerRef.current = setTimeout(() => {
      setIsWatchingFakeAd(false);
      setShowPodium(false);
      doRevancha();
    }, 2000);
  }, [rewardAd, doRevancha]);

  // Se dispara solo si el ad fue mostrado en ESTE ciclo (revanchaAdShownRef.current === true)
  // Evita el bug donde isClosed=true del ciclo anterior dispara la revancha prematuramente
  useEffect(() => {
    if (!revanchaAdShownRef.current || !rewardAd.isClosed) return;
    revanchaAdShownRef.current = false;
    setShowPodium(false);
    doRevancha();
    rewardAd.load();
  }, [rewardAd.isClosed, doRevancha, rewardAd]);

  const handleMenuFromPodium = useCallback(() => {
    if (fakeAdTimerRef.current) {
      clearTimeout(fakeAdTimerRef.current);
      fakeAdTimerRef.current = null;
    }
    revanchaAdShownRef.current = false;
    setShowPodium(false);

    if (Platform.OS === 'android') {
      NavigationBar.setHidden(false);
    }

    quitGame();
  }, [quitGame]);

  const handleOpenPodium = useCallback(() => {
    setShowEndConfirm(false);
    recordGameSession(questionCountRef.current);
    rewardAd.load();
    setShowPodium(true);
  }, [recordGameSession, rewardAd]);

  useEffect(
    () => () => {
      if (fakeAdTimerRef.current) {
        clearTimeout(fakeAdTimerRef.current);
      }
    },
    [],
  );

  const handleCorrect = useCallback(() => {
    if (!turn) return;
    setAnswerState('correct');
    awardPoint(turn.player.id);
    // Respuesta correcta: resetear streak de este jugador
    setFailStreaks((prev) => ({ ...prev, [turn.player.id]: 0 }));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [turn, awardPoint]);

  const handleIncorrect = useCallback(() => {
    if (!turn) return;
    setAnswerState('incorrect');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const playerId = turn.player.id;
    const prevStreak = failStreaks[playerId] ?? 0;
    const newStreak = prevStreak + 1;

    if (newStreak >= 3) {
      // Streak llegó a 3: mostrar reto y resetear contador
      setFailStreaks((prev) => ({ ...prev, [playerId]: 0 }));
      const pool = CHALLENGES[currentLevel];
      const challenge = pickRandomItem(pool);
      setCurrentChallenge(challenge);
      setShowChallengeModal(true);
    } else {
      setFailStreaks((prev) => ({ ...prev, [playerId]: newStreak }));
    }
  }, [turn, failStreaks, currentLevel]);

  const handleChallengeCompleted = useCallback(() => {
    setShowChallengeModal(false);
    setCurrentChallenge(null);
  }, []);

  const genderLabel = turn?.player.gender === 'H' ? 'Hombre' : 'Mujer';

  return (
    <DynamicBackground currentLevel={currentLevel}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => setShowQuitModal(true)}
            style={({ pressed }) => [
              styles.topBarButton,
              pressed && styles.topBarButtonPressed,
            ]}
          >
            <MaterialCommunityIcons name="exit-to-app" size={16} color={colors.textDark} />
            <Text style={styles.topBarButtonText}>Salir</Text>
          </Pressable>

          <Pressable
            onPress={toggleMute}
            hitSlop={8}
            style={({ pressed }) => [
              styles.topBarButton,
              pressed && styles.topBarButtonPressed,
            ]}
          >
            <MaterialCommunityIcons
              name={isMuted ? 'volume-off' : 'volume-high'}
              size={20}
              color={isMuted ? colors.textDark : colors.text}
            />
            <Text style={[styles.topBarButtonText, { color: isMuted ? colors.textDark : colors.text }]}>
              {isMuted ? 'Mute' : 'Sonido'}
            </Text>
          </Pressable>
        </View>

        {deckResetNotice && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.resetNotice}
          >
            <MaterialCommunityIcons name="refresh" size={14} color={colors.accent} />
            <Text style={styles.resetNoticeText}>{deckResetNotice}</Text>
          </Animated.View>
        )}

        <View style={styles.main}>
          {turn ? (
            <Animated.View
              key={turnKey}
              entering={SlideInRight.duration(300).springify()}
              exiting={SlideOutLeft.duration(200)}
              style={styles.turnContainer}
            >
              <View style={styles.playerBadge}>
                <Avatar name={turn.player.name} gender={turn.player.gender} color={turn.player.avatarColor} imageIndex={turn.player.avatarIndex} size="md" />
                <View>
                  <Text style={styles.turnLabel}>Turno de:</Text>
                  <Animated.View style={pulseStyle}>
                    <Text style={styles.playerName}>{turn.player.name}</Text>
                  </Animated.View>
                  <View style={styles.genderRow}>
                    <MaterialCommunityIcons
                      name={turn.player.gender === 'H' ? 'gender-male' : 'gender-female'}
                      size={12}
                      color={colors.textDim}
                    />
                    <Text style={styles.playerGender}>{genderLabel}</Text>
                  </View>
                </View>
                <View style={[styles.scoreBadge, { borderColor: turn.player.avatarColor }]}>
                  <Text style={[styles.scoreText, { color: turn.player.avatarColor }]}>
                    {scores[turn.player.id] ?? 0}
                  </Text>
                </View>
              </View>

              <QuestionTimer turnKey={turnKey} duration={60} />

              <Card variant="glass" style={styles.questionCard}>
                <View style={styles.questionDecor} />
                <Text style={styles.questionText}>{turn.question.text}</Text>
              </Card>

              {answerState === 'idle' && (
                <View style={styles.answerRow}>
                  <Pressable
                    onPress={handleCorrect}
                    style={({ pressed }) => [
                      styles.answerBtn,
                      styles.correctBtn,
                      pressed && styles.answerBtnPressed,
                    ]}
                  >
                    <Text style={styles.answerBtnIcon}>✅</Text>
                    <Text style={styles.answerBtnText}>Respondió bien</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleIncorrect}
                    style={({ pressed }) => [
                      styles.answerBtn,
                      styles.incorrectBtn,
                      pressed && styles.answerBtnPressed,
                    ]}
                  >
                    <Text style={styles.answerBtnIcon}>❌</Text>
                    <Text style={styles.answerBtnText}>No respondió</Text>
                  </Pressable>
                </View>
              )}

              {answerState !== 'idle' && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={[
                    styles.feedbackRow,
                    answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={answerState === 'correct' ? 'party-popper' : 'emoticon-sad'}
                    size={20}
                    color={answerState === 'correct' ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      styles.feedbackText,
                      { color: answerState === 'correct' ? colors.success : colors.error },
                    ]}
                  >
                    {answerState === 'correct' ? '+1 Punto' : 'Sin punto'}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name="cards-playing-outline"
                size={48}
                color={colors.textDark}
              />
              <Text style={styles.placeholderText}>
                Presiona "Comenzar Ronda" para iniciar
              </Text>
            </View>
          )}
        </View>

        {!turn && (
          <Button
            label="Comenzar Ronda"
            onPress={handleNextQuestion}
          />
        )}

        {turn && answerState !== 'idle' && (
          <Button
            label="Siguiente Pregunta"
            onPress={handleNextQuestion}
          />
        )}

        {turn && (
          <Button
            label="Mostrar Ganador/es"
            variant="ghost"
            onPress={() => setShowEndConfirm(true)}
            style={styles.endGameBtn}
          />
        )}

        {currentLevel !== 3 && (
          <View style={styles.bannerContainer}>
            <BannerAd
              unitId={AD_UNIT_IDS.banner}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
          </View>
        )}

        <Modal
          visible={showQuitModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQuitModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons
                name="heart-broken"
                size={40}
                color={colors.accent}
              />
              <Text style={styles.modalTitle}>¿Salir del juego?</Text>
              <Text style={styles.modalSubtitle}>
                Perderás el progreso de esta ronda
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  label="Cancelar"
                  variant="ghost"
                  onPress={() => setShowQuitModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  label="Salir"
                  onPress={handleExitGame}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showEndConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEndConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons
                name="trophy"
                size={40}
                color={colors.accent}
              />
              <Text style={styles.modalTitle}>¿Mostrar Ganador/es?</Text>
              <Text style={styles.modalSubtitle}>
                Se revelará el podio con los mejores jugadores
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  label="Cancelar"
                  variant="ghost"
                  onPress={() => setShowEndConfirm(false)}
                  style={styles.modalButton}
                />
                <Button
                  label="Ver Ganador/es"
                  onPress={handleOpenPodium}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Modo Reto por 3 fallos acumulados */}
        <Modal
          visible={showChallengeModal}
          transparent
          animationType="fade"
          onRequestClose={handleChallengeCompleted}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.challengeContent]}>
              <View style={styles.challengeIconBadge}>
                <MaterialCommunityIcons
                  name="fire"
                  size={36}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.challengeBadgeText}>¡3 FALLOS ACUMULADOS!</Text>
              <Text style={styles.challengeTitle}>¡MODO RETO ACTIVADO!</Text>
              <Text style={styles.challengePlayerText}>
                {turn?.player.name} debe cumplir este castigo:
              </Text>
              <Card variant="glass" style={styles.challengeCard}>
                <Text style={styles.challengeText}>
                  {currentChallenge}
                </Text>
              </Card>
              <Button
                label="¡Reto Cumplido!"
                onPress={handleChallengeCompleted}
                style={styles.challengeButton}
              />
            </View>
          </View>
        </Modal>

        <Podium
          visible={showPodium}
          players={players}
          scores={scores}
          currentLevel={currentLevel}
          onRevancha={handleRevancha}
          onMenu={handleMenuFromPodium}
        />

        <Modal
          visible={isWatchingFakeAd}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.modalSubtitle}>Cargando anuncio corto...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </DynamicBackground>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing['4xl'],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  topBarButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  topBarButtonPressed: {
    opacity: 0.7,
  },
  topBarButtonText: {
    color: colors.textDark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  resetNotice: {
    backgroundColor: colors.accentGlow,
    borderColor: 'rgba(255, 46, 99, 0.35)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  resetNoticeText: {
    color: colors.accent,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: 18,
    flex: 1,
  },
  main: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  turnContainer: {
    alignItems: 'center',
    width: '100%',
  },
  playerBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['5xl'],
    width: '100%',
  },
  turnLabel: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacings.wider,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  playerName: {
    color: colors.text,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  playerGender: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
  },
  questionCard: {
    width: '100%',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['4xl'],
    marginBottom: spacing['5xl'],
  },
  questionDecor: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 3,
    marginBottom: spacing.xl,
    opacity: 0.4,
    width: 40,
  },
  questionText: {
    color: colors.textSecondary,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.medium,
    lineHeight: 34,
    textAlign: 'center',
  },
  placeholder: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  placeholderText: {
    color: colors.textDim,
    fontSize: fontSizes.xl,
    lineHeight: 24,
    textAlign: 'center',
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: colors.accentDim,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    marginLeft: 'auto',
    width: 36,
  },
  scoreText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  answerBtn: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  correctBtn: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
    borderWidth: 1,
  },
  incorrectBtn: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
    borderWidth: 1,
  },
  answerBtnPressed: {
    opacity: 0.6,
  },
  answerBtnIcon: {
    fontSize: 18,
  },
  answerBtnText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  feedbackRow: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  feedbackCorrect: {
    backgroundColor: colors.success + '15',
  },
  feedbackIncorrect: {
    backgroundColor: colors.error + '15',
  },
  feedbackText: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing['5xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
  endGameBtn: {
    marginTop: spacing.sm,
  },
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  challengeContent: {
    borderColor: 'rgba(255, 46, 99, 0.4)',
    borderWidth: 1.5,
    maxWidth: 340,
    backgroundColor: '#160B0E',
  },
  challengeIconBadge: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  challengeBadgeText: {
    color: colors.accent,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  },
  challengeTitle: {
    color: colors.text,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  challengePlayerText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 46, 99, 0.08)',
    borderColor: 'rgba(255, 46, 99, 0.25)',
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  challengeText: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
    textAlign: 'center',
  },
  challengeButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
});
