import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  Easing,
} from 'react-native-reanimated';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/playfair-display';

import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';
import { fontSizes, fontWeights } from './src/theme/typography';
import { GameProvider, useGame } from './src/context/GameContext';
import { useRatePrompt } from './src/hooks/useRatePrompt';
import { useMusic } from './src/hooks/useMusic';
import GameScreen from './src/screens/GameScreen';
import LevelSelectionScreen from './src/screens/LevelSelectionScreen';
import PlayerSetupScreen from './src/screens/PlayerSetupScreen';
import SplashScreen from './src/components/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

type AppScreen = 'welcome' | 'setup' | 'level' | 'game';

const NAV_DIRECTION: Record<string, Record<string, 'forward' | 'back'>> = {
  welcome: { setup: 'forward' },
  setup: { welcome: 'back', level: 'forward' },
  level: { setup: 'back', game: 'forward' },
  game: { level: 'back' },
};

const getDirection = (from: AppScreen, to: AppScreen) =>
  NAV_DIRECTION[from]?.[to] ?? 'forward';

const AppContent = () => {
  const { isPlaying, currentLevel, isMuted } = useGame();
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const direction = useRef<'forward' | 'back'>('forward');
  const ratePrompt = useRatePrompt();
  const music = useMusic();

  const navigate = useCallback((next: AppScreen) => {
    direction.current = getDirection(screen, next);
    setScreen(next);
  }, [screen]);

  useEffect(() => {
    if (isPlaying && screen !== 'game') {
      navigate('game');
      return;
    }

    if (!isPlaying && screen === 'game') {
      music.stopAll();
      navigate('level');
    }
  }, [isPlaying, screen, navigate, music]);

  useEffect(() => {
    if (isPlaying && !isMuted) {
      music.playLevel(currentLevel);
    }
  }, [isPlaying, currentLevel, music, isMuted]);

  useEffect(() => {
    if (isPlaying && isMuted) {
      music.stopAll();
    }
  }, [isPlaying, isMuted, music]);

  const entering =
    direction.current === 'forward'
      ? SlideInRight.duration(320).easing(Easing.bezier(0.25, 0.1, 0.25, 1))
      : SlideInLeft.duration(320).easing(Easing.bezier(0.25, 0.1, 0.25, 1));

  const exiting =
    direction.current === 'forward'
      ? SlideOutLeft.duration(240).easing(Easing.bezier(0.25, 0.1, 0.25, 1))
      : SlideOutRight.duration(240).easing(Easing.bezier(0.25, 0.1, 0.25, 1));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View key={screen} entering={entering} exiting={exiting} style={StyleSheet.absoluteFill}>
        {screen === 'welcome' ? (
          <WelcomeScreen onStart={() => navigate('setup')} />
        ) : screen === 'setup' ? (
          <PlayerSetupScreen onContinue={() => navigate('level')} onBack={() => navigate('welcome')} />
        ) : screen === 'level' ? (
          <LevelSelectionScreen onBack={() => navigate('setup')} />
        ) : (
          <GameScreen onQuit={() => navigate('level')} />
        )}
      </Animated.View>

      <Modal visible={ratePrompt.showPrompt} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.rateModal}>
            <Text style={styles.rateTitle}>¿Disfrutando el juego?</Text>
            <Text style={styles.rateMessage}>Ayúdanos con una valoración en Google Play</Text>
            <Pressable style={styles.rateButton} onPress={ratePrompt.handleRate}>
              <Text style={styles.rateButtonText}>Valorar ahora</Text>
            </Pressable>
            <Pressable style={styles.laterButton} onPress={ratePrompt.handleLater}>
              <Text style={styles.laterButtonText}>Más tarde</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const App = () => {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  rateModal: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  rateTitle: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  rateMessage: {
    color: colors.textDim,
    fontSize: fontSizes.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  rateButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  rateButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  laterButton: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  laterButtonText: {
    color: colors.textDim,
    fontSize: fontSizes.sm,
  },
});
