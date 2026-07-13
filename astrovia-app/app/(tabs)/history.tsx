/**
 * History tab — list of past palm readings, newest first.
 * Premium cards with animated entrance and colored accents.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Card } from '../../src/components/common/Card';
import { Loader } from '../../src/components/common/Loader';
import { historyService } from '../../src/services/historyService';
import { formatDate } from '../../src/utils/formatters';
import { Colors, Gradients } from '../../src/constants/colors';
import type { PalmReading } from '../../src/types/palm.types';

function ReadingCard({ item, index }: { item: PalmReading; index: number }) {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 60;
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 16, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 350 });
    }, delay);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={() => router.push(`/result/${item.id}`)}>
        <View style={styles.readingCardWrapper}>
          {/* Colored left accent stripe */}
          <LinearGradient
            colors={['#FFB347', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.accentStripe}
          />
          <Card style={styles.readingCard} glow={false}>
            <View style={styles.cardHeader}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color={Colors.amberLight} />
                <Text style={styles.readingDate}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={styles.viewBadge}>
                <Text style={styles.viewBadgeText}>View</Text>
                <Ionicons name="arrow-forward" size={11} color={Colors.amberLight} />
              </View>
            </View>
            <Text style={styles.readingSummary} numberOfLines={2}>
              {item.interpretation?.summary}
            </Text>
            {/* Line indicator dots */}
            <View style={styles.lineIndicators}>
              {[
                { color: Colors.heartLine, label: '♥' },
                { color: Colors.headLine, label: '◎' },
                { color: Colors.lifeLine, label: '⊕' },
                { color: Colors.fateLine, label: '✦' },
              ].map(({ color, label }) => (
                <View key={label} style={[styles.lineDot, { backgroundColor: color + '33', borderColor: color + '66' }]}>
                  <Text style={[styles.lineDotText, { color }]}>{label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const [readings, setReadings] = useState<PalmReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReadings = async () => {
    try {
      const data = await historyService.listReadings();
      setReadings(data);
    } catch {
      // silently fail — empty list is an acceptable fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReadings();
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>Reading History</Text>
        <Text style={styles.subtitle}>Your cosmic archive</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <Loader />
        </View>
      ) : (
        <FlatList
          data={readings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.amberLight}
            />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <View style={styles.emptyInner}>
                <LinearGradient
                  colors={['rgba(255,179,71,0.15)', 'rgba(249,115,22,0.05)']}
                  style={styles.emptyIconWrap}
                >
                  <Ionicons name="hand-left-outline" size={32} color={Colors.amberLight} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No readings yet</Text>
                <Text style={styles.emptyText}>Scan your palm to begin your cosmic journey!</Text>
              </View>
            </Card>
          }
          renderItem={({ item, index }) => <ReadingCard item={item} index={index} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 68, paddingBottom: 20 },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,179,71,0.65)',
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120, gap: 12 },

  // Reading card
  readingCardWrapper: {
    flexDirection: 'row',
    borderRadius: 22,
    overflow: 'hidden',
  },
  accentStripe: {
    width: 4,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  readingCard: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  readingDate: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: Colors.amberLight,
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,179,71,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.25)',
  },
  viewBadgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: Colors.amberLight,
  },
  readingSummary: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  lineIndicators: {
    flexDirection: 'row',
    gap: 6,
  },
  lineDot: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  lineDotText: {
    fontSize: 11,
  },

  // Empty state
  emptyCard: { alignItems: 'center', paddingVertical: 48 },
  emptyInner: { alignItems: 'center', gap: 12 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});