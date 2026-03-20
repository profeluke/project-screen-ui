import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { scaleSize } from './styles';

const BAR_COUNT = 5;
const BAR_WIDTH = scaleSize(3);
const BAR_GAP = scaleSize(2.5);
const BAR_MIN_HEIGHT = scaleSize(4);
const BAR_MAX_HEIGHT = scaleSize(18);
const BAR_RADIUS = scaleSize(1.5);

// Height multipliers per bar position (visual scaling)
const SENSITIVITY = [0.5, 0.9, 1.5, 0.9, 0.5];

// Bars are displayed left-to-right but volume rolls right-to-left,
// so the rightmost bar (index 4) shows the newest sample and
// the leftmost bar (index 0) shows the oldest.
// We keep a short history buffer and each bar reads from it.

interface AudioWaveformProps {
  /** Normalized audio level 0..1 */
  level: number;
  color?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  level,
  color = '#FFFFFF',
}) => {
  const bars = SENSITIVITY.map(() => useSharedValue(BAR_MIN_HEIGHT));
  // History buffer: index 0 = newest, index 4 = oldest
  const history = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  useEffect(() => {
    // Shift history: drop oldest (end), prepend newest (start)
    history.current.pop();
    history.current.unshift(level);

    // Bar 4 (rightmost) gets newest sample, bar 0 (leftmost) gets oldest
    bars.forEach((bar, i) => {
      const historyIndex = BAR_COUNT - 1 - i;
      const sampleLevel = history.current[historyIndex] ?? 0;
      const target =
        BAR_MIN_HEIGHT +
        (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT) * sampleLevel * SENSITIVITY[i];
      bar.value = withTiming(target, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });
    });
  }, [level]);

  const animatedStyles = bars.map((bar) =>
    useAnimatedStyle(() => ({
      height: bar.value,
    }))
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: BAR_GAP,
        height: BAR_MAX_HEIGHT,
      }}
    >
      {animatedStyles.map((style, i) => (
        <Animated.View
          key={String(i)}
          style={[
            {
              width: BAR_WIDTH,
              borderRadius: BAR_RADIUS,
              backgroundColor: color,
            },
            style,
          ]}
        />
      ))}
    </View>
  );
};
