/**
 * Visual guide overlay shown over the camera preview — an outstretched
 * palm silhouette to help users position their hand correctly.
 */
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
const GUIDE_WIDTH = width * 0.7;
const GUIDE_HEIGHT = GUIDE_WIDTH * 1.3;

export function HandOverlay() {
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Simplified palm outline as a positioning guide */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={GUIDE_WIDTH / 2}
        ry={GUIDE_HEIGHT / 2}
        stroke={Colors.amberLight}
        strokeWidth={2}
        strokeDasharray="10,8"
        fill="rgba(255, 179, 71, 0.05)"
      />
      <Path
        d={`M ${cx - 30} ${cy - GUIDE_HEIGHT / 2 - 10} L ${cx} ${cy - GUIDE_HEIGHT / 2 - 40} L ${cx + 30} ${cy - GUIDE_HEIGHT / 2 - 10}`}
        stroke={Colors.amberLight}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}