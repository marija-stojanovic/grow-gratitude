import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Copy,
  EmptyState,
  Screen,
} from '../components/UI';
import { loadHistoryData, type HistoryData } from '../services/historyService';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import type { MoodValue } from '../types';

const moodPresentation: Record<MoodValue, { symbol: string; label: string }> = {
  1: { symbol: '😞', label: 'Veoma loše' },
  2: { symbol: '😕', label: 'Loše' },
  3: { symbol: '😐', label: 'Neutralno' },
  4: { symbol: '😊', label: 'Dobro' },
  5: { symbol: '😄', label: 'Veoma dobro' },
};

function formatLocalDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatIsoDate(value: string | null): string {
  if (!value) {
    return 'Datum nije dostupan';
  }
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function HistoryScreen() {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHistory(await loadHistoryData());
    } catch {
      setError('Istorija se trenutno ne može učitati. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const themeNames = useMemo(
    () => new Map(history?.themes.map(theme => [theme.id, theme.name]) ?? []),
    [history],
  );
  const plants = useMemo(
    () => new Map(history?.allPlants.map(plant => [plant.id, plant]) ?? []),
    [history],
  );
  const challengeNames = useMemo(
    () =>
      new Map(
        history?.challenges.map(challenge => [challenge.id, challenge.title]) ??
          [],
      ),
    [history],
  );

  return (
    <Screen
      eyebrow="SAČUVANI TRENUTCI"
      title="Istorija"
      description="Pregled tvojih zahvalnosti, raspoloženja, uzgojenih biljaka i izvršenih izazova."
    >
      {loading && !history ? (
        <Card tinted>
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Copy muted>Učitavanje istorije…</Copy>
          </View>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.accent }]}
          >
            {error}
          </Text>
          <Button label="Pokušaj ponovo" onPress={loadHistory} />
        </Card>
      ) : null}

      {history ? (
        <>
          <Card tinted>
            <Copy heading>Sažetak</Copy>
            <View style={styles.summary}>
              <SummaryItem
                count={history.gratitudes.length}
                label="Zahvalnosti"
              />
              <SummaryItem count={history.moods.length} label="Raspoloženja" />
              <SummaryItem
                count={history.completedPlants.length}
                label="Biljke"
              />
              <SummaryItem
                count={history.challengeCompletions.length}
                label="Izazovi"
              />
            </View>
            <Button
              disabled={loading}
              label={loading ? 'Osvježavanje…' : 'Osvježi istoriju'}
              onPress={loadHistory}
            />
          </Card>

          <Card>
            <Copy heading>Zahvalnosti</Copy>
            {history.gratitudes.length === 0 ? (
              <EmptyState
                symbol="♡"
                title="Još nema zahvalnosti"
                description="Sačuvane zahvalnosti pojaviće se ovdje od najnovije prema najstarijoj."
              />
            ) : (
              <View style={styles.list}>
                {history.gratitudes.map(entry => {
                  const plant = plants.get(entry.plantId);
                  const themeName =
                    themeNames.get(entry.themeId) ?? 'Nepoznata tema';
                  return (
                    <View
                      key={entry.id}
                      style={[styles.entry, { borderColor: colors.border }]}
                    >
                      <View style={styles.entryHeading}>
                        <Badge>{themeName}</Badge>
                        <Text style={[styles.date, { color: colors.muted }]}>
                          {formatLocalDate(entry.entryDate)}
                        </Text>
                      </View>
                      <Text style={[styles.entryText, { color: colors.text }]}>
                        {entry.text}
                      </Text>
                      <Copy muted>
                        {plant
                          ? `${plant.name} · ${plant.cycleNumber}. ciklus · ${entry.streakDay}/21 dan`
                          : `${entry.streakDay}/21 dan`}
                      </Copy>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <Card>
            <Copy heading>Raspoloženja</Copy>
            {history.moods.length === 0 ? (
              <EmptyState
                symbol="☻"
                title="Još nema raspoloženja"
                description="Dnevni unosi raspoloženja pojaviće se ovdje."
              />
            ) : (
              <View style={styles.list}>
                {history.moods.map(entry => {
                  const mood = moodPresentation[entry.value];
                  return (
                    <View
                      key={entry.id}
                      style={[styles.moodEntry, { borderColor: colors.border }]}
                    >
                      <Text style={styles.moodSymbol}>{mood.symbol}</Text>
                      <View style={styles.entryCopy}>
                        <Copy heading>{mood.label}</Copy>
                        <Copy muted>{formatLocalDate(entry.entryDate)}</Copy>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <Card>
            <Copy heading>Završeni biljni ciklusi</Copy>
            {history.completedPlants.length === 0 ? (
              <EmptyState
                symbol="✿"
                title="Još nema potpuno odraslih biljaka"
                description="Biljka završena nakon 21 uzastopnog dana ostaće sačuvana ovdje."
              />
            ) : (
              <View style={styles.list}>
                {history.completedPlants.map(plant => (
                  <View
                    key={plant.id}
                    style={[styles.entry, { borderColor: colors.border }]}
                  >
                    <View style={styles.entryHeading}>
                      <Badge>21/21 DANA</Badge>
                      <Text style={[styles.date, { color: colors.muted }]}>
                        {formatIsoDate(plant.completedAt)}
                      </Text>
                    </View>
                    <Copy heading>{plant.name}</Copy>
                    <Copy muted>
                      {`${
                        themeNames.get(plant.themeId) ?? 'Nepoznata tema'
                      } · ${plant.cycleNumber}. ciklus`}
                    </Copy>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card>
            <Copy heading>Izvršeni Spin Wheel izazovi</Copy>
            {history.challengeCompletions.length === 0 ? (
              <EmptyState
                symbol="✦"
                title="Još nema izvršenih izazova"
                description="Izazovi koje označiš kao izvršene pojaviće se ovdje."
              />
            ) : (
              <View style={styles.list}>
                {history.challengeCompletions.map(completion => (
                  <View
                    key={completion.id}
                    style={[styles.entry, { borderColor: colors.border }]}
                  >
                    <View style={styles.entryHeading}>
                      <Badge>IZVRŠENO</Badge>
                      <Text style={[styles.date, { color: colors.muted }]}>
                        {formatLocalDate(completion.completionDate)}
                      </Text>
                    </View>
                    <Copy heading>
                      {challengeNames.get(completion.challengeId) ??
                        'Obrisani korisnički izazov'}
                    </Copy>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function SummaryItem({ count, label }: { count: number; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
      <Text style={[styles.summaryNumber, { color: colors.primary }]}>
        {count}
      </Text>
      <Copy muted>{label}</Copy>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  message: { fontSize: typography.body, lineHeight: 24 },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryItem: {
    minWidth: 120,
    flexGrow: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryNumber: { fontSize: typography.hero, fontWeight: '700' },
  list: { gap: spacing.md },
  entry: { borderBottomWidth: 1, paddingBottom: spacing.md, gap: spacing.sm },
  entryHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  date: { fontSize: typography.small },
  entryText: { fontSize: typography.body, lineHeight: 25 },
  moodEntry: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  moodSymbol: { fontSize: 32 },
  entryCopy: { flex: 1, gap: spacing.xs },
});
