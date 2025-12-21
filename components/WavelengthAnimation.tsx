import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withDelay
} from 'react-native-reanimated';

interface WavelengthAnimationProps {
  color?: string;
}

const WavelengthAnimation = ({ color = '#94A3B8' }: WavelengthAnimationProps) => {
  const animations = Array.from({ length: 5 }, () => useSharedValue(0));

  useEffect(() => {
    animations.forEach((animation, index) => {
      animation.value = withDelay(
        index * 200,
        withRepeat(
          withTiming(1, { duration: 400 }),
          -1,
          true
        )
      );
    });
  }, []);

  const AnimatedBar = ({ animation, color }: { animation: Animated.SharedValue<number>; color: string }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        height: 5 + animation.value * 15, // Interpolate from 5 to 20
        backgroundColor: color,
      };
    });

    return <Animated.View style={[styles.bar, animatedStyle]} />;
  };

  return (
    <View style={styles.container}>
      {animations.map((animation, index) => (
        <AnimatedBar key={index} animation={animation} color={color} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  bar: {
    width: 3,
    marginHorizontal: 2,
    borderRadius: 2,
  },
});

export default WavelengthAnimation; 