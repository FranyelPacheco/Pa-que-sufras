import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type GameLevel = 1 | 2 | 3;

type DynamicBackgroundProps = {
  currentLevel: GameLevel;
  children: ReactNode;
};

const DynamicBackground = ({ currentLevel, children }: DynamicBackgroundProps) => {
  return (
    <View style={[styles.root, levelBaseStyles[currentLevel]]}>
      {currentLevel === 1 && <LevelOneAmbience />}
      {currentLevel === 2 && <LevelTwoAmbience />}
      {currentLevel === 3 && <LevelThreeAmbience />}

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const LevelOneAmbience = () => (
  <>
    <View style={[styles.glowOrb, styles.level1OrbTop]} />
    <View style={[styles.glowOrb, styles.level1OrbBottom]} />
    <View style={[styles.accentLine, styles.level1LineLeft]} />
    <View style={[styles.accentLine, styles.level1LineRight]} />
  </>
);

const LevelTwoAmbience = () => (
  <>
    <View style={[styles.glowOrb, styles.level2OrbPink]} />
    <View style={[styles.glowOrb, styles.level2OrbViolet]} />
    <View style={[styles.neonStripe, styles.level2StripeTop]} />
    <View style={[styles.neonStripe, styles.level2StripeBottom]} />
  </>
);

const LevelThreeAmbience = () => (
  <>
    <View style={[styles.glowOrb, styles.level3OrbCenter]} />
    <View style={[styles.fadeLayer, styles.level3FadeSoft]} />
    <View style={[styles.fadeLayer, styles.level3FadeMid]} />
    <View style={[styles.fadeLayer, styles.level3FadeDeep]} />
  </>
);

export default DynamicBackground;

const levelBaseStyles = StyleSheet.create({
  1: {
    backgroundColor: '#0A0A0A',
  },
  2: {
    backgroundColor: '#0F051D',
  },
  3: {
    backgroundColor: '#1A030A',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  glowOrb: {
    borderRadius: 999,
    position: 'absolute',
  },
  accentLine: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    opacity: 0.04,
    position: 'absolute',
  },
  neonStripe: {
    borderRadius: 999,
    opacity: 0.12,
    position: 'absolute',
  },
  fadeLayer: {
    backgroundColor: '#0A0A0A',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },

  // Nivel 1 — lounge elegante, luces neutras
  level1OrbTop: {
    backgroundColor: '#C8C8C8',
    height: 220,
    opacity: 0.06,
    right: -70,
    top: -40,
    width: 220,
  },
  level1OrbBottom: {
    backgroundColor: '#9A9A9A',
    bottom: 80,
    height: 180,
    left: -60,
    opacity: 0.05,
    width: 180,
  },
  level1LineLeft: {
    height: 1,
    left: 24,
    top: '32%',
    width: '28%',
  },
  level1LineRight: {
    height: 1,
    right: 24,
    top: '58%',
    width: '22%',
  },

  // Nivel 2 — club / fiesta, destellos neón
  level2OrbPink: {
    backgroundColor: '#FF2E63',
    height: 200,
    opacity: 0.14,
    right: -50,
    top: 120,
    width: 200,
  },
  level2OrbViolet: {
    backgroundColor: '#8B5CF6',
    bottom: 100,
    height: 240,
    left: -80,
    opacity: 0.1,
    width: 240,
  },
  level2StripeTop: {
    backgroundColor: '#FF2E63',
    height: 2,
    left: 32,
    top: 72,
    width: 96,
  },
  level2StripeBottom: {
    backgroundColor: '#C084FC',
    bottom: 140,
    height: 2,
    right: 40,
    width: 72,
  },

  // Nivel 3 — íntimo, degradado hacia negro
  level3OrbCenter: {
    alignSelf: 'center',
    backgroundColor: '#FF2E63',
    height: 260,
    opacity: 0.08,
    top: '18%',
    width: 260,
  },
  level3FadeSoft: {
    height: '22%',
    opacity: 0.15,
  },
  level3FadeMid: {
    height: '38%',
    opacity: 0.35,
  },
  level3FadeDeep: {
    height: '55%',
    opacity: 0.72,
  },
});
