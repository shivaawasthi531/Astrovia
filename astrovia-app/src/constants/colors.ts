/**
 * Centralized color palette — premium cosmic theme.
 * Never hardcode hex values in components; import from here.
 */
export const Colors = {
  // Base
  background: '#0A0603',
  backgroundElevated: '#120D08',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceBorder: 'rgba(255, 179, 71, 0.15)',

  // Amber/gold gradient (primary)
  amberLight: '#FFB347',
  amberMid: '#F97316',
  amberDark: '#EA580C',

  // Cosmic purple (premium/locked features)
  purple: '#4C1D95',
  purpleLight: '#7C3AED',

  // Text
  textPrimary: '#FDF6EC',
  textSecondary: 'rgba(253, 246, 236, 0.65)',
  textMuted: 'rgba(253, 246, 236, 0.4)',

  // Status
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',

  // Palm lines (for SVG overlay)
  heartLine: '#F97316',
  headLine: '#FFB347',
  lifeLine: '#4ADE80',
  fateLine: '#7C3AED',

  // Glassmorphism
  glassBg: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 179, 71, 0.2)',

  // Star colors
  star: '#FFFFFF',
  starDim: 'rgba(255, 255, 255, 0.3)',
} as const;

export const Gradients = {
  amberGlow: [Colors.amberLight, Colors.amberMid, Colors.amberDark] as const,
  purpleGlow: [Colors.purple, Colors.purpleLight] as const,
  backgroundRadial: ['#1A0F08', '#0A0603', '#000000'] as const,
};