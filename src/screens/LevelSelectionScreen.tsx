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
import { BannerAd, BannerAdSize, MobileAds, useRewardedInterstitialAd } from 'react-native-google-mobile-ads';
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
import { useGame } from '../context/GameContext';
import { AD_UNIT_IDS } from '../ads/adUnits';

type GameLevel = 1 | 2 | 3;

type LevelCardData = {
  level: GameLevel;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isPremium?: boolean;
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
];

const FAKE_AD_DURATION = 2000;

type LevelSelectionScreenProps = {
  onBack: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LevelSelectionScreen = ({ onBack }: LevelSelectionScreenProps) => {
  const { startGame, isLevel3Unlocked, unlockLevel3 } = useGame();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const adsInitialized = useRef(false);
  // Ref de control: true solo cuando ad.show() fue llamado en este ciclo.
  const adShownRef = useRef(false);
  // Timeout de respaldo si el ad no carga en 5 segundos.
  const adLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ad = useRewardedInterstitialAd(AD_UNIT_IDS.rewardedInterstitial);

  useEffect(() => {
    if (adsInitialized.current) return;
    adsInitialized.current = true;
    try {
      void MobileAds()
        .initialize()
        .then(() => {
          console.log('[AdMob] SDK inicializado, precargando rewarded interstitial...');
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
      `[AdMob] Error cargando rewarded interstitial: code=${err.code ?? 'N/A'} message=${err.message}`,
    );
  }, [ad.error]);

  useEffect(() => {
    if (ad.isLoaded) {
      console.log('[AdMob] Rewarded interstitial listo para mostrarse');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [ad.isLoaded]);

  const startLevel3Game = useCallback(() => {
    setIsWatchingAd(false);
    setPendingStart(false);
    unlockLevel3();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startGame(3);
  }, [unlockLevel3, startGame]);

  const runFallbackAd = useCallback(() => {
    setIsWatchingAd(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    setTimeout(() => {
      setIsWatchingAd(false);
      setPendingStart(false);
      startLevel3Game();
    }, FAKE_AD_DURATION);
  }, [startLevel3Game]);

  // Effect: cuando el ad está listo (o falla), actuar sobre pendingStart
  useEffect(() => {
    if (!pendingStart) return;

    if (ad.isLoaded) {
      if (adLoadTimeoutRef.current) clearTimeout(adLoadTimeoutRef.current);
      setIsWatchingAd(true);
      adShownRef.current = true;
      ad.show();
      setPendingStart(false);
      return;
    }

    if (ad.error) {
      if (adLoadTimeoutRef.current) clearTimeout(adLoadTimeoutRef.current);
      setPendingStart(false);
      runFallbackAd();
      return;
    }

    // Ad aún cargando — fallback automático a los 5 segundos
    adLoadTimeoutRef.current = setTimeout(() => {
      setPendingStart(false);
      runFallbackAd();
    }, 5000);

    return () => {
      if (adLoadTimeoutRef.current) {
        clearTimeout(adLoadTimeoutRef.current);
        adLoadTimeoutRef.current = null;
      }
    };
  }, [pendingStart, ad.isLoaded, ad.error, runFallbackAd]);

  // Effect: ad cerrado — leer isEarnedReward directamente aquí (no en callback)
  // para evitar el stale closure que causaba que startLevel3Game nunca se llamara
  useEffect(() => {
    if (!adShownRef.current || !ad.isClosed) return;
    adShownRef.current = false;
    setIsWatchingAd(false);
    ad.load(); // Precarga el siguiente
    if (ad.isEarnedReward) {
      startLevel3Game();
    }
  }, [ad.isClosed, ad.isEarnedReward, startLevel3Game]);

  const handleLevelPress = (level: GameLevel) => {
    if (isWatchingAd) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (level === 3 && !isLevel3Unlocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      ad.load();
      setPendingStart(true);
      return;
    }

    startGame(level);
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
            const isLocked = item.level === 3 && !isLevel3Unlocked && !isWatchingAd;
            const isLoadingLevel3 = item.level === 3 && isWatchingAd;
            const isUnlocked = item.level === 3 && isLevel3Unlocked && !isWatchingAd;
            const levelColor = item.level === 1 ? colors.level1 : item.level === 2 ? colors.level2 : colors.level3;

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
                    isWatchingAd && item.level !== 3 && styles.cardDisabled,
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

                  {isLoadingLevel3 && (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={colors.accent} size="small" />
                      <Text style={styles.loadingText}>
                        {ad.isLoaded
                          ? 'Preparando anuncio...'
                          : 'Cargando anuncio para desbloquear...'}
                      </Text>
                    </View>
                  )}
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </ScrollView>

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
});
