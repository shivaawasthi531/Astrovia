import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Motion } from '../../constants/motion';
import { Colors } from '../../constants/colors';

interface ShootingStarProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function ShootingStar({ startX, startY, endX, endY }: ShootingStarProps) {
  const progress = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: Motion.durations.shootingStar,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.85 ? 1 : (1 - progress.value) / 0.15,
    transform: [{ scale: glowScale.value }],
  }));

  const dx = endX - startX;
  const dy = endY - startY;
  const trailLength = Math.sqrt(dx * dx + dy * dy) * 0.25;
  const angle = Math.atan2(dy, dx);

  const handleTap = () => {
    if (wished) return;
    runOnJS(setWished)(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    glowScale.value = withSequence(withTiming(1.8, { duration: 200 }), withTiming(1, { duration: 300 }));
  };

  const currentX = startX + dx * progress.value;
  const currentY = startY + dy * progress.value;
  const tailX = currentX - Math.cos(angle) * trailLength;
  const tailY = currentY - Math.sin(angle) * trailLength;

  return (
    <Pressable onPress={handleTap} style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <SvgGradient id="starTrail" x1={tailX} y1={tailY} x2={currentX} y2={currentY} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={Colors.star} stopOpacity="0" />
              <Stop offset="1" stopColor={Colors.star} stopOpacity="0.9" />
            </SvgGradient>
          </Defs>
          <Line x1={tailX} y1={tailY} x2={currentX} y2={currentY} stroke="url(#starTrail)" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}