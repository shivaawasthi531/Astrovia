/**
 * Kundli tab — generates/displays the user's Vedic birth chart.
 * Shows a "Generate" CTA if none exists yet, else renders the chart.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Loader } from '../../src/components/common/Loader';
import { ChartView } from '../../src/components/kundli/ChartView';
import { useKundliStore } from '../../src/store/kundliStore';
import { kundliService } from '../../src/services/kundliService';
import { Colors, Gradients } from '../../src/constants/colors';

export default function KundliScreen() {
  const { kundli, isGenerating, error, setKundli, setGenerating, setError } = useKundliStore();

  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const planetRotate = useSharedValue(0);
  const planetY = useSharedValue(0);

  useEffect(() => {
    kundliService.getLatest().then((data) => {
      if (data) setKundli(data);
    });

    cardScale.value = withSpring(1, { damping: 14, stiffness: 100 });
    cardOpacity.value = withTiming(1, { duration: 500 });

    // Animate planet icon
    planetRotate.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1,
      false
    );
    planetY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await kundliService.generate();
      setKundli(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate Kundli');
    }
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const planetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: planetY.value }],
  }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />

      {/* Purple ambient */}
      <View style={styles.purpleAmbient} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleGenerate}
            tintColor={Colors.amberLight}
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Your Kundli</Text>
            <Text style={styles.subtitle}>Vedic Birth Chart</Text>
          </View>
          <Animated.View style={planetStyle}>
            <LinearGradient
              colors={['rgba(124,58,237,0.3)', 'rgba(76,29,149,0.15)']}
              style={styles.planetIconWrap}
            >
              <Ionicons name="planet" size={26} color="#A78BFA" />
            </LinearGradient>
          </Animated.View>
        </View>

        {isGenerating && (
          <View style={styles.loaderWrap}>
            <Loader />
            <Text style={styles.loaderText}>Consulting the stars...</Text>
            <Text style={styles.loaderSubtext}>Calculating planetary positions</Text>
          </View>
        )}

        {!isGenerating && !kundli && (
          <Animated.View style={cardAnimStyle}>
            <Card style={styles.emptyCard}>
              <LinearGradient
                colors={['rgba(124,58,237,0.15)', 'rgba(76,29,149,0.06)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.emptyIconArea}>
                <View style={styles.emptyOrbOuter} />
                <LinearGradient
                  colors={['rgba(124,58,237,0.35)', 'rgba(76,29,149,0.2)']}
                  style={styles.emptyIconWrap}
                >
                  <Ionicons name="planet" size={34} color="#A78BFA" />
                </LinearGradient>
              </View>

              <Text style={styles.emptyTitle}>No Kundli generated yet</Text>
              <Text style={styles.emptySubtitle}>
                Generate your Vedic birth chart based on the birth details you provided during onboarding.
              </Text>

              {error && (
                <View style={styles.errorWrap}>
                  <Ionicons name="warning-outline" size={14} color={Colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.featureList}>
                {[
                  { icon: 'star-outline', text: 'Lagna & Planetary Positions' },
                  { icon: 'time-outline', text: 'Dasha Period Analysis' },
                  { icon: 'compass-outline', text: 'House Predictions' },
                ].map(({ icon, text }) => (
                  <View key={text} style={styles.featureItem}>
                    <Ionicons name={icon as any} size={13} color="#A78BFA" />
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                ))}
              </View>

              <Button label="Generate My Kundli" onPress={handleGenerate} style={styles.generateButton} />
            </Card>
          </Animated.View>
        )}

        {!isGenerating && kundli && (
          <>
            <ChartView data={kundli.chart_svg_data} />
            <Card style={styles.dashaCard}>
              <LinearGradient
                colors={['rgba(124,58,237,0.12)', 'transparent']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={styles.dashaHeader}>
                <LinearGradient
                  colors={['rgba(124,58,237,0.25)', 'rgba(76,29,149,0.12)']}
                  style={styles.dashaIconWrap}
                >
                  <Ionicons name="time" size={14} color="#A78BFA" />
                </LinearGradient>
                <Text style={styles.dashaTitle}>Current Dasha Period</Text>
              </View>
              <Text style={styles.dashaText}>
                {kundli.dasha_periods?.current?.name || 'Data available in full chart'}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  purpleAmbient: {
    position: 'absolute',
    top: 100,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(76,29,149,0.08)',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 68, paddingBottom: 120, gap: 16 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(167,139,250,0.7)',
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  planetIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },

  loaderWrap: { alignItems: 'center', paddingVertical: 60, gap: 14 },
  loaderText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  loaderSubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Empty card
  emptyCard: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, overflow: 'hidden' },
  emptyIconArea: { alignItems: 'center', justifyContent: 'center', marginBottom: 22, height: 90, width: 90 },
  emptyOrbOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.5)',
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 21,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(248,113,113,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    flex: 1,
  },
  featureList: { width: '100%', gap: 10, marginBottom: 24 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(124,58,237,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  featureText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(167,139,250,0.9)',
  },
  generateButton: { width: '100%' },

  // Dasha card
  dashaCard: { overflow: 'hidden' },
  dashaHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dashaIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashaTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dashaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});