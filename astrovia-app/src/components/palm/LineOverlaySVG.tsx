/**
 * Renders the detected palm lines over the captured photo with an
 * animated "drawing" reveal (strokeDashoffset trick) — lines draw
 * themselves in sequence rather than appearing instantly.
 */
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Motion } from '../../constants/motion';
import type { LineCoordinates, LinePoint } from '../../types/palm.types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 40;
const PATH_LENGTH = 2000; // arbitrary large value for dash animation

interface LineOverlaySVGProps {
  coordinates: LineCoordinates;
}

function pointsToPath(points: LinePoint[]): string {
  if (!points || points.length === 0) return '';
  const scaled = points.map((p) => ({ x: p.x * IMAGE_SIZE, y: p.y * IMAGE_SIZE }));
  const [first, ...rest] = scaled;
  return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
}

function AnimatedLine({ points, color, delayMs }: { points: LinePoint[]; color: string; delayMs: number }) {
  const dashOffset = useSharedValue(PATH_LENGTH);

  useEffect(() => {
    dashOffset.value = withDelay(
      delayMs,
      withTiming(0, { duration: Motion.durations.lineDrawing, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  if (!points || points.length === 0) return null;

  return (
    <AnimatedPath
      d={pointsToPath(points)}
      stroke={color}
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={PATH_LENGTH}
      animatedProps={animatedProps}
    />
  );
}

export function LineOverlaySVG({ coordinates }: LineOverlaySVGProps) {
  return (
    <Svg width={IMAGE_SIZE} height={IMAGE_SIZE} style={StyleSheet.absoluteFill}>
      {/* Lines draw in sequence, each starting slightly after the previous */}
      <AnimatedLine points={coordinates.life_line} color={Colors.lifeLine} delayMs={0} />
      <AnimatedLine points={coordinates.head_line} color={Colors.headLine} delayMs={400} />
      <AnimatedLine points={coordinates.heart_line} color={Colors.heartLine} delayMs={800} />
      {coordinates.fate_line && (
        <AnimatedLine points={coordinates.fate_line} color={Colors.fateLine} delayMs={1200} />
      )}
    </Svg>
  );
}