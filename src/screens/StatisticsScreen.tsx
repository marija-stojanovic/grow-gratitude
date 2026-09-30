import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Card, Copy, EmptyState, Screen } from '../components/UI';
import { localDateFor } from '../domain';
import {
  loadStatisticsData,
  type MoodDay,
  type StatisticsData,
  type StatisticsPeriod,
} from '../services/statisticsService';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import type { MoodValue } from '../types';

const moodSymbols: Record<MoodValue, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄',
};

const moodColors: Record<MoodValue, string> = {
  1: '#B96868',
  2: '#C58A5A',
  3: '#C4A84F',
  4: '#72A66C',
  5: '#397A54',
};

export function StatisticsScreen() {
  const { colors } = useTheme();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [period, setPeriod] = useState<StatisticsPeriod>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = localDateFor(new Date());

  const loadStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatistics(await loadStatisticsData(today));
    } catch {
      setError('Statistika se trenutno ne može učitati. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const summary =
    period === 'week' ? statistics?.weekSummary : statistics?.monthSummary;

  return (
    <Screen
      eyebrow="PROSTOR ZA OSVRT"
      title="Statistika"
      description="Upoznaj svoje obrasce kroz zapise, bez pritiska i ocjenjivanja."
    >
      {loading && !statistics ? (
        <Card tinted>
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Copy muted>Učitavanje statistike…</Copy>
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
          <Button label="Pokušaj ponovo" onPress={loadStatistics} />
        </Card>
      ) : null}

      {statistics ? (
        <>
          <Card tinted>
            <Copy heading>Ukupan napredak</Copy>
            <View style={styles.totals}>
              <Metric
                value={statistics.totalGratitudes}
                label="sačuvanih zahvalnosti"
              />
              <Metric
                value={statistics.completedPlants}
                label="potpuno uzgojenih biljaka"
              />
              <Metric
                value={statistics.completedChallenges}
                label="izvršenih Spin Wheel izazova"
              />
              <Metric
                value={`${statistics.longestGratitudeStreak} dana`}
                label="najduži ostvareni niz zahvalnosti"
              />
            </View>
            <Button
              disabled={loading}
              label={loading ? 'Osvježavanje…' : 'Osvježi statistiku'}
              onPress={loadStatistics}
            />
          </Card>

          <Card>
            <Copy heading>Izaberi period</Copy>
            <View accessibilityRole="radiogroup" style={styles.periodOptions}>
              <PeriodButton
                label="Posljednjih 7 dana"
                selected={period === 'week'}
                onPress={() => setPeriod('week')}
              />
              <PeriodButton
                label="Tekući mjesec"
                selected={period === 'month'}
                onPress={() => setPeriod('month')}
              />
            </View>
            <View style={styles.periodSummary}>
              <Metric
                value={summary?.recordedDays ?? 0}
                label="dana sa raspoloženjem"
              />
              <Metric
                value={
                  summary?.average === null || summary?.average === undefined
                    ? '—'
                    : summary.average.toFixed(1)
                }
                label="prosječno raspoloženje od 5"
              />
            </View>
          </Card>

          <Card>
            <Copy heading>Posljednjih 7 dana</Copy>
            <Copy muted>
              Visina stubaca predstavlja nivo raspoloženja. Prazan dan nema
              pretpostavljenu vrijednost.
            </Copy>
            {statistics.weekSummary.recordedDays === 0 ? (
              <EmptyState
                symbol="▥"
                title="Još nema raspoloženja u ovom periodu"
                description="Sačuvaj dnevno raspoloženje da bi se pojavio sedmodnevni pregled."
              />
            ) : null}
            <View style={styles.weekChart}>
              {statistics.lastSevenDays.map(day => (
                <WeekBar key={day.date} day={day} />
              ))}
            </View>
            <MoodLegend />
          </Card>

          <Card>
            <Copy heading>Tekući mjesec</Copy>
            <Copy muted>
              Svako polje predstavlja jedan kalendarski dan. Budući dani su
              prigušeni, a dani bez unosa ostaju prazni.
            </Copy>
            {statistics.monthSummary.recordedDays === 0 ? (
              <EmptyState
                symbol="□"
                title="Još nema mjesečnih podataka"
                description="Raspoloženja sačuvana tokom ovog mjeseca pojaviće se u kalendaru."
              />
            ) : null}
            <View style={styles.monthGrid}>
              {statistics.currentMonth.map(day => (
                <MonthDay key={day.date} day={day} />
              ))}
            </View>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surface }]}>
      <Text style={[styles.metricValue, { color: colors.primary }]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function PeriodButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.periodButton,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.periodButtonText,
          { color: selected ? colors.onPrimary : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function WeekBar({ day }: { day: MoodDay }) {
  const { colors } = useTheme();
  const height = day.value === null ? 8 : 24 + day.value * 20;
  return (
    <View
      accessibilityLabel={`${day.weekday}, ${day.dayOfMonth}. dan: ${
        day.value === null ? 'nema unosa' : `${day.value} od 5`
      }`}
      style={styles.weekColumn}
    >
      <Text style={styles.chartSymbol}>
        {day.value === null ? '·' : moodSymbols[day.value]}
      </Text>
      <View style={styles.barArea}>
        <View
          style={[
            styles.bar,
            {
              height,
              backgroundColor:
                day.value === null ? colors.border : moodColors[day.value],
            },
          ]}
        />
      </View>
      <Text style={[styles.dayLabel, { color: colors.muted }]}>
        {day.weekday.replace('.', '')}
      </Text>
      <Text style={[styles.dayNumber, { color: colors.text }]}>
        {day.dayOfMonth}
      </Text>
    </View>
  );
}

function MonthDay({ day }: { day: MoodDay }) {
  const { colors } = useTheme();
  const backgroundColor = day.isFuture
    ? colors.background
    : day.value === null
    ? colors.surfaceAlt
    : moodColors[day.value];
  return (
    <View
      accessibilityLabel={`${day.dayOfMonth}. dan: ${
        day.isFuture
          ? 'budući datum'
          : day.value === null
          ? 'nema unosa'
          : `${day.value} od 5`
      }`}
      style={[
        styles.monthDay,
        {
          backgroundColor,
          borderColor: colors.border,
          opacity: day.isFuture ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.monthDayNumber,
          { color: day.value === null ? colors.text : '#FFFFFF' },
        ]}
      >
        {day.dayOfMonth}
      </Text>
      <Text style={styles.monthSymbol}>
        {day.value === null ? ' ' : moodSymbols[day.value]}
      </Text>
    </View>
  );
}

function MoodLegend() {
  const { colors } = useTheme();
  return (
    <View style={styles.legend}>
      {([1, 2, 3, 4, 5] as MoodValue[]).map(value => (
        <View key={value} style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: moodColors[value] }]}
          />
          <Text style={[styles.legendText, { color: colors.muted }]}>
            {value}
          </Text>
        </View>
      ))}
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
  totals: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: {
    minWidth: 132,
    flexGrow: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  metricValue: { fontSize: typography.hero, fontWeight: '700' },
  metricLabel: {
    fontSize: typography.small,
    lineHeight: 18,
    textAlign: 'center',
  },
  periodOptions: { flexDirection: 'row', gap: spacing.sm },
  periodButton: {
    minHeight: 48,
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonText: {
    fontSize: typography.small,
    fontWeight: '700',
    textAlign: 'center',
  },
  periodSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  weekChart: {
    height: 190,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  weekColumn: { flex: 1, alignItems: 'center', gap: spacing.xs },
  chartSymbol: { fontSize: 20 },
  barArea: {
    height: 124,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: { width: '64%', maxWidth: 34, borderRadius: radius.sm },
  dayLabel: { fontSize: 11, textTransform: 'uppercase' },
  dayNumber: { fontSize: typography.small, fontWeight: '600' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  monthDay: {
    width: '13%',
    minWidth: 38,
    aspectRatio: 0.82,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  monthDayNumber: { fontSize: typography.small, fontWeight: '700' },
  monthSymbol: { fontSize: 16 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendColor: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: typography.small },
});
