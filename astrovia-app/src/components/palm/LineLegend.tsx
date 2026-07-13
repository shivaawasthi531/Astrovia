/**
 * Small color-coded legend explaining which SVG color maps to which
 * palm line, shown above the interpretation cards.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const LEGEND_ITEMS = [
  { label: 'Heart', color: Colors.heartLine },
  { label: 'Head', color: Colors.headLine },
  { label: 'Life', color: Colors.lifeLine },
  { label: 'Fate', color: Colors.fateLine },
];

export function LineLegend() {
  return (
    <View style={styles.row}>
      {LEGEND_ITEMS.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginVertical: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.textSecondary },
});