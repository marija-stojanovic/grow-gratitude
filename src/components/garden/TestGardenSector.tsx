import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  DAYS_TO_COMPLETE_PLANT,
  growthStageFor,
  streakProgressMessage,
} from '../../domain';
import type { GratitudeTheme, PlantGrowthStage } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { SunflowerIllustration } from '../SunflowerIllustration';
import { CompletionConfetti } from '../CompletionConfetti';
import { Badge, Copy } from '../UI';

const stageStarts = [0, 1, 5, 9, 13, 17, 21] as const;

function nextStageStart(streak: number): number {
  return stageStarts.find(value => value > streak) ?? DAYS_TO_COMPLETE_PLANT;
}

function stageName(stage: PlantGrowthStage): string {
  const names: Record<PlantGrowthStage, string> = {
    seed: 'Sjeme',
    sprout: 'Klica',
    small: 'Mala biljka',
    medium: 'Srednja biljka',
    large: 'Velika biljka',
    'almost-grown': 'Skoro odrasla',
    'fully-grown': 'Potpuno odrasla',
    withered: 'Uvenula biljka',
  };
  return names[stage];
}

export function TestGardenSector({
  themes,
  busy = false,
  feedback,
  onAddCompleted,
}: {
  themes: GratitudeTheme[];
  busy?: boolean;
  feedback?: string | null;
  onAddCompleted?: (theme: GratitudeTheme) => void;
}) {
  const { colors } = useTheme();
  const [streak, setStreak] = useState(0);
  const [withered, setWithered] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [watering, setWatering] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const healthyStage = growthStageFor(streak);
  const displayedStage: PlantGrowthStage = withered ? 'withered' : healthyStage;
  const selectedTheme =
    themes.find(theme => theme.id === selectedThemeId) ?? null;
  const completed = !withered && streak === DAYS_TO_COMPLETE_PLANT;

  const animateWatering = (nextStreak: number, revive = false) => {
    if (watering) {
      return;
    }
    setWatering(true);
    setTimeout(() => {
      if (revive) {
        setWithered(false);
      }
      setStreak(nextStreak);
      setAnimationKey(value => value + 1);
      setWatering(false);
      if (nextStreak === DAYS_TO_COMPLETE_PLANT) {
        setCelebrationKey(value => value + 1);
      }
    }, 850);
  };

  const addDay = () => {
    animateWatering(
      withered ? 1 : Math.min(streak + 1, DAYS_TO_COMPLETE_PLANT),
      withered,
    );
  };

  const reset = () => {
    setStreak(0);
    setWithered(false);
    setWatering(false);
    setAnimationKey(value => value + 1);
  };

  return (
    <View style={styles.root}>
      <View style={styles.sectorChoice}>
        <Copy heading>Izaberi sektor</Copy>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectorList}
        >
          {themes.map(theme => {
            const selected = theme.id === selectedThemeId;
            return (
              <Pressable
                key={theme.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedThemeId(theme.id)}
                style={({ pressed }) => [
                  styles.sectorButton,
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
                    styles.sectorButtonText,
                    { color: selected ? colors.onPrimary : colors.text },
                  ]}
                >
                  {theme.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.illustrationArea}>
        <SunflowerIllustration
          stage={displayedStage}
          witheredFromStage={withered ? healthyStage : null}
          watering={watering}
          animationKey={animationKey}
        />
        {celebrationKey > 0 && completed ? (
          <CompletionConfetti key={celebrationKey} />
        ) : null}
      </View>

      <View style={styles.badges}>
        <Badge>{stageName(displayedStage)}</Badge>
        <Badge>{streakProgressMessage(withered ? 0 : streak)}</Badge>
      </View>

      <View style={styles.actions}>
        <TestButton
          label={withered ? 'Novo zalivanje · 1/21' : '+1 dan'}
          disabled={watering || (!withered && completed)}
          onPress={addDay}
        />
        <TestButton
          label="Sljedeća faza"
          disabled={watering || withered || completed}
          onPress={() => animateWatering(nextStageStart(streak))}
        />
        <TestButton
          label="Preskoči dan · uveni"
          disabled={watering || withered || streak === 0 || completed}
          onPress={() => setWithered(true)}
        />
        <TestButton label="Vrati na sjeme" disabled={watering} onPress={reset} />
      </View>

      {completed && selectedTheme && onAddCompleted ? (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => onAddCompleted(selectedTheme)}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.primary,
              opacity: busy ? 0.5 : pressed ? 0.72 : 1,
            },
          ]}
        >
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}> 
            {busy ? 'Dodavanje…' : 'Dodaj u baštu'}
          </Text>
        </Pressable>
      ) : null}

      {feedback ? (
        <Text style={[styles.feedback, { color: colors.primary }]}> 
          {feedback}
        </Text>
      ) : null}
    </View>
  );
}

function TestButton({
  label,
  disabled = false,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.actionText, { color: colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.md, paddingBottom: spacing.lg },
  illustrationArea: { position: 'relative', overflow: 'hidden' },
  sectorChoice: { gap: spacing.sm },
  sectorList: { gap: spacing.sm, paddingRight: spacing.lg },
  sectorButton: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sectorButtonText: { fontSize: typography.small, fontWeight: '700' },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    width: '48%',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    fontSize: typography.small,
    fontWeight: '700',
    textAlign: 'center',
  },
  addButton: {
    minHeight: 42,
    alignSelf: 'center',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  addButtonText: { fontSize: typography.small, fontWeight: '700' },
  feedback: { fontSize: typography.small, textAlign: 'center' },
});
