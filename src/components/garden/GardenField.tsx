import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { plantViewState } from '../../domain';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import type { GratitudeTheme, Plant } from '../../types';
import { SunflowerIllustration } from '../SunflowerIllustration';
import { sortSectorPlants } from './gardenPresentation';

export function GardenField({
  themes,
  plants,
  today,
  selectedThemeId,
  onSelectTheme,
}: {
  themes: GratitudeTheme[];
  plants: Plant[];
  today: string;
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string) => void;
}) {
  const { isDark } = useTheme();
  const fieldColors = isDark ? darkStyles : lightStyles;

  return (
    <View
      accessibilityLabel="Mapa bašte sa sedam sektora"
      style={[styles.field, fieldColors.field]}
    >
      <View
        pointerEvents="none"
        style={[styles.fieldPatch, styles.patchOne, fieldColors.patchOne]}
      />
      <View
        pointerEvents="none"
        style={[styles.fieldPatch, styles.patchTwo, fieldColors.patchTwo]}
      />

      {themes.map(theme => (
        <GardenPlot
          key={theme.id}
          theme={theme}
          plants={plants.filter(plant => plant.themeId === theme.id)}
          today={today}
          selected={selectedThemeId === theme.id}
          onPress={() => onSelectTheme(theme.id)}
        />
      ))}

      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={styles.fieldHint}
      >
        Dodirni sektor za pregled
      </Text>
    </View>
  );
}

function GardenPlot({
  theme,
  plants,
  today,
  selected,
  onPress,
}: {
  theme: GratitudeTheme;
  plants: Plant[];
  today: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { isDark } = useTheme();
  const fieldColors = isDark ? darkStyles : lightStyles;
  const sortedPlants = sortSectorPlants(plants);
  const visiblePlants = sortedPlants.slice(0, 8);
  const hiddenPlantCount = sortedPlants.length - visiblePlants.length;
  const position = theme.key ? positions[theme.key] : undefined;
  const shortName = theme.isAutomatic ? 'Danas' : theme.name;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${shortName}, ${plants.length} biljaka`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.plot,
        theme.isAutomatic && styles.dailyPlot,
        position,
        fieldColors.plot,
        selected && fieldColors.selectedPlot,
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          styles.plotName,
          theme.isAutomatic && styles.dailyName,
          fieldColors.plotName,
        ]}
      >
        {shortName}
      </Text>

      <View style={styles.plantRow}>
        {visiblePlants.length > 0 ? (
          visiblePlants.map(plant => {
            const state = plantViewState(plant, today);
            return (
              <View key={plant.id} style={styles.plantSprite}>
                <SunflowerIllustration
                  stage={state.stage}
                  witheredFromStage={state.witheredFromStage}
                  mini
                />
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyPlot}>＋</Text>
        )}
        {hiddenPlantCount > 0 ? (
          <View style={[styles.morePlants, fieldColors.morePlants]}>
            <Text style={[styles.morePlantsText, fieldColors.plotName]}>
              +{hiddenPlantCount}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.plantCount,
          fieldColors.plantCount,
        ]}
      >
        {plants.length === 1 ? '1 biljka' : `${plants.length} biljaka`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    width: '100%',
    minHeight: 500,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#77965F',
  },
  fieldPatch: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.7,
  },
  patchOne: { left: -90, top: 120 },
  patchTwo: { right: -100, top: -60 },
  plot: {
    position: 'absolute',
    width: '29%',
    height: '31%',
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyPlot: {
    width: '95%',
    height: '29%',
    borderWidth: 3,
    borderRadius: 38,
  },
  topLeft: { left: '2.5%', top: '2%' },
  topCenter: { left: '35.5%', top: '2%' },
  topRight: { right: '2.5%', top: '2%' },
  middleLeft: { left: '2.5%', top: '66%' },
  center: { left: '2.5%', top: '35%' },
  middleRight: { right: '2.5%', top: '66%' },
  bottomCenter: { left: '35.5%', top: '66%' },
  plotName: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  dailyName: { fontSize: 14, lineHeight: 17 },
  plantRow: {
    minHeight: 60,
    maxWidth: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  plantSprite: { width: 25, height: 55, marginHorizontal: -2 },
  morePlants: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  morePlantsText: { fontSize: 9, fontWeight: '800' },
  emptyPlot: { fontSize: 32, lineHeight: 45, color: '#78945E' },
  plantCount: { fontSize: 9, lineHeight: 11, fontWeight: '600' },
  fieldHint: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.xs,
    color: '#405C36',
    fontSize: 10,
    fontWeight: '600',
  },
  pressed: { opacity: 0.78 },
});

const lightStyles = StyleSheet.create({
  field: { backgroundColor: '#BFD999' },
  patchOne: { backgroundColor: '#CDE5A8' },
  patchTwo: { backgroundColor: '#AACB82' },
  plot: { backgroundColor: '#E7F0C9', borderColor: '#78945E' },
  selectedPlot: { borderColor: '#6B4A20' },
  plotName: { color: '#294329' },
  plantCount: { color: '#536A49' },
  morePlants: { backgroundColor: '#D2E3AE' },
});

const darkStyles = StyleSheet.create({
  field: { backgroundColor: '#213D28' },
  patchOne: { backgroundColor: '#294A31' },
  patchTwo: { backgroundColor: '#1C3523' },
  plot: { backgroundColor: '#36543B', borderColor: '#66806A' },
  selectedPlot: { borderColor: '#F2CB71' },
  plotName: { color: '#F4F5E9' },
  plantCount: { color: '#CEDBC8' },
  morePlants: { backgroundColor: '#45644A' },
});

const positions: Record<string, object> = {
  family: styles.topLeft,
  health: styles.topCenter,
  university: styles.topRight,
  friendship: styles.middleLeft,
  'daily-gratitude': styles.center,
  love: styles.middleRight,
  'personal-growth': styles.bottomCenter,
};
