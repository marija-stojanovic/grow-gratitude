import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GardenField,
  GardenSector,
  PlantDetails,
  PlantingForm,
  TestGardenSector,
} from '../components/garden';
import { Button, Card, Copy, Screen } from '../components/UI';
import { localDateFor } from '../domain';
import { gratitudeRepository } from '../repositories/gratitudeRepository';
import { plantRepository } from '../repositories/plantRepository';
import { themeRepository } from '../repositories/themeRepository';
import { deletePlantPermanently } from '../services/plantDeletionService';
import {
  addCompletedDemoPlantToGarden,
  startPlantForTheme,
} from '../services/plantingService';
import { saveGratitudeAndWaterPlant } from '../services/wateringService';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/tokens';
import type { GratitudeEntry, GratitudeTheme, Plant } from '../types';

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
  const [selectedPlantingTheme, setSelectedPlantingTheme] =
    useState<GratitudeTheme | null>(null);
  const [newPlantName, setNewPlantName] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedGardenThemeId, setSelectedGardenThemeId] = useState<
    string | null
  >(null);
  const [showDemo, setShowDemo] = useState(false);
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);
  const [detailGratitudes, setDetailGratitudes] = useState<GratitudeEntry[]>(
    [],
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [gratitudeDrafts, setGratitudeDrafts] = useState<
    Record<string, string>
  >({});
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

  const selectedPlant = useMemo(
    () => plants.find(plant => plant.id === selectedPlantId) ?? null,
    [plants, selectedPlantId],
  );
  const selectedTheme = selectedPlant
    ? themes.find(theme => theme.id === selectedPlant.themeId) ?? null
    : null;

  const loadPlantDetails = useCallback(async (plantId: string) => {
    setLoadingDetails(true);
    setError(null);
    try {
      setDetailGratitudes(await gratitudeRepository.findForPlant(plantId));
    } catch {
      setError('Zahvalnosti ove biljke trenutno nije moguće učitati.');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPlantId) {
      loadPlantDetails(selectedPlantId);
    } else {
      setDetailGratitudes([]);
    }
  }, [loadPlantDetails, selectedPlantId]);

  const closePlanting = () => {
    setShowPlantingOptions(false);
    setSelectedPlantingTheme(null);
    setNewPlantName('');
  };

  const plantNewCycle = async (theme: GratitudeTheme, name = theme.name) => {
    if (busyId) {
      return;
    }
    setBusyId(theme.id);
    setError(null);
    setFeedback(null);
    try {
      const newPlant = await startPlantForTheme(
        theme.id,
        new Date().toISOString(),
        name,
      );
      await loadGarden();
      closePlanting();
      setFeedback(
        `${newPlant.name} je zasađen u sektoru ${theme.name}. Počinje ${newPlant.cycleNumber}. ciklus.`,
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
        text: gratitudeDrafts[plant.id] ?? '',
        entryDate: today,
        createdAt: new Date().toISOString(),
      });
      setGratitudeDrafts(current => ({ ...current, [plant.id]: '' }));
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
              onPress: () => plantNewCycle(theme, plant.name),
            },
          ],
        );
      } else if (result.restartedAfterMiss) {
        setFeedback(`${plant.name}: novi niz je počeo od 1/21.`);
      } else {
        setFeedback(`${plant.name}: zahvalnost je sačuvana.`);
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

  const confirmDelete = (plant: Plant) => {
    if (plant.isAutomatic && plant.status !== 'completed') {
      setError(
        'Aktivni dnevni suncokret ne može se obrisati jer mora uvijek postojati na ekranu Danas.',
      );
      return;
    }
    Alert.alert(
      'Trajno obrisati biljku?',
      `Biće obrisan ${plant.name}, ${plant.cycleNumber}. ciklus, kao i sve zahvalnosti povezane s tom biljkom. Ovu radnju nije moguće poništiti.`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Trajno obriši',
          style: 'destructive',
          onPress: () => {
            (async () => {
              setBusyId(plant.id);
              setError(null);
              try {
                const result = await deletePlantPermanently({
                  plantId: plant.id,
                  confirmed: true,
                });
                setSelectedPlantId(null);
                await loadGarden();
                setFeedback(
                  `Biljka je obrisana zajedno sa ${result.deletedGratitudeCount} povezanih zahvalnosti.`,
                );
              } catch (caughtError) {
                setError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : 'Biljku trenutno nije moguće obrisati.',
                );
              } finally {
                setBusyId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const addDemoPlant = async (theme: GratitudeTheme) => {
    if (busyId) {
      return;
    }
    setBusyId('demo-plant');
    setDemoFeedback(null);
    try {
      const plant = await addCompletedDemoPlantToGarden(
        theme.id,
        new Date().toISOString(),
      );
      await loadGarden();
      setDemoFeedback(
        `${plant.name}, ${plant.cycleNumber}. ciklus, dodat je u baštu.`,
      );
    } catch (caughtError) {
      setDemoFeedback(
        caughtError instanceof Error
          ? caughtError.message
          : 'Demo biljku trenutno nije moguće dodati u baštu.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const selectedGardenTheme =
    themes.find(theme => theme.id === selectedGardenThemeId) ?? null;
  const selectedGardenActivePlant = selectedGardenTheme
    ? activePlantFor(plants, selectedGardenTheme.id)
    : undefined;

  if (selectedPlant && selectedTheme) {
    return (
      <PlantDetails
        plant={selectedPlant}
        theme={selectedTheme}
        today={today}
        gratitudes={detailGratitudes}
        loadingGratitudes={loadingDetails}
        busy={busyId === selectedPlant.id}
        error={error}
        onBack={() => setSelectedPlantId(null)}
        onDelete={() => confirmDelete(selectedPlant)}
      />
    );
  }

  if (showDemo) {
    return (
      <ScrollView
        style={[styles.demoRoot, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.demoContent}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nazad u baštu"
          onPress={() => setShowDemo(false)}
          style={({ pressed }) => [
            styles.demoBack,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.demoBackText, { color: colors.text }]}>
            ← Nazad
          </Text>
        </Pressable>
        <TestGardenSector
          themes={themes}
          busy={busyId === 'demo-plant'}
          feedback={demoFeedback}
          onAddCompleted={addDemoPlant}
        />
      </ScrollView>
    );
  }

  if (showPlantingOptions && selectedPlantingTheme) {
    return (
      <Screen
        eyebrow="NOVA BILJKA"
        title={selectedPlantingTheme.name}
        description="Započni novi ciklus u izabranom sektoru."
      >
        <Button label="← Nazad u sektor" onPress={closePlanting} />
        <PlantingForm
          availableThemes={[selectedPlantingTheme]}
          selectedTheme={selectedPlantingTheme}
          plantName={newPlantName}
          busy={busyId !== null}
          lockTheme
          onChooseTheme={() => undefined}
          onChangeName={setNewPlantName}
          onPlant={() =>
            plantNewCycle(selectedPlantingTheme, newPlantName)
          }
          onChooseAnotherTheme={() => undefined}
        />
      </Screen>
    );
  }

  if (selectedGardenTheme) {
    return (
      <Screen
        eyebrow="SEKTOR BAŠTE"
        title={selectedGardenTheme.isAutomatic ? 'Danas' : selectedGardenTheme.name}
        description={selectedGardenTheme.description}
      >
        <Button
          label="← Nazad na poljanu"
          onPress={() => setSelectedGardenThemeId(null)}
        />
        {feedback ? (
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.primary }]}
          >
            {feedback}
          </Text>
        ) : null}
        {error ? (
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.accent }]}
          >
            {error}
          </Text>
        ) : null}
        <GardenSector
          theme={selectedGardenTheme}
          plants={plants.filter(
            plant => plant.themeId === selectedGardenTheme.id,
          )}
          activePlant={selectedGardenActivePlant}
          today={today}
          draft={
            selectedGardenActivePlant
              ? gratitudeDrafts[selectedGardenActivePlant.id] ?? ''
              : ''
          }
          busyId={busyId}
          onOpenPlant={setSelectedPlantId}
          onChangeDraft={(plantId, value) =>
            setGratitudeDrafts(current => ({
              ...current,
              [plantId]: value,
            }))
          }
          onWater={waterPlant}
          onAddPlant={() => {
            setSelectedPlantingTheme(selectedGardenTheme);
            setNewPlantName(selectedGardenTheme.name);
            setShowPlantingOptions(true);
            setError(null);
          }}
        />
      </Screen>
    );
  }

  return (
    <View style={[styles.gardenRoot, { backgroundColor: colors.background }]}>
      <View style={styles.gardenHeader}>
        <View style={styles.gardenHeading}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>BAŠTA</Text>
          <Text style={[styles.title, { color: colors.text }]}>Tvoja poljana</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Dodirni sektor da otvoriš njegove biljke.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowDemo(true)}
          style={({ pressed }) => [
            styles.demoButton,
            {
              backgroundColor: colors.accentSurface,
              borderColor: colors.accent,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.demoButtonText, { color: colors.accent }]}>
            Demo
          </Text>
        </Pressable>
      </View>

      {loading && themes.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Copy muted>Učitavanje bašte…</Copy>
        </View>
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
        <GardenField
          themes={themes}
          plants={plants}
          today={today}
          selectedThemeId={null}
          onSelectTheme={setSelectedGardenThemeId}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: typography.body, lineHeight: 25 },
  gardenRoot: { flex: 1, padding: 12, gap: 10 },
  gardenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gardenHeading: { flex: 1 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 19 },
  demoButton: {
    minWidth: 72,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  demoButtonText: { fontSize: 14, fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  demoRoot: { flex: 1 },
  demoContent: { flexGrow: 1, padding: 16, gap: 12 },
  demoBack: {
    minHeight: 38,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  demoBackText: { fontSize: 13, fontWeight: '700' },
});
