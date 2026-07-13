/**
 * Generates a static field of stars across 3 parallax depth layers.
 * Positions are randomized once on mount (not re-randomized on re-render).
 */
import { useMemo } from 'react';
import { Dimensions } from 'react-native';

export interface Star {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

const { width, height } = Dimensions.get('window');

function generateLayer(count: number, minRadius: number, maxRadius: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    radius: minRadius + Math.random() * (maxRadius - minRadius),
    opacity: 0.3 + Math.random() * 0.7,
  }));
}

export function useStarfield() {
  // 3 depth layers — back (small, dim, many) to front (large, bright, few)
  const layers = useMemo(
    () => ({
      back: generateLayer(60, 0.5, 1),
      mid: generateLayer(30, 1, 1.8),
      front: generateLayer(15, 1.8, 2.8),
    }),
    []
  );

  return layers;
}