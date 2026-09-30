import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { GratitudeEntry } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/tokens';
import { Card, Copy } from '../UI';
import { formatGardenDate } from './gardenPresentation';

export function PlantGratitudeList({
  entries,
  loading,
}: {
  entries: GratitudeEntry[];
  loading: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card>
      <Copy heading>Zahvalnosti ove biljke</Copy>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : entries.length === 0 ? (
        <Copy muted>Ova biljka još nema sačuvanih zahvalnosti.</Copy>
      ) : (
        <View style={styles.list}>
          {entries.map(entry => (
            <View
              key={entry.id}
              style={[styles.row, { borderColor: colors.border }]}
            >
              <Copy>{entry.text}</Copy>
              <Copy muted>
                {formatGardenDate(entry.entryDate)} · {entry.streakDay}/21 dan
              </Copy>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    gap: spacing.xs,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
  },
});
