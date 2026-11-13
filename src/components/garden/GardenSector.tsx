import React from 'react';
import { StyleSheet, View } from 'react-native';
import { plantViewState } from '../../domain';
import type { GratitudeTheme, Plant } from '../../types';
import { spacing } from '../../theme/tokens';
import { SunflowerIllustration } from '../SunflowerIllustration';
import { CompletionConfetti } from '../CompletionConfetti';
import { Badge, Button, Card, Copy } from '../UI';
import {
  gardenPlantStatus,
  sortSectorPlants,
} from './gardenPresentation';
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
  animationKey,
  celebrating,
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
  animationKey: number;
  celebrating: boolean;
}) {
  const sectorPlants = sortSectorPlants(plants);
  const previousPlants = activePlant
    ? sectorPlants.filter(plant => plant.id !== activePlant.id)
    : sectorPlants;
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

      {activePlant && activeState ? (
        <View style={styles.activePlant}>
          <View style={styles.illustrationArea}>
            <SunflowerIllustration
              stage={activeState.stage}
              witheredFromStage={activeState.witheredFromStage}
              watering={busyId === activePlant.id}
              animationKey={animationKey}
            />
            {celebrating ? <CompletionConfetti /> : null}
          </View>
          <Copy heading>{activePlant.name}</Copy>
          <View style={styles.badges}>
            <Badge>{gardenPlantStatus(activePlant, today)}</Badge>
            <Badge>{`${activePlant.cycleNumber}. ciklus`}</Badge>
          </View>
          <Copy muted>{`${activeState.streak}/21 uzastopnih dana`}</Copy>
        </View>
      ) : null}

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

      {previousPlants.length === 0 && !activePlant ? (
        <Copy muted>U ovom sektoru još nema prethodnih biljaka.</Copy>
      ) : previousPlants.length > 0 ? (
        <View style={styles.plants}>
          <Copy heading>Prethodne biljke</Copy>
          {previousPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              today={today}
              onOpen={() => onOpenPlant(plant.id)}
            />
          ))}
        </View>
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
  activePlant: { alignItems: 'center', gap: spacing.sm },
  illustrationArea: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
