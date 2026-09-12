import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Decorative illustration, not a plant growth stage.
export function SeedIllustration() {
  const { colors } = useTheme();
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.canvas}
    >
      <View style={[styles.halo, { backgroundColor: colors.surface }]} />
      <View style={[styles.stem, { backgroundColor: colors.primary }]} />
      <View style={[styles.leftLeaf, { backgroundColor: colors.leaf }]} />
      <View style={[styles.rightLeaf, { backgroundColor: colors.primary }]} />
      <View style={[styles.soil, { backgroundColor: colors.seed }]} />
      <View style={[styles.seed, { backgroundColor: colors.accent }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  canvas: { width: 200, height: 160, alignSelf: 'center' },
  halo: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    left: 28,
    top: 0,
  },
  stem: {
    position: 'absolute',
    width: 5,
    height: 74,
    left: 98,
    top: 49,
    borderRadius: 4,
  },
  leftLeaf: {
    position: 'absolute',
    width: 46,
    height: 26,
    left: 54,
    top: 47,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    transform: [{ rotate: '20deg' }],
  },
  rightLeaf: {
    position: 'absolute',
    width: 47,
    height: 28,
    left: 100,
    top: 30,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    transform: [{ rotate: '-20deg' }],
  },
  soil: {
    position: 'absolute',
    width: 124,
    height: 4,
    borderRadius: 4,
    left: 38,
    top: 123,
  },
  seed: {
    position: 'absolute',
    width: 15,
    height: 10,
    borderRadius: 8,
    left: 93,
    top: 134,
  },
});
