import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type GameLevel = 1 | 2 | 3;

type DynamicBackgroundProps = {
  currentLevel: GameLevel;
  children: ReactNode;
};

type FloatingIconConfig = {
  icon: string;
  x: `${number}%`;
  y: number;
  floatAmt: number;
  duration: number;
  delay: number;
  size: number;
  drift?: number;
};

type LevelConfig = {
  gradient: readonly [string, string];
  accent: string;
  icons: FloatingIconConfig[];
};

const LEVEL_CONFIG: Record<GameLevel, LevelConfig> = {
  1: {
    gradient: ['#1A1A2E', '#0A0A0A'] as const,
    accent: '#8B5CF6',
    icons: [
      { icon: 'glass-wine', x: '10%', y: 15, floatAmt: 22, duration: 3200, delay: 0, size: 32, drift: 8 },
      { icon: 'chat-processing', x: '76%', y: 28, floatAmt: 26, duration: 3800, delay: 800, size: 30, drift: 10 },
      { icon: 'guitar-pick', x: '18%', y: 65, floatAmt: 18, duration: 3000, delay: 400, size: 28, drift: 6 },
      { icon: 'lightbulb-outline', x: '74%', y: 78, floatAmt: 24, duration: 3500, delay: 1200, size: 34, drift: 12 },
    ],
  },
  2: {
    gradient: ['#1A0A2E', '#0A0A0A'] as const,
    accent: '#FF2E63',
    icons: [
      { icon: 'high-heel', x: '12%', y: 18, floatAmt: 20, duration: 3400, delay: 0, size: 30, drift: 8 },
      { icon: 'heart-broken', x: '74%', y: 32, floatAmt: 28, duration: 4000, delay: 600, size: 34, drift: 10 },
      { icon: 'lips', x: '20%', y: 68, floatAmt: 22, duration: 3200, delay: 1000, size: 32, drift: 6 },
      { icon: 'fire', x: '72%', y: 82, floatAmt: 18, duration: 3600, delay: 1400, size: 36, drift: 12 },
    ],
  },
  3: {
    gradient: ['#2E0A0A', '#0A0A0A'] as const,
    accent: '#4ADE80',
    icons: [
      { icon: 'handcuffs', x: '8%', y: 16, floatAmt: 24, duration: 3000, delay: 0, size: 34, drift: 8 },
      { icon: 'chili-hot', x: '78%', y: 26, floatAmt: 20, duration: 3700, delay: 500, size: 32, drift: 10 },
      { icon: 'devil', x: '14%', y: 66, floatAmt: 26, duration: 3300, delay: 900, size: 36, drift: 6 },
      { icon: 'mask', x: '76%', y: 80, floatAmt: 22, duration: 3900, delay: 1300, size: 32, drift: 12 },
    ],
  },
};

const FloatingIcon = ({ icon, x, y, floatAmt, duration, delay, size, drift, accent }: FloatingIconConfig & { accent: string }) => {
  const float = useSharedValue(0);
  const side = useSharedValue(0);

  float.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  side.value = withDelay(delay, withRepeat(withTiming(1, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }), -1, true));

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.value - 0.5) * floatAmt * 2 },
      { translateX: (side.value - 0.5) * (drift ?? 0) * 2 },
    ],
  }));

  return (
    <View style={[styles.iconBox, { left: x as any, top: `${y}%` as any }]}>
      <Animated.View style={animStyle}>
        <MaterialCommunityIcons name={icon as any} size={size} color={accent} style={{ opacity: 0.18 }} />
      </Animated.View>
    </View>
  );
};

const AmbientOrb = ({ accent }: { accent: string }) => {
  const progress = useSharedValue(0);
  progress.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);

  const style = useAnimatedStyle(() => ({
    opacity: 0.06 + progress.value * 0.04,
    transform: [
      { translateX: progress.value * 15 },
      { translateY: progress.value * -12 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          backgroundColor: accent,
          height: 260,
          right: -80,
          top: -60,
          width: 260,
        },
        style,
      ]}
    />
  );
};

const DynamicBackground = ({ currentLevel, children }: DynamicBackgroundProps) => {
  const insets = useSafeAreaInsets();
  const config = LEVEL_CONFIG[currentLevel];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...config.gradient]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.ambienceLayer}>
        <AmbientOrb accent={config.accent} />
        {config.icons.map((item, i) => (
          <FloatingIcon key={i} {...item} accent={config.accent} />
        ))}
      </View>

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export default DynamicBackground;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  ambienceLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  iconBox: {
    position: 'absolute',
  },
});
