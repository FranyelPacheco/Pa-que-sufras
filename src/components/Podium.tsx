import { useEffect, useMemo, useCallback } from 'react';
import {
  Image,
  Modal,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import Button from './ui/Button';
import type { GameLevel, Player } from '../types/game';

type PodiumPlayer = { player: Player; score: number };

type PodiumProps = {
  visible: boolean;
  players: Player[];
  scores: Record<string, number>;
  currentLevel: GameLevel;
  onRevancha: () => void;
  onMenu: () => void;
};

const BODY_IMAGES: Record<'H' | 'M', ReturnType<typeof require>> = {
  H: require('../../assets/bodies/perro_cuerpo_completo2.png'),
  M: require('../../assets/bodies/zorra_cuerpo_completo2.png'),
};

const PODIUM_HEIGHTS = {
  gold: 120,
  silver: 88,
  bronze: 62,
} as const;

const CONFETTI_COLORS = [
  '#FF2E63',
  '#4ADE80',
  '#3B82F6',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#FACC15',
];

const CONDOM_COLORS = [
  '#FF9ECD',
  '#C084FC',
  '#60A5FA',
  '#4ADE80',
  '#FACC15',
  '#FB923C',
  '#F472B6',
  '#A3E635',
];

type FallingPiece = {
  id: number;
  x: number;
  startY: number;
  endY: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  color: string;
};

const FloatingCharacter = ({ player, delay }: { player: Player; delay: number }) => {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true),
    );

    return () => {
      cancelAnimation(y);
    };
  }, [delay, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (y.value - 0.5) * 14 }],
  }));

  return (
    <Animated.View style={[styles.charWrap, style]}>
      <Image source={BODY_IMAGES[player.gender]} style={styles.charImg} resizeMode="contain" />
    </Animated.View>
  );
};

const CondomPiece = ({ color }: { color: string }) => (
  <View style={styles.condom}>
    <View style={[styles.condomTip, { borderColor: color }]} />
    <View style={[styles.condomBody, { backgroundColor: color }]} />
    <View style={[styles.condomRing, { backgroundColor: color }]} />
  </View>
);

const Piece = ({ piece, level }: { piece: FallingPiece; level: GameLevel }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: piece.duration, easing: Easing.linear }),
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [piece, progress]);

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      opacity: t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1,
      transform: [
        { translateX: piece.drift * t },
        { translateY: piece.startY + (piece.endY - piece.startY) * t },
        { rotate: `${piece.spin * t}deg` },
      ],
    };
  });

  if (level === 3) {
    return (
      <Animated.View style={[styles.piece, { left: piece.x }, style]}>
        <CondomPiece color={piece.color} />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          backgroundColor: piece.color,
          height: piece.size * 0.6,
          left: piece.x,
          width: piece.size * 0.4,
        },
        style,
      ]}
    />
  );
};

const Confetti = ({ level }: { level: GameLevel }) => {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo<FallingPiece[]>(() => {
    const count = level === 3 ? 16 : 42;
    const palette = level === 3 ? CONDOM_COLORS : CONFETTI_COLORS;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      startY: -40 - Math.random() * 120,
      endY: height + 30,
      delay: Math.random() * 1600,
      duration: 2600 + Math.random() * 2200,
      drift: (Math.random() - 0.5) * 140,
      spin: (Math.random() - 0.5) * 720,
      size: 10 + Math.random() * 10,
      color: palette[i % palette.length],
    }));
  }, [width, height, level]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p) => (
        <Piece key={p.id} piece={p} level={level} />
      ))}
    </View>
  );
};

type PodiumBlockProps = {
  player: PodiumPlayer;
  height: number;
  color: string;
  isWinner: boolean;
  index: number;
};

const PodiumBlock = ({ player, height, color, isWinner, index }: PodiumBlockProps) => (
  <View style={styles.podiumColumn}>
    <FloatingCharacter player={player.player} delay={index * 150} />

    <View style={[styles.podiumBlock, { height }]}>
      <LinearGradient
        colors={[color, color + '55']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.podiumGradient}
      />
      <MaterialCommunityIcons
        name={isWinner ? 'crown' : 'medal'}
        size={22}
        color={colors.text}
        style={styles.podiumMedal}
      />
      <Text numberOfLines={1} style={styles.podiumName}>
        {player.player.name}
      </Text>
      <Text style={[styles.podiumScore, { color: colors.text }]}>
        {player.score} {player.score === 1 ? 'punto' : 'puntos'}
      </Text>
    </View>
  </View>
);

const Podium = ({ visible, players, scores, currentLevel, onRevancha, onMenu }: PodiumProps) => {
  const ranked = useMemo<PodiumPlayer[]>(
    () =>
      [...players]
        .map((player) => ({ player, score: scores[player.id] ?? 0 }))
        .sort((a, b) => b.score - a.score),
    [players, scores],
  );

  const { topRow, bottomRow, extraTop, extraBottom, hasTie } = useMemo(() => {
    const topScore = ranked[0]?.score ?? 0;
    const winners = ranked.filter((r) => r.score === topScore);
    const rest = ranked.filter((r) => r.score !== topScore);

    if (winners.length > 1) {
      return {
        topRow: winners.slice(0, 4),
        bottomRow: rest.slice(0, 3),
        extraTop: Math.max(0, winners.length - 4),
        extraBottom: Math.max(0, rest.length - 3),
        hasTie: true,
      };
    }

    return {
      topRow: ranked.slice(0, 3),
      bottomRow: [],
      extraTop: 0,
      extraBottom: Math.max(0, ranked.length - 3),
      hasTie: false,
    };
  }, [ranked]);

  const handleSharePodium = useCallback(async () => {
    try {
      const top1 = ranked[0];
      const levelNames = {
        1: 'Conociéndonos 💬',
        2: 'Juego previo 🔥',
        3: 'Se 😈',
        4: 'Modo Personalizado ✍️',
      };

      const levelTitle = levelNames[currentLevel] ?? `Nivel ${currentLevel}`;
      let text = `🏆 ¡RESULTADOS DE LA PARTIDA! — Pa' que sufras 🔥\n`;
      text += `Intensidad: ${levelTitle}\n\n`;

      if (hasTie) {
        text += `👑 EMPATE EN ORO:\n`;
        topRow.forEach((r) => {
          text += `🥇 ${r.player.name} (${r.score} pts)\n`;
        });
      } else if (top1) {
        text += `👑 GANADOR/A: ${top1.player.name} con ${top1.score} pts\n`;
        if (ranked[1]) text += `🥈 2do: ${ranked[1].player.name} (${ranked[1].score} pts)\n`;
        if (ranked[2]) text += `🥉 3ro: ${ranked[2].player.name} (${ranked[2].score} pts)\n`;
      }

      text += `\n¿Te atreves a jugar la próxima ronda? 😈🍻`;

      await Share.share({
        message: text,
        title: "Resultados de Pa' que sufras",
      });
    } catch (err) {
      console.warn('Error compartiendo podio:', err);
    }
  }, [ranked, hasTie, topRow, currentLevel]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onMenu}>
      <View style={styles.overlay}>
        <Confetti level={currentLevel} />

        <View style={styles.card}>
          <Text style={styles.title}>Podio final</Text>
          <Text style={styles.subtitle}>Los mejores de la noche</Text>

          <View style={styles.podiumArea}>
            {hasTie ? (
              <>
                <View style={styles.tieRow}>
                  {topRow.map((r, i) => (
                    <PodiumBlock
                      key={r.player.id}
                      player={r}
                      height={PODIUM_HEIGHTS.gold}
                      color={colors.accent}
                      isWinner
                      index={i}
                    />
                  ))}
                </View>
                {extraTop > 0 && (
                  <Text style={styles.extraText}>y {extraTop} más en oro...</Text>
                )}

                {bottomRow.length > 0 && (
                  <View style={styles.tieRow}>
                    {bottomRow.map((r, i) => (
                      <PodiumBlock
                        key={r.player.id}
                        player={r}
                        height={PODIUM_HEIGHTS.silver}
                        color="#555555"
                        isWinner={false}
                        index={i}
                      />
                    ))}
                  </View>
                )}
                {extraBottom > 0 && (
                  <Text style={styles.extraText}>y {extraBottom} jugadores más...</Text>
                )}
              </>
            ) : (
              <View style={styles.classicRow}>
                {[1, 0, 2].map((order, colIndex) => {
                  const entry = topRow[order];
                  if (!entry) return <View key={colIndex} style={styles.podiumColumn} />;
                  const isFirst = order === 0;
                  const isSecond = order === 1;
                  return (
                    <PodiumBlock
                      key={entry.player.id}
                      player={entry}
                      height={
                        isFirst ? PODIUM_HEIGHTS.gold : isSecond ? PODIUM_HEIGHTS.silver : PODIUM_HEIGHTS.bronze
                      }
                      color={isFirst ? colors.accent : isSecond ? '#A8A29E' : '#8B5A2B'}
                      isWinner={isFirst}
                      index={colIndex}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {extraBottom > 0 && !hasTie && (
            <Text style={styles.extraText}>y {extraBottom} jugadores más...</Text>
          )}

          <Button
            label="📸 Compartir Podio"
            variant="outline"
            onPress={handleSharePodium}
            style={styles.shareBtn}
          />

          <View style={styles.actions}>
            <Button label="Revancha" onPress={onRevancha} style={styles.actionBtn} />
            <Button label="Menú principal" variant="ghost" onPress={onMenu} style={styles.actionBtn} />
          </View>
          <Text style={styles.adHint}>La revancha se desbloquea con un video publicitario</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Podium;

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: spacing['4xl'],
  },
  card: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  title: {
    color: colors.text,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSizes['6xl'],
    letterSpacing: letterSpacings.display,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.wider,
    marginTop: spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  podiumArea: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    width: '100%',
  },
  classicRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  tieRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  podiumColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 110,
  },
  charWrap: {
    height: 100,
    marginBottom: 4,
    width: '100%',
  },
  charImg: {
    height: '100%',
    width: '100%',
  },
  podiumBlock: {
    alignItems: 'center',
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
    width: '100%',
  },
  podiumGradient: {
    ...StyleSheet.absoluteFill,
  },
  podiumMedal: {
    marginBottom: spacing.xs,
  },
  podiumName: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
    maxWidth: '100%',
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  extraText: {
    color: colors.textDark,
    fontSize: fontSizes.xs,
    letterSpacing: letterSpacings.wide,
    marginTop: spacing.xs,
  },
  shareBtn: {
    marginTop: spacing.xl,
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  adHint: {
    color: colors.textDark,
    fontSize: fontSizes.xs,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
  condom: {
    alignItems: 'center',
  },
  condomTip: {
    borderRadius: 999,
    borderWidth: 2,
    height: 6,
    marginBottom: -2,
    width: 7,
  },
  condomBody: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    height: 16,
    opacity: 0.9,
    width: 13,
  },
  condomRing: {
    borderRadius: 2,
    height: 4,
    marginTop: -2,
    opacity: 0.9,
    width: 15,
  },
});
