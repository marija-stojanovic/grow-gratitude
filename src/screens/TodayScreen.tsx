import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Badge, Button, Card, Copy, Screen } from '../components/UI';
import { SunflowerIllustration } from '../components/SunflowerIllustration';
import {
  cycleProgressMessage,
  localDateFor,
  plantViewState,
  shouldOfferSpinWheel,
  streakProgressMessage,
} from '../domain';
import { plantRepository } from '../repositories/plantRepository';
import { moodRepository } from '../repositories/moodRepository';
import { saveDailyMood } from '../services/moodService';
import {
  saveGratitudeAndWaterPlant,
  WateringError,
} from '../services/wateringService';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import type { MoodValue, Plant, PlantGrowthStage } from '../types';

const moodOptions: { value: MoodValue; symbol: string; label: string }[] = [
  { value: 1, symbol: '😞', label: 'Veoma loše' },
  { value: 2, symbol: '😕', label: 'Loše' },
  { value: 3, symbol: '😐', label: 'Neutralno' },
  { value: 4, symbol: '😊', label: 'Dobro' },
  { value: 5, symbol: '😄', label: 'Veoma dobro' },
];

const stageLabels: Record<PlantGrowthStage, string> = {
  seed: 'Sjeme',
  sprout: 'Klica',
  small: 'Mala biljka',
  medium: 'Srednja biljka',
  large: 'Velika biljka',
  'almost-grown': 'Skoro odrasla biljka',
  'fully-grown': 'Potpuno odrasla biljka',
  withered: 'Uvenula biljka',
};

function messageForError(error: unknown): string {
  if (!(error instanceof WateringError)) {
    return 'Zalivanje trenutno nije uspjelo. Pokušajte ponovo.';
  }
  switch (error.code) {
    case 'duplicate-day':
      return 'Današnji suncokret je već zaliven.';
    case 'date-moved-backward':
      return 'Datum telefona je prije posljednjeg zalivanja.';
    case 'already-completed':
      return 'Ovaj suncokret je već potpuno odrastao.';
    case 'invalid-gratitude':
    case 'invalid-date':
    case 'plant-not-found':
      return error.message;
  }
}

export function TodayScreen({
  onOpenGarden,
  onOpenSpinWheel,
}: {
  onOpenGarden: () => void;
  onOpenSpinWheel: () => void;
}) {
  const { colors } = useTheme();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [completedPlant, setCompletedPlant] = useState<Plant | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMood, setSavedMood] = useState<MoodValue | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [moodLoading, setMoodLoading] = useState(true);
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [spinWheelSuggestionVisible, setSpinWheelSuggestionVisible] =
    useState(false);
  const now = new Date();
  const today = localDateFor(now);
  const date = new Intl.DateTimeFormat('sr-Latn-BA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const loadSunflower = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activePlant = await plantRepository.findAutomaticActive();
      setPlant(activePlant);
      setCompletedPlant(null);
      if (!activePlant) {
        setError('Aktivni dnevni suncokret nije pronađen.');
      }
    } catch {
      setError('Podaci o suncokretu trenutno se ne mogu učitati.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSunflower();
  }, [loadSunflower]);

  const loadMood = useCallback(async () => {
    setMoodLoading(true);
    setMoodError(null);
    try {
      const entry = await moodRepository.findByDate(today);
      setSavedMood(entry?.value ?? null);
      setSelectedMood(entry?.value ?? null);
      setSpinWheelSuggestionVisible(
        entry ? shouldOfferSpinWheel(entry.value) : false,
      );
    } catch {
      setMoodError('Današnje raspoloženje trenutno se ne može učitati.');
    } finally {
      setMoodLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadMood();
  }, [loadMood]);

  const displayedPlant = completedPlant ?? plant;
  const viewState = useMemo(
    () => (displayedPlant ? plantViewState(displayedPlant, today) : null),
    [displayedPlant, today],
  );

  const waterSunflower = async () => {
    if (!plant || saving) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    setError(null);
    try {
      const result = await saveGratitudeAndWaterPlant({
        id: `gratitude:${plant.id}:${today}`,
        plantId: plant.id,
        text: gratitude,
        entryDate: today,
        createdAt: new Date().toISOString(),
      });
      // Dovrši kratak prikaz zalivanja prije promjene ilustracije.
      await new Promise<void>(resolve => setTimeout(resolve, 700));
      setPlant(result.nextPlant ?? result.plant);
      setCompletedPlant(result.nextPlant ? result.plant : null);
      setAnimationKey(value => value + 1);
      setGratitude('');
      if (result.nextPlant) {
        setFeedback(
          `Uspješno ste završili ${result.plant.cycleNumber}. ciklus. Vaš ${result.nextPlant.cycleNumber}. ciklus je u toku.`,
        );
      } else if (result.restartedAfterMiss) {
        setFeedback('Suncokret je ponovo oživio. Novi niz počinje od 1/21.');
      } else {
        setFeedback('Zahvalnost je sačuvana i suncokret je zaliven.');
      }
    } catch (caughtError) {
      setError(messageForError(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const saveMood = async () => {
    if (selectedMood === null || moodSaving) {
      return;
    }
    setMoodSaving(true);
    setMoodFeedback(null);
    setMoodError(null);
    try {
      const result = await saveDailyMood({
        value: selectedMood,
        entryDate: today,
        savedAt: new Date().toISOString(),
      });
      setSavedMood(result.entry.value);
      setSpinWheelSuggestionVisible(shouldOfferSpinWheel(result.entry.value));
      setMoodFeedback(
        result.updatedExistingEntry
          ? 'Današnje raspoloženje je promijenjeno.'
          : 'Današnje raspoloženje je sačuvano.',
      );
    } catch (caughtError) {
      setMoodError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Raspoloženje trenutno nije moguće sačuvati.',
      );
    } finally {
      setMoodSaving(false);
    }
  };

  return (
    <Screen
      eyebrow="GROWGRATITUDE · DANAS"
      title="Svaki dan, malo zahvalnosti."
      description={date}
    >
      <Card tinted>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Copy muted>Učitavanje suncokreta…</Copy>
          </View>
        ) : displayedPlant && viewState ? (
          <>
            <SunflowerIllustration
              stage={viewState.stage}
              witheredFromStage={viewState.witheredFromStage}
              watering={saving}
              animationKey={animationKey}
            />
            <Copy heading>{cycleProgressMessage(displayedPlant)}</Copy>
            <Text style={[styles.progress, { color: colors.primary }]}>
              {streakProgressMessage(viewState.streak)}
            </Text>
            <Badge>{`Faza: ${stageLabels[viewState.stage]}`}</Badge>
            {viewState.stage === 'withered' ? (
              <Copy muted>
                Posljednja faza bila je{' '}
                {stageLabels[
                  viewState.witheredFromStage ?? 'seed'
                ].toLowerCase()}
                . Jednim novim unosom suncokret se vraća i započinje niz od
                1/21.
              </Copy>
            ) : null}
            {completedPlant ? (
              <Button
                label="Prikaži novi ciklus"
                onPress={() => {
                  setCompletedPlant(null);
                  setAnimationKey(value => value + 1);
                }}
              />
            ) : (
              <>
                <TextInput
                  accessibilityLabel="Današnja zahvalnost"
                  editable={!saving && viewState.canWaterToday}
                  maxLength={300}
                  multiline
                  onChangeText={setGratitude}
                  placeholder={
                    viewState.canWaterToday
                      ? 'Danas sam zahvalna na…'
                      : 'Suncokret je danas već zaliven.'
                  }
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  textAlignVertical="top"
                  value={gratitude}
                />
                <Text style={[styles.counter, { color: colors.muted }]}>
                  {gratitude.length}/300
                </Text>
                <Button
                  disabled={
                    saving || !viewState.canWaterToday || !gratitude.trim()
                  }
                  label={saving ? 'Čuvanje…' : 'Zalij suncokret'}
                  onPress={waterSunflower}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Copy heading>Suncokret nije dostupan</Copy>
            <Copy muted>{error ?? 'Pokušajte ponovo učitati podatke.'}</Copy>
            <Button label="Pokušaj ponovo" onPress={loadSunflower} />
          </>
        )}
        {feedback ? (
          <Text style={[styles.feedback, { color: colors.primary }]}>
            {feedback}
          </Text>
        ) : null}
        {error && plant ? (
          <Text
            accessibilityRole="alert"
            style={[styles.error, { color: colors.accent }]}
          >
            {error}
          </Text>
        ) : null}
        <Button label="Pogledaj baštu" onPress={onOpenGarden} />
      </Card>
      <Card>
        <Copy heading>Kako si danas?</Copy>
        <Copy muted>
          Izaberi raspoloženje koje najbolje opisuje današnji dan.
        </Copy>
        {moodLoading ? (
          <View style={styles.moodLoading}>
            <ActivityIndicator color={colors.primary} />
            <Copy muted>Učitavanje raspoloženja…</Copy>
          </View>
        ) : (
          <>
            <View accessibilityRole="radiogroup" style={styles.moodOptions}>
              {moodOptions.map(option => {
                const selected = selectedMood === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: selected }}
                    disabled={moodSaving}
                    onPress={() => {
                      setSelectedMood(option.value);
                      setMoodFeedback(null);
                    }}
                    style={({ pressed }) => [
                      styles.moodOption,
                      {
                        backgroundColor: selected
                          ? colors.surfaceAlt
                          : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.moodSymbol}>{option.symbol}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Button
              disabled={
                selectedMood === null ||
                selectedMood === savedMood ||
                moodSaving
              }
              label={
                moodSaving
                  ? 'Čuvanje…'
                  : savedMood === null
                  ? 'Sačuvaj raspoloženje'
                  : 'Promijeni raspoloženje'
              }
              onPress={saveMood}
            />
          </>
        )}
        {moodFeedback ? (
          <Text style={[styles.feedback, { color: colors.primary }]}>
            {moodFeedback}
          </Text>
        ) : null}
        {moodError ? (
          <Text
            accessibilityRole="alert"
            style={[styles.error, { color: colors.accent }]}
          >
            {moodError}
          </Text>
        ) : null}
        {spinWheelSuggestionVisible ? (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.spinWheelSuggestion,
              {
                backgroundColor: colors.accentSurface,
                borderColor: colors.accent,
              },
            ]}
          >
            <Badge>PRIJEDLOG ZA DANAS</Badge>
            <Copy heading>Želiš li mali izazov?</Copy>
            <Copy muted>
              Ako ti je danas teško, Spin Wheel ti može predložiti jednu malu i
              jednostavnu aktivnost. Prijedlog je potpuno opcionalan.
            </Copy>
            <Button label="Otvori Spin Wheel" onPress={onOpenSpinWheel} />
            <Pressable
              accessibilityRole="button"
              onPress={() => setSpinWheelSuggestionVisible(false)}
              style={({ pressed }) => [
                styles.dismissSuggestion,
                {
                  borderColor: colors.accent,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[styles.dismissSuggestionText, { color: colors.accent }]}
              >
                Ne sada
              </Text>
            </Pressable>
          </View>
        ) : null}
      </Card>
      <Card>
        <Copy heading>Trenutak za sebe</Copy>
        <Copy muted>
          Zavrti Spin Wheel i dopusti mu da izabere jednu malu aktivnost među
          trenutno aktivnim izazovima.
        </Copy>
        <Badge>Nasumičan dnevni izazov</Badge>
        <Button label="Otvori Spin Wheel" onPress={onOpenSpinWheel} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  progress: {
    fontSize: typography.heading,
    fontWeight: '700',
  },
  input: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: 24,
  },
  counter: {
    marginTop: -spacing.sm,
    textAlign: 'right',
    fontSize: typography.small,
  },
  feedback: {
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 24,
  },
  error: {
    fontSize: typography.body,
    lineHeight: 24,
  },
  moodLoading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodOption: {
    width: '31%',
    minWidth: 92,
    minHeight: 96,
    borderWidth: 2,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  moodSymbol: {
    fontSize: 30,
  },
  moodLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  spinWheelSuggestion: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dismissSuggestion: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  dismissSuggestionText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
});
