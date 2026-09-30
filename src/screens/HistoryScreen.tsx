import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

function monthKeysThroughToday(entryDates: string[]): string[] {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const validDates = entryDates
    .map(value => {
      const [year, month] = value.split('-').map(Number);
      return Number.isFinite(year) && Number.isFinite(month)
        ? new Date(year, month - 1, 1)
        : null;
    })
    .filter((value): value is Date => value !== null && value <= currentMonth);
  const firstMonth = validDates.length
    ? new Date(Math.min(...validDates.map(value => value.getTime())))
    : currentMonth;
  const result: string[] = [];
  const cursor = new Date(firstMonth);

  while (cursor <= currentMonth) {
    result.unshift(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

function formatMonthKey(value: string): string {
  const [year, month] = value.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('sr-Latn-RS', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function HistoryScreen() {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGratitudes, setShowGratitudes] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showCompletedPlants, setShowCompletedPlants] = useState(false);
  const [showChallengeCompletions, setShowChallengeCompletions] =
    useState(false);

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
  const gratitudeMonths = useMemo(
    () => monthKeysThroughToday(history?.gratitudes.map(item => item.entryDate) ?? []),
    [history],
  );
  const displayedGratitudes = useMemo(
    () =>
      selectedMonth
        ? history?.gratitudes.filter(entry => entry.entryDate.startsWith(selectedMonth)) ?? []
        : [],
    [history, selectedMonth],
  );

  return (
    <Screen
      eyebrow="SAČUVANI TRENUTCI"
      title="Istorija"
      description="Pregled tvojih zahvalnosti, uzgojenih biljaka i izvršenih izazova."
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
            <Copy muted>
              Otvori pregled i izaberi mjesec za koji želiš vidjeti zahvalnosti.
            </Copy>
            <Button
              label={showGratitudes ? 'Zatvori zahvalnosti' : 'Pregledaj zahvalnosti'}
              onPress={() => {
                setShowGratitudes(value => !value);
                setSelectedMonth(null);
              }}
            />
            {showGratitudes ? (
              <View style={styles.expandableSection}>
                <View style={styles.monthList}>
                  {gratitudeMonths.map(monthKey => {
                    const selected = selectedMonth === monthKey;
                    return (
                      <Pressable
                        key={monthKey}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setSelectedMonth(monthKey)}
                        style={({ pressed }) => [
                          styles.monthButton,
                          {
                            backgroundColor: selected
                              ? colors.primary
                              : colors.surfaceAlt,
                            borderColor: selected ? colors.primary : colors.border,
                            opacity: pressed ? 0.72 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthButtonText,
                            { color: selected ? colors.onPrimary : colors.text },
                          ]}
                        >
                          {formatMonthKey(monthKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedMonth && displayedGratitudes.length === 0 ? (
                  <EmptyState
                    symbol="♡"
                    title={`Nema zahvalnosti za ${formatMonthKey(selectedMonth)}`}
                    description="U ovom mjesecu nije sačuvana nijedna zahvalnost."
                  />
                ) : null}

                {selectedMonth && displayedGratitudes.length > 0 ? (
                  <View style={styles.list}>
                    {displayedGratitudes.map(entry => {
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
                ) : null}
              </View>
            ) : null}
            {!showGratitudes && history.gratitudes.length === 0 ? (
              <EmptyState
                symbol="♡"
                title="Još nema zahvalnosti"
                description="Sačuvane zahvalnosti biće raspoređene po mjesecima."
              />
            ) : null}
          </Card>

          <Card>
            <Copy heading>Završeni biljni ciklusi</Copy>
            <Copy muted>
              Pogledaj sve suncokrete koji su uspješno završili ciklus od 21 dana.
            </Copy>
            <Button
              label={showCompletedPlants ? 'Sakrij spisak' : 'Pogledaj'}
              onPress={() => setShowCompletedPlants(value => !value)}
            />
            {showCompletedPlants && history.completedPlants.length === 0 ? (
              <EmptyState
                symbol="✿"
                title="Još nema potpuno odraslih biljaka"
                description="Biljka završena nakon 21 uzastopnog dana ostaće sačuvana ovdje."
              />
            ) : null}
            {showCompletedPlants && history.completedPlants.length > 0 ? (
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
            ) : null}
          </Card>

          <Card>
            <Copy heading>Izvršeni Spin Wheel izazovi</Copy>
            <Copy muted>
              Pogledaj dnevne izazove koje si označila kao izvršene.
            </Copy>
            <Button
              label={showChallengeCompletions ? 'Sakrij spisak' : 'Pogledaj'}
              onPress={() => setShowChallengeCompletions(value => !value)}
            />
            {showChallengeCompletions &&
            history.challengeCompletions.length === 0 ? (
              <EmptyState
                symbol="✦"
                title="Još nema izvršenih izazova"
                description="Izazovi koje označiš kao izvršene pojaviće se ovdje."
              />
            ) : null}
            {showChallengeCompletions &&
            history.challengeCompletions.length > 0 ? (
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
            ) : null}
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
  expandableSection: { gap: spacing.md },
  monthList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  monthButton: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  monthButtonText: { fontSize: typography.small, fontWeight: '700' },
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
});
