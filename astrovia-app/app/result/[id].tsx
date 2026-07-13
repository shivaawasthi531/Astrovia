/**
 * Palm reading result screen — shows the palm photo with animated line
 * overlay + per-line interpretation cards. Reads from palmStore if this
 * is a fresh scan (avoids refetch), else fetches by id (e.g. from History).
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Card } from '../../src/components/common/Card';
import { Loader } from '../../src/components/common/Loader';
import { LineOverlaySVG } from '../../src/components/palm/LineOverlaySVG';
import { LineLegend } from '../../src/components/palm/LineLegend';
import { usePalmStore } from '../../src/store/palmStore';
import { palmService } from '../../src/services/palmService';
import { Colors, Gradients } from '../../src/constants/colors';
import type { PalmReading } from '../../src/types/palm.types';

const LINE_CONFIG: Record<string, { label: string; color: string; icon: string; gradient: readonly [string, string] }> = {
  heart_line: { label: 'Heart Line', color: Colors.heartLine, icon: 'heart', gradient: ['rgba(249,115,22,0.22)', 'rgba(249,115,22,0.06)'] as const },
  head_line: { label: 'Head Line', color: Colors.headLine, icon: 'flash', gradient: ['rgba(255,179,71,0.22)', 'rgba(255,179,71,0.06)'] as const },
  life_line: { label: 'Life Line', color: Colors.lifeLine, icon: 'leaf', gradient: ['rgba(74,222,128,0.2)', 'rgba(74,222,128,0.05)'] as const },
  fate_line: { label: 'Fate Line', color: Colors.fateLine, icon: 'star', gradient: ['rgba(124,58,237,0.22)', 'rgba(124,58,237,0.06)'] as const },
};

function InterpretationCard({ lineKey, value, index }: { lineKey: string; value: string; index: number }) {
  const config = LINE_CONFIG[lineKey] || {
    label: lineKey,
    color: Colors.amberLight,
    icon: 'sparkles',
    gradient: ['rgba(255,179,71,0.2)', 'rgba(255,179,71,0.05)'] as const,
  };

  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(index * 100, withSpring(0, { damping: 16, stiffness: 110 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={styles.interpCardWrapper}>
        {/* Colored left stripe */}
        <LinearGradient
          colors={[config.color, config.color + '66']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.interpStripe}
        />
        <Card style={styles.interpCard} glow={false}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.interpHeader}>
            <View style={[styles.interpIconWrap, { backgroundColor: config.color + '22', borderColor: config.color + '55' }]}>
              <Ionicons name={config.icon as any} size={14} color={config.color} />
            </View>
            <Text style={[styles.interpTitle, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={styles.interpText}>{value as string}</Text>
        </Card>
      </View>
    </Animated.View>
  );
}

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentReading = usePalmStore((s) => s.currentReading);
  const [reading, setReading] = React.useState<PalmReading | null>(
    currentReading?.id === id ? currentReading : null
  );
  const [isLoading, setIsLoading] = React.useState(!reading);

  useEffect(() => {
    if (reading || !id) return;
    palmService
      .getReading(id)
      .then(setReading)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />
        <Loader />
        <Text style={styles.loadingText}>Fetching your reading...</Text>
      </View>
    );
  }

  if (!reading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />
        <Text style={styles.errorText}>Reading not found.</Text>
      </View>
    );
  }

  const interpretationEntries = Object.entries(reading.interpretation).filter(
    ([key]) => key !== 'summary' && reading.interpretation[key as keyof typeof reading.interpretation]
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header row */}
        <View style={styles.topRow}>
          <Pressable style={styles.closeButton} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)']}
              style={styles.closeGradient}
            >
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </LinearGradient>
          </Pressable>
          <Text style={styles.title}>Your Palm Reading</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Palm image */}
        <View style={styles.imageWrap}>
          {reading.image_url && <Image source={{ uri: reading.image_url }} style={styles.image} />}
          <LineOverlaySVG coordinates={reading.line_coordinates} />
          {/* Bottom fade */}
          <LinearGradient
            colors={['transparent', 'rgba(10,6,3,0.6)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <LineLegend />

        {/* Summary card */}
        <Card style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(255,179,71,0.12)', 'rgba(249,115,22,0.04)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.summaryHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.amberLight} />
            <Text style={styles.summaryLabel}>Overall Reading</Text>
          </View>
          <Text style={styles.summaryText}>{reading.interpretation.summary}</Text>
        </Card>

        {/* Per-line cards */}
        {interpretationEntries.map(([key, value], i) => (
          <InterpretationCard key={key} lineKey={key} value={value as string} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 80, gap: 14 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  closeButton: { borderRadius: 20 },
  closeGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },

  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.25)',
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },

  // Summary
  summaryCard: { overflow: 'hidden' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: Colors.amberLight,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 23,
  },

  // Interpretation cards
  interpCardWrapper: {
    flexDirection: 'row',
    borderRadius: 22,
    overflow: 'hidden',
  },
  interpStripe: {
    width: 4,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  interpCard: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  interpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  interpIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  interpTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  interpText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
  },

  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.error,
  },
});