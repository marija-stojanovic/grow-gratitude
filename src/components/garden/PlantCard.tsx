import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { plantViewState, streakProgressMessage } from '../../domain';
import type { Plant } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { SunflowerIllustration } from '../SunflowerIllustration';
import { Badge, Copy } from '../UI';
import { gardenPlantStatus } from './gardenPresentation';

export function PlantCard({
  plant,
  today,
  onOpen,
}: {
  plant: Plant;
  today: string;
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const state = plantViewState(plant, today);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Otvori detalje biljke ${plant.name}`}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <SunflowerIllustration
        stage={state.stage}
        witheredFromStage={state.witheredFromStage}
        compact
      />
      <View style={styles.copy}>
        <Copy heading>{plant.name}</Copy>
        <View style={styles.badges}>
          <Badge>{gardenPlantStatus(plant, today)}</Badge>
          <Badge>{`${plant.cycleNumber}. ciklus`}</Badge>
        </View>
        <Copy muted>
          {plant.status === 'completed'
            ? '21/21 uzastopnih dana'
            : streakProgressMessage(state.streak)}
        </Copy>
        <Copy muted>Dodirni za detalje</Copy>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  copy: { gap: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
