import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { fontSizes, fontWeights } from '../../theme/typography';

type QuestionTimerProps = {
  turnKey: number;
  duration?: number;
};

const QuestionTimer = ({ turnKey, duration = 60 }: QuestionTimerProps) => {
  const [remaining, setRemaining] = useState(duration);
  const [expired, setExpired] = useState(false);
  const progress = useSharedValue(1);

  useEffect(() => {
    setRemaining(duration);
    setExpired(false);
    progress.value = 1;
    progress.value = withTiming(0, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [turnKey, duration, progress]);

  useEffect(() => {
    const warningMs = (duration - 10) * 1000;
    const warningTimeout = setTimeout(() => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, Math.max(warningMs, 0));
    return () => clearTimeout(warningTimeout);
  }, [turnKey, duration]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExpired(true);
    }, duration * 1000);
    return () => clearTimeout(timeout);
  }, [turnKey, duration]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            barStyle,
          ]}
        />
      </View>
      {expired ? (
        <Text style={styles.expiredLabel}>⏰</Text>
      ) : (
        <Text style={styles.label}>{remaining}s</Text>
      )}
    </View>
  );
};

export default QuestionTimer;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['5xl'],
    width: '100%',
  },
  track: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },
  bar: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    height: '100%',
    transformOrigin: 'left',
  },
  label: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    textAlign: 'right',
    width: 28,
  },
  expiredLabel: {
    fontSize: 16,
    textAlign: 'right',
    width: 28,
  },
});
