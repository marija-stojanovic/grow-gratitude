import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { plantViewState, streakProgressMessage } from '../../domain';
import type { GratitudeEntry, GratitudeTheme, Plant } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { SunflowerIllustration } from '../SunflowerIllustration';
import { Badge, Card, Copy, Screen } from '../UI';
import { formatGardenDate, gardenPlantStatus } from './gardenPresentation';
import { PlantGratitudeList } from './PlantGratitudeList';

export function PlantDetails({
  plant,
  theme,
  today,
  gratitudes,
  loadingGratitudes,
  busy,
  error,
  onBack,
  onDelete,
}: {
  plant: Plant;
  theme: GratitudeTheme;
  today: string;
  gratitudes: GratitudeEntry[];
  loadingGratitudes: boolean;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const state = plantViewState(plant, today);
  return (
    <Screen
      eyebrow={theme.name.toUpperCase()}
      title={plant.name}
      description={`${plant.cycleNumber}. ciklus · Suncokret`}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.backText, { color: colors.primary }]}>
          ‹ Bašta
        </Text>
      </Pressable>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[styles.message, { color: colors.accent }]}
        >
          {error}
        </Text>
      ) : null}

      <Card tinted>
        <SunflowerIllustration
          stage={state.stage}
          witheredFromStage={state.witheredFromStage}
        />
        <View style={styles.badges}>
          <Badge>{gardenPlantStatus(plant, today)}</Badge>
          <Badge>{`${plant.cycleNumber}. ciklus`}</Badge>
        </View>
        <Text style={[styles.progress, { color: colors.primary }]}>
          {streakProgressMessage(state.streak)}
        </Text>
        <Copy muted>
          Posljednje zalivanje: {formatGardenDate(plant.lastWateredOn)}
        </Copy>
        {state.stage === 'withered' ? (
          <Copy muted>
            Biljka je uvenula. Sljedeće zalivanje pokreće novi niz od 1/21.
          </Copy>
        ) : null}
      </Card>

      <PlantGratitudeList entries={gratitudes} loading={loadingGratitudes} />

      <Card>
        <Copy heading>Brisanje biljke</Copy>
        <Copy muted>
          Brisanjem se trajno uklanjaju biljka i sve zahvalnosti povezane s
          njom.
        </Copy>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            {
              borderColor: colors.accent,
              opacity: busy ? 0.5 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.deleteText, { color: colors.accent }]}>
            {busy ? 'Brisanje…' : 'Trajno obriši biljku'}
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 46,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  backText: { fontSize: typography.body, fontWeight: '700' },
  message: { fontSize: typography.body, lineHeight: 25 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  progress: { fontSize: typography.heading, fontWeight: '700' },
  deleteButton: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  deleteText: { fontSize: typography.body, fontWeight: '700' },
});
