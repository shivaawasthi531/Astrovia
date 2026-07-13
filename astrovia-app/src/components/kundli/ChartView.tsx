/**
 * Pseudo-3D rotating celestial wheel — renders planets at their computed
 * angles on a circular chart. Subtle auto-rotation + drag-to-rotate with
 * inertia via gesture-handler + reanimated.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDecay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import type { ChartSvgData } from '../../types/kundli.types';

const { width } = Dimensions.get('window');
const SIZE = width - 80;
const RADIUS = SIZE / 2 - 30;
const CENTER = SIZE / 2;

interface ChartViewProps {
  data: ChartSvgData | null;
}

export function ChartView({ data }: ChartViewProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Gentle continuous auto-rotation, interrupted by user drag
    rotation.value = withRepeat(withTiming(rotation.value + 360, { duration: 60000, easing: Easing.linear }), -1, false);
  }, []);

  const panGesture = Gesture.Pan()
    .onChange((e) => {
      rotation.value += e.changeX * 0.3;
    })
    .onEnd((e) => {
      rotation.value = withDecay({ velocity: e.velocityX * 0.15, deceleration: 0.995 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const planets = data?.planets || [];

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.wheel, animatedStyle, { width: SIZE, height: SIZE }]}>
          <Svg width={SIZE} height={SIZE}>
            {/* Outer ring */}
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={Colors.amberMid} strokeWidth={1} fill="none" opacity={0.4} />
            {/* Inner ring */}
            <Circle cx={CENTER} cy={CENTER} r={RADIUS * 0.6} stroke={Colors.amberLight} strokeWidth={0.5} fill="none" opacity={0.25} />

            {planets.map((planet, i) => {
              const rad = (planet.angle * Math.PI) / 180;
              const x = CENTER + Math.cos(rad) * RADIUS;
              const y = CENTER + Math.sin(rad) * RADIUS;
              return (
                <G key={`${planet.name}-${i}`}>
                  <Circle cx={x} cy={y} r={5} fill={Colors.amberLight} />
                  <SvgText x={x} y={y - 12} fontSize={10} fill={Colors.textPrimary} textAnchor="middle">
                    {planet.name}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  wheel: { alignItems: 'center', justifyContent: 'center' },
});