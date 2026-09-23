import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Badge, Button, Card, Copy, Screen } from '../components/UI';
import { SunflowerIllustration } from '../components/SunflowerIllustration';
import { localDateFor, plantViewState, streakProgressMessage } from '../domain';
import { plantRepository } from '../repositories/plantRepository';
import { themeRepository } from '../repositories/themeRepository';
import { startPlantForTheme } from '../services/plantingService';
import { saveGratitudeAndWaterPlant } from '../services/wateringService';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import type { GratitudeTheme, Plant } from '../types';

function activePlantFor(plants: Plant[], themeId: string): Plant | undefined {
  return plants.find(
    plant => plant.themeId === themeId && plant.status !== 'completed',
  );
}

export function GardenScreen() {
  const { colors } = useTheme();
  const [themes, setThemes] = useState<GratitudeTheme[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showPlantingOptions, setShowPlantingOptions] = useState(false);
  const [gratitudes, setGratitudes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const today = localDateFor(new Date());

  const loadGarden = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allThemes, allPlants] = await Promise.all([
        themeRepository.findActive(),
        plantRepository.findAll(),
      ]);
      setThemes(allThemes);
      setPlants(allPlants);
    } catch {
      setError('Bašta se trenutno ne može učitati. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGarden();
  }, [loadGarden]);

  const plantNewCycle = async (theme: GratitudeTheme) => {
    if (busyId) {
      return;
    }
    setBusyId(theme.id);
    setError(null);
    try {
      const newPlant = await startPlantForTheme(
        theme.id,
        new Date().toISOString(),
      );
      await loadGarden();
      setShowPlantingOptions(false);
      setFeedback(
        `Zasađena je biljka za temu ${theme.name}, ${newPlant.cycleNumber}. ciklus.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Biljka nije zasađena. Pokušajte ponovo.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const waterPlant = async (theme: GratitudeTheme, plant: Plant) => {
    if (busyId) {
      return;
    }
    setBusyId(plant.id);
    setError(null);
    setFeedback(null);
    try {
      const result = await saveGratitudeAndWaterPlant({
        id: `gratitude:${plant.id}:${today}`,
        plantId: plant.id,
        text: gratitudes[plant.id] ?? '',
        entryDate: today,
        createdAt: new Date().toISOString(),
      });
      setGratitudes(current => ({ ...current, [plant.id]: '' }));
      await loadGarden();
      if (result.completedNow && result.offerNextCycle) {
        setFeedback(`Uspješno ste završili ${plant.cycleNumber}. ciklus.`);
        Alert.alert(
          'Biljka je potpuno odrasla',
          `Želite li započeti uzgajanje nove biljke za temu ${theme.name}?`,
          [
            { text: 'Ne sada', style: 'cancel' },
            {
              text: 'Započni novu biljku',
              onPress: () => {
                void plantNewCycle(theme);
              },
            },
          ],
        );
      } else if (result.restartedAfterMiss) {
        setFeedback(`${theme.name}: novi niz je počeo od 1/21.`);
      } else {
        setFeedback(`${theme.name}: zahvalnost je sačuvana.`);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Zalivanje nije uspjelo. Pokušajte ponovo.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const availableThemes = themes.filter(
    theme => !theme.isAutomatic && !activePlantFor(plants, theme.id),
  );
  const completedCount = plants.filter(
    plant => plant.status === 'completed',
  ).length;

  return (
    <Screen
      eyebrow="TVOJ PROSTOR ZA RAST"
      title="Bašta zahvalnosti"
      description="Svaka tema ima svoj sektor i svoje cikluse rasta."
    >
      {loading && themes.length === 0 ? (
        <Card tinted>
          <ActivityIndicator color={colors.primary} />
          <Copy muted>Učitavanje bašte…</Copy>
        </Card>
      ) : null}

      {feedback ? (
        <Text
          accessibilityRole="alert"
          style={[styles.message, { color: colors.primary }]}
        >
          {feedback}
        </Text>
      ) : null}
      {error ? (
        <Card>
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.accent }]}
          >
            {error}
          </Text>
          {themes.length === 0 ? (
            <Button label="Pokušaj ponovo" onPress={loadGarden} />
          ) : null}
        </Card>
      ) : null}

      {themes.length > 0 ? (
        <>
          <Card tinted>
            <Copy heading>Moja bašta</Copy>
            <Copy muted>
              {plants.filter(plant => plant.status !== 'completed').length}{' '}
              aktivnih biljaka · {completedCount} završenih ciklusa
            </Copy>
            <Button
              label={
                showPlantingOptions ? 'Zatvori izbor' : 'Dodaj novu biljku'
              }
              onPress={() => setShowPlantingOptions(value => !value)}
            />
          </Card>

          {showPlantingOptions ? (
            <Card>
              <Copy heading>Izaberi temu za novu biljku</Copy>
              {availableThemes.length === 0 ? (
                <Copy muted>
                  U svakoj dostupnoj temi već raste po jedna biljka.
                </Copy>
              ) : (
                availableThemes.map(theme => (
                  <View
                    key={theme.id}
                    style={[styles.option, { borderColor: colors.border }]}
                  >
                    <Copy heading>{theme.name}</Copy>
                    <Copy muted>{theme.description}</Copy>
                    <Button
                      disabled={busyId !== null}
                      label={`Zasadi: ${theme.name}`}
                      onPress={() => {
                        void plantNewCycle(theme);
                      }}
                    />
                  </View>
                ))
              )}
            </Card>
          ) : null}

          {themes.map(theme => {
            const active = activePlantFor(plants, theme.id);
            const completed = plants
              .filter(
                plant =>
                  plant.themeId === theme.id && plant.status === 'completed',
              )
              .sort((a, b) => b.cycleNumber - a.cycleNumber);
            const state = active ? plantViewState(active, today) : null;
            const draft = active ? gratitudes[active.id] ?? '' : '';
            return (
              <Card key={theme.id}>
                <Copy heading>{theme.name}</Copy>
                <Copy muted>{theme.description}</Copy>
                {active && state ? (
                  <>
                    {theme.isAutomatic ? (
                      <SunflowerIllustration
                        stage={state.stage}
                        witheredFromStage={state.witheredFromStage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.placeholder,
                          { backgroundColor: colors.surfaceAlt },
                        ]}
                      >
                        <Text
                          style={[
                            styles.placeholderSymbol,
                            { color: colors.primary },
                          ]}
                        >
                          ✿
                        </Text>
                        <Copy muted>
                          Ilustracija biljke za ovu temu je u pripremi.
                        </Copy>
                      </View>
                    )}
                    <Badge>{`${active.cycleNumber}. ciklus u toku`}</Badge>
                    <Text style={[styles.progress, { color: colors.primary }]}>
                      {streakProgressMessage(state.streak)}
                    </Text>
                    {state.stage === 'withered' ? (
                      <Copy muted>
                        Biljka je uvenula. Novim zalivanjem niz počinje od 1/21.
                      </Copy>
                    ) : null}
                    {theme.isAutomatic ? (
                      <Copy muted>
                        Dnevni suncokret zalivaš na ekranu Danas.
                      </Copy>
                    ) : (
                      <>
                        <TextInput
                          accessibilityLabel={`Zahvalnost za temu ${theme.name}`}
                          editable={busyId === null && state.canWaterToday}
                          maxLength={300}
                          multiline
                          onChangeText={value =>
                            setGratitudes(current => ({
                              ...current,
                              [active.id]: value,
                            }))
                          }
                          placeholder={
                            state.canWaterToday
                              ? `Na čemu ste danas zahvalni u temi ${theme.name}?`
                              : 'Ova biljka je danas već zalivena.'
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
                          value={draft}
                        />
                        <Button
                          disabled={
                            busyId !== null ||
                            !state.canWaterToday ||
                            !draft.trim()
                          }
                          label={
                            busyId === active.id
                              ? 'Čuvanje…'
                              : `Zalij biljku: ${theme.name}`
                          }
                          onPress={() => {
                            void waterPlant(theme, active);
                          }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <Copy muted>
                    {theme.isAutomatic
                      ? 'Aktivni suncokret nije pronađen.'
                      : 'Trenutno nema aktivne biljke u ovom sektoru.'}
                  </Copy>
                )}
                {completed.length > 0 ? (
                  <View style={styles.completedList}>
                    <Copy heading>Uspješno uzgojene biljke</Copy>
                    {completed.map(finished => (
                      <Copy key={finished.id} muted>
                        {`${finished.cycleNumber}. ciklus · 21/21 dana`}
                      </Copy>
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: typography.body, lineHeight: 25 },
  option: { gap: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: 1 },
  placeholder: {
    minHeight: 150,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  placeholderSymbol: { fontSize: 48 },
  progress: { fontSize: typography.heading, fontWeight: '700' },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: 24,
  },
  completedList: { gap: spacing.sm, paddingTop: spacing.sm },
});
