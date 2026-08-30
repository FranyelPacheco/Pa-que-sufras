import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BannerAd, BannerAdSize, MobileAds, useRewardedAd } from 'react-native-google-mobile-ads';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import DynamicBackground from '../components/DynamicBackground';
import Header from '../components/ui/Header';
import CustomQuestionsModal from '../components/CustomQuestionsModal';
import { useGame } from '../context/GameContext';
import { AD_UNIT_IDS } from '../ads/adUnits';
import type { GameLevel } from '../types/game';

type LevelCardData = {
  level: GameLevel;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isPremium?: boolean;
  isCustom?: boolean;
};

const LEVELS: LevelCardData[] = [
  {
    level: 1,
    title: 'Conociéndonos',
    description: 'Rompe el hielo con preguntas ligeras.',
    icon: 'chat-processing-outline',
  },
  {
    level: 2,
    title: 'Juego previo',
    description: 'Secretos y confesiones que te harán ruborizar.',
    icon: 'fire',
  },
  {
    level: 3,
    title: 'Se 😈',
    description: 'Alto voltaje. Preguntas picantes sin filtros.',
    icon: 'emoticon-devil-outline',
    isPremium: true,
  },
  {
    level: 4,
    title: 'Modo Personalizado',
    description: 'Preguntas creadas por tu grupo. Confesiones 100% locales.',
    icon: 'pencil-box-multiple',
    isCustom: true,
    isPremium: true,
  },
];

const FAKE_AD_DURATION = 15000;

type LevelSelectionScreenProps = {
  onBack: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LevelSelectionScreen = ({ onBack }: LevelSelectionScreenProps) => {
  const {
    startGame,
    isLevel3Unlocked,
    unlockLevel3,
    isLevel4Unlocked,
    unlockLevel4,
    customQuestions,
  } = useGame();

  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [activeLoadingLevel, setActiveLoadingLevel] = useState<GameLevel | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const adsInitialized = useRef(false);
  const adShownRef = useRef(false);
  const activeAdLevelRef = useRef<GameLevel | null>(null);
  const adLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ad = useRewardedAd(AD_UNIT_IDS.rewarded);

  useEffect(() => {
    if (adsInitialized.current) return;
    adsInitialized.current = true;
    try {
      void MobileAds()
        .initialize()
        .then(() => {
          console.log('[AdMob] SDK inicializado, precargando anuncio...');
          ad.load();
        })
        .catch((err) => {
          console.warn('[AdMob] Error inicializando SDK:', err);
        });
    } catch (err) {
      console.warn('[AdMob] Error en MobileAds().initialize():', err);
    }
  }, [ad]);

  useEffect(() => {
    if (!ad.error) return;
    const err = ad.error as Error & { code?: number };
    console.warn(
      `[AdMob] Error cargando anuncio: code=${err.code ?? 'N/A'} message=${err.message}`,
    );
  }, [ad.error]);

  useEffect(() => {
    if (ad.isLoaded) {
      console.log('[AdMob] Anuncio listo para mostrarse');
    }
  }, [ad.isLoaded]);

  const startLevelGame = useCallback(
    (lvl: GameLevel) => {
      setIsWatchingAd(false);
      setActiveLoadingLevel(null);
      activeAdLevelRef.current = null;
      if (lvl === 3) unlockLevel3();
      if (lvl === 4) unlockLevel4();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      startGame(lvl);
    },
    [unlockLevel3, unlockLevel4, startGame],
  );

  const runFallbackAd = useCallback(
    (lvl: GameLevel) => {
      setIsWatchingAd(true);
      setActiveLoadingLevel(lvl);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      setTimeout(() => {
        setIsWatchingAd(false);
        setActiveLoadingLevel(null);
        startLevelGame(lvl);
      }, FAKE_AD_DURATION);
    },
    [startLevelGame],
  );

  const triggerAdUnlock = useCallback(
    (lvl: GameLevel) => {
      if (isWatchingAd) return;
      activeAdLevelRef.current = lvl;
      setActiveLoadingLevel(lvl);

      if (ad.isLoaded) {
        setIsWatchingAd(true);
        adShownRef.current = true;
        ad.show();
        return;
      }

      // Si no estaba precargado, mostrar pantalla de carga e intentar cargar
      setIsWatchingAd(true);
      ad.load();

      if (adLoadTimeoutRef.current) clearTimeout(adLoadTimeoutRef.current);
      adLoadTimeoutRef.current = setTimeout(() => {
        if (!adShownRef.current && activeAdLevelRef.current === lvl) {
          runFallbackAd(lvl);
        }
      }, 4500);
    },
    [isWatchingAd, ad, runFallbackAd],
  );

  // Si el ad termina de cargar mientras el usuario espera
  useEffect(() => {
    if (isWatchingAd && !adShownRef.current && ad.isLoaded && activeAdLevelRef.current) {
      if (adLoadTimeoutRef.current) {
        clearTimeout(adLoadTimeoutRef.current);
        adLoadTimeoutRef.current = null;
      }
      adShownRef.current = true;
      ad.show();
    }
  }, [isWatchingAd, ad.isLoaded, ad]);

  // Si hay error cargando el ad mientras el usuario esperaba
  useEffect(() => {
    if (isWatchingAd && !adShownRef.current && ad.error && activeAdLevelRef.current) {
      if (adLoadTimeoutRef.current) {
        clearTimeout(adLoadTimeoutRef.current);
        adLoadTimeoutRef.current = null;
      }
      const lvl = activeAdLevelRef.current;
      runFallbackAd(lvl);
    }
  }, [isWatchingAd, ad.error, runFallbackAd]);

  // Cuando el ad se cierra: verificar recompensa e iniciar (sin bucles ni recargas inmediatas)
  useEffect(() => {
    if (!adShownRef.current || !ad.isClosed) return;
    adShownRef.current = false;
    setIsWatchingAd(false);
    setActiveLoadingLevel(null);

    const target = activeAdLevelRef.current;
    activeAdLevelRef.current = null;

    if (ad.isEarnedReward && target) {
      startLevelGame(target);
    }
  }, [ad.isClosed, ad.isEarnedReward, startLevelGame]);

  const handleLevelPress = (level: GameLevel) => {
    if (isWatchingAd) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (level === 4) {
      // Abre el modal para ver/añadir preguntas antes de iniciar
      setShowCustomModal(true);
      return;
    }

    if (level === 3 && !isLevel3Unlocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      triggerAdUnlock(3);
      return;
    }

    startGame(level);
  };

  const handleStartCustomGameFromModal = () => {
    setShowCustomModal(false);
    if (!isLevel4Unlocked) {
      triggerAdUnlock(4);
      return;
    }
    startGame(4);
  };

  return (
    <DynamicBackground currentLevel={1}>
      <View style={styles.screen}>
        <Pressable
          onPress={onBack}
          disabled={isWatchingAd}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textDim} />
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>

        <Header
          title="Elige la intensidad"
          subtitle="Cada nivel cambia el tono de las preguntas"
        />

        <ScrollView
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
        >
          {LEVELS.map((item, index) => {
            const isLevelLocked =
              (item.level === 3 && !isLevel3Unlocked) ||
              (item.level === 4 && !isLevel4Unlocked);

            const isLocked = isLevelLocked && !isWatchingAd;
            const isLoadingThisLevel = activeLoadingLevel === item.level && isWatchingAd;
            const isUnlocked = !isLevelLocked && item.isPremium && !isWatchingAd;

            const levelColor =
              item.level === 1
                ? colors.level1
                : item.level === 2
                  ? colors.level2
                  : item.level === 3
                    ? colors.level3
                    : colors.level4;

            return (
              <Animated.View
                key={item.level}
                entering={FadeInUp.duration(400).springify().delay(index * 100)}
              >
                <AnimatedPressable
                  disabled={isWatchingAd}
                  onPress={() => handleLevelPress(item.level)}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      borderColor: item.isPremium ? levelColor.border : colors.border,
                    },
                    pressed && !isWatchingAd && styles.cardPressed,
                    isWatchingAd && activeLoadingLevel !== item.level && styles.cardDisabled,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={22}
                        color={levelColor.accent}
                      />
                      <Text style={[styles.levelTag, { color: levelColor.accent }]}>
                        Nivel {item.level}
                      </Text>
                    </View>
                    {isLocked && <LockIcon />}
                    {isUnlocked && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color={colors.success}
                      />
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>

                  {item.level === 4 && (
                    <View style={styles.customCountBadge}>
                      <MaterialCommunityIcons name="comment-text-multiple-outline" size={14} color={colors.level4.accent} />
                      <Text style={styles.customCountText}>
                        {customQuestions.length === 0
                          ? 'Toca para agregar preguntas'
                          : `${customQuestions.length} preguntas guardadas (Toca para editar)`}
                      </Text>
                    </View>
                  )}

                  {isLoadingThisLevel && (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={colors.accent} size="small" />
                      <Text style={styles.loadingText}>
                        {ad.isLoaded
                          ? 'Mostrando video publicitario...'
                          : 'Cargando video para desbloquear...'}
                      </Text>
                    </View>
                  )}
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        <CustomQuestionsModal
          visible={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onStartCustomGame={handleStartCustomGameFromModal}
        />

        <BannerAd
          unitId={AD_UNIT_IDS.banner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </DynamicBackground>
  );
};

const LockIcon = () => {
  const shake = useSharedValue(0);

  useEffect(() => {
    shake.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      ),
      2,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textDim} />
    </Animated.View>
  );
};

export default LevelSelectionScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing['4xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing['3xl'],
    paddingVertical: spacing.xs,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: colors.textDim,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  cardsContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing['3xl'],
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  levelTag: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  loadingText: {
    color: colors.accent,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  customCountBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  customCountText: {
    color: colors.level4.accent,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
});
