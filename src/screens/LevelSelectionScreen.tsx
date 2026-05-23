import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGame } from '../context/GameContext';

type GameLevel = 1 | 2 | 3;

type LevelCard = {
  level: GameLevel;
  title: string;
  description: string;
  isPremium?: boolean;
};

const LEVELS: LevelCard[] = [
  {
    level: 1,
    title: 'Conociéndonos',
    description:
      'Preguntas ligeras para romper el hielo. Ideal para reuniones casuales.',
  },
  {
    level: 2,
    title: 'Juego previo',
    description:
      'La incomodidad sube. Secretos y confesiones que te harán ruborizar.',
  },
  {
    level: 3,
    title: 'Se 😈',
    description: 'Alto voltaje. Preguntas picantes y sin filtros.',
    isPremium: true,
  },
];

type LevelSelectionScreenProps = {
  onBack: () => void;
};

const LevelSelectionScreen = ({ onBack }: LevelSelectionScreenProps) => {
  const { startGame } = useGame();
  const [isLevel3Unlocked, setIsLevel3Unlocked] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  const handleLevelPress = (level: GameLevel) => {
    if (isWatchingAd) {
      return;
    }

    if (level === 3 && !isLevel3Unlocked) {
      setIsWatchingAd(true);

      unlockTimeoutRef.current = setTimeout(() => {
        setIsWatchingAd(false);
        setIsLevel3Unlocked(true);
        startGame(3);
        unlockTimeoutRef.current = null;
      }, 2000);

      return;
    }

    startGame(level);
  };

  return (
    <View style={styles.screen}>
      <Pressable
        onPress={onBack}
        disabled={isWatchingAd}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
          isWatchingAd && styles.backButtonDisabled,
        ]}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

      <Text style={styles.heading}>Elige la intensidad</Text>
      <Text style={styles.subheading}>
        Cada nivel cambia el tono de las preguntas
      </Text>

      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {LEVELS.map((item) => {
          const isLocked = item.level === 3 && !isLevel3Unlocked && !isWatchingAd;
          const isLoadingLevel3 = item.level === 3 && isWatchingAd;

          return (
            <Pressable
              key={item.level}
              disabled={isWatchingAd}
              onPress={() => handleLevelPress(item.level)}
              style={({ pressed }) => [
                styles.card,
                item.isPremium ? styles.cardPremium : styles.cardStandard,
                pressed && !isWatchingAd && styles.cardPressed,
                isWatchingAd && item.level !== 3 && styles.cardDisabled,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.levelTag}>Nivel {item.level}</Text>
                {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>

              {isLoadingLevel3 && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FF2E63" size="small" />
                  <Text style={styles.loadingText}>
                    Viendo anuncio para desbloquear...
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default LevelSelectionScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonDisabled: {
    opacity: 0.4,
  },
  backButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 14,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
  },
  cardStandard: {
    borderColor: '#2A2A2A',
  },
  cardPremium: {
    borderColor: '#FF2E63',
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
    marginBottom: 10,
  },
  levelTag: {
    color: '#FF2E63',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  lockIcon: {
    fontSize: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  loadingText: {
    color: '#FF2E63',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
