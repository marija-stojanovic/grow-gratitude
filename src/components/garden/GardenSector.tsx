import React from 'react';
import { StyleSheet, View } from 'react-native';
import { plantViewState } from '../../domain';
import type { GratitudeTheme, Plant } from '../../types';
import { spacing } from '../../theme/tokens';
import { Badge, Button, Card, Copy } from '../UI';
import { sortSectorPlants } from './gardenPresentation';
import { PlantCard } from './PlantCard';
import { WaterPlantForm } from './WaterPlantForm';

export function GardenSector({
  theme,
  plants,
  activePlant,
  today,
  draft,
  busyId,
  onOpenPlant,
  onChangeDraft,
  onWater,
  onAddPlant,
}: {
  theme: GratitudeTheme;
  plants: Plant[];
  activePlant: Plant | undefined;
  today: string;
  draft: string;
  busyId: string | null;
  onOpenPlant: (plantId: string) => void;
  onChangeDraft: (plantId: string, value: string) => void;
  onWater: (theme: GratitudeTheme, plant: Plant) => void;
  onAddPlant?: () => void;
}) {
  const sectorPlants = sortSectorPlants(plants);
  const activeState = activePlant ? plantViewState(activePlant, today) : null;
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headingCopy}>
          <Copy heading>{theme.name}</Copy>
          <Copy muted>{theme.description}</Copy>
        </View>
        <Badge>{`${sectorPlants.length} biljaka`}</Badge>
      </View>

      {sectorPlants.length === 0 ? (
        <Copy muted>U ovom sektoru još nema biljaka.</Copy>
      ) : (
        <View style={styles.plants}>
          {sectorPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              today={today}
              onOpen={() => onOpenPlant(plant.id)}
            />
          ))}
        </View>
      )}

      {activePlant && activeState ? (
        theme.isAutomatic ? (
          <Copy muted>Dnevni suncokret zalivaš na ekranu Danas.</Copy>
        ) : (
          <WaterPlantForm
            theme={theme}
            plant={activePlant}
            draft={draft}
            canWaterToday={activeState.canWaterToday}
            busy={busyId !== null}
            onChangeDraft={value => onChangeDraft(activePlant.id, value)}
            onWater={() => onWater(theme, activePlant)}
          />
        )
      ) : !theme.isAutomatic ? (
        <>
          <Copy muted>Ovaj sektor je slobodan za sadnju nove biljke.</Copy>
          {onAddPlant ? (
            <Button label="Dodaj novu biljku" onPress={onAddPlant} />
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headingCopy: { flex: 1, gap: spacing.xs },
  plants: { gap: spacing.md },
});
