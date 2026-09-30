import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChallengeWheel } from '../components/ChallengeWheel';
import { Badge, Button, Card, Copy, Screen } from '../components/UI';
import { localDateFor } from '../domain';
import { challengeRepository } from '../repositories/challengeRepository';
import {
  completeChallenge,
  selectRandomChallenge,
} from '../services/spinWheelService';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, typography } from '../theme/tokens';
import type { Challenge } from '../types';

export function SpinWheelScreen() {
  const { colors } = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;
  const [targetRotation, setTargetRotation] = useState(1440);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const today = localDateFor(new Date());

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeChallenges = await challengeRepository.findActive();
      setChallenges(activeChallenges);
      if (activeChallenges.length === 0) {
        setError('Nema aktivnih izazova. Uključite barem jedan izazov.');
      }
    } catch {
      setError('Izazovi se trenutno ne mogu učitati. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const spin = () => {
    if (spinning || challenges.length === 0) {
      return;
    }
    const chosenChallenge = selectRandomChallenge(challenges);
    const chosenIndex = challenges.findIndex(
      challenge => challenge.id === chosenChallenge.id,
    );
    const sliceAngle = 360 / challenges.length;
    const chosenMiddle = chosenIndex * sliceAngle + sliceAngle / 2;
    const alignment = (90 - chosenMiddle + 360) % 360;
    setTargetRotation(1440 + alignment);
    setSpinning(true);
    setSelectedChallenge(null);
    setCompleted(false);
    setFeedback(null);
    setError(null);
    rotation.setValue(0);
    requestAnimationFrame(() => {
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setSelectedChallenge(chosenChallenge);
        }
        setSpinning(false);
      });
    });
  };

  const markCompleted = async () => {
    if (!selectedChallenge || saving) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    setError(null);
    try {
      const result = await completeChallenge({
        challengeId: selectedChallenge.id,
        completionDate: today,
        completedAt: new Date().toISOString(),
      });
      setCompleted(true);
      setFeedback(
        result.alreadyCompleted
          ? 'Ovaj izazov je već evidentiran za danas.'
          : 'Bravo! Izazov je evidentiran kao izvršen.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Izvršenje izazova trenutno nije moguće sačuvati.',
      );
    } finally {
      setSaving(false);
    }
  };

  const wheelRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${targetRotation}deg`],
  });

  return (
    <Screen
      eyebrow="MALI KORAK ZA DANAS"
      title="Spin Wheel izazov"
      description="Zavrti točak i dopusti mu da izabere jednu malu aktivnost."
    >
      <Card tinted>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Copy muted>Učitavanje izazova…</Copy>
          </View>
        ) : (
          <>
            <View style={styles.wheelArea}>
              <View
                style={[styles.pointer, { borderRightColor: colors.accent }]}
              />
              <Animated.View
                accessibilityLabel="Spin Wheel"
                style={[styles.wheel, { transform: [{ rotate: wheelRotation }] }]}
              >
                <ChallengeWheel challenges={challenges} />
              </Animated.View>
            </View>
            <Button
              disabled={spinning || challenges.length === 0}
              label={spinning ? 'Točak se okreće…' : 'Zavrti Spin Wheel'}
              onPress={spin}
            />
          </>
        )}
      </Card>

      {selectedChallenge ? (
        <Card>
          <Badge>DANAŠNJI IZAZOV</Badge>
          <Copy heading>{selectedChallenge.title}</Copy>
          <Copy muted>
            Uradi aktivnost kada ti odgovara, a zatim je označi kao izvršenu.
          </Copy>
          <Button
            disabled={saving || completed}
            label={
              saving
                ? 'Čuvanje…'
                : completed
                ? 'Izazov je izvršen'
                : 'Označi kao izvršen'
            }
            onPress={markCompleted}
          />
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
          {challenges.length === 0 ? (
            <Button label="Pokušaj ponovo" onPress={loadChallenges} />
          ) : null}
        </Card>
      ) : null}

      {challenges.length > 0 ? (
        <Card>
          <Copy heading>Aktivni izazovi</Copy>
          <Copy muted>
            Točak trenutno bira između {challenges.length} aktivnih izazova.
          </Copy>
          <View style={styles.challengeList}>
            {challenges.map((challenge, index) => (
              <View
                key={challenge.id}
                style={[styles.challengeRow, { borderColor: colors.border }]}
              >
                <Text style={[styles.number, { color: colors.primary }]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.challengeTitle, { color: colors.text }]}>
                  {challenge.title}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  wheelArea: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    position: 'absolute',
    right: -2,
    top: '46%',
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderRightWidth: 28,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    zIndex: 2,
  },
  wheel: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { fontSize: typography.body, fontWeight: '600', lineHeight: 24 },
  challengeList: { gap: spacing.sm },
  challengeRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  number: { width: 30, fontSize: typography.body, fontWeight: '700' },
  challengeTitle: { flex: 1, fontSize: typography.body, lineHeight: 24 },
});
