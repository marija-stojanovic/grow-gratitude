import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Badge, Button, Card, Copy, Screen } from '../components/UI';
import { challengeRepository } from '../repositories/challengeRepository';
import {
  createCustomChallenge,
  deleteCustomChallenge,
  renameCustomChallenge,
  setChallengeActive,
} from '../services/challengeManagementService';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import type { Challenge, ThemePreference } from '../types';
import { version } from '../../package.json';

const options: {
  value: ThemePreference;
  title: string;
  description: string;
}[] = [
  {
    value: 'system',
    title: 'Sistemska',
    description: 'Prati izgled tvog uređaja.',
  },
  {
    value: 'light',
    title: 'Svijetla',
    description: 'Svijetle površine i nježne zelene boje.',
  },
  {
    value: 'dark',
    title: 'Tamna',
    description: 'Tamnije površine za ugodan pregled.',
  },
];

export function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(
    null,
  );
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    setLoadingChallenges(true);
    setChallengeError(null);
    try {
      setChallenges(await challengeRepository.findAll());
    } catch {
      setChallengeError('Izazovi se trenutno ne mogu učitati.');
    } finally {
      setLoadingChallenges(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const resetChallengeForm = () => {
    setChallengeTitle('');
    setEditingId(null);
  };

  const saveChallenge = async () => {
    if (busyId) {
      return;
    }
    setBusyId(editingId ?? 'new');
    setChallengeError(null);
    setChallengeFeedback(null);
    try {
      const timestamp = new Date().toISOString();
      if (editingId) {
        await renameCustomChallenge({
          id: editingId,
          title: challengeTitle,
          updatedAt: timestamp,
        });
        setChallengeFeedback('Korisnički izazov je izmijenjen.');
      } else {
        await createCustomChallenge({
          id: `challenge:custom:${Date.now()}`,
          title: challengeTitle,
          createdAt: timestamp,
        });
        setChallengeFeedback('Novi izazov je dodat i uključen u Spin Wheel.');
      }
      resetChallengeForm();
      await loadChallenges();
    } catch (caughtError) {
      setChallengeError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Izazov trenutno nije moguće sačuvati.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const toggleChallenge = async (challenge: Challenge) => {
    if (busyId) {
      return;
    }
    setBusyId(challenge.id);
    setChallengeError(null);
    setChallengeFeedback(null);
    try {
      await setChallengeActive({
        id: challenge.id,
        isActive: !challenge.isActive,
        updatedAt: new Date().toISOString(),
      });
      setChallengeFeedback(
        challenge.isActive
          ? 'Izazov je isključen iz Spin Wheela.'
          : 'Izazov je uključen u Spin Wheel.',
      );
      await loadChallenges();
    } catch (caughtError) {
      setChallengeError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Status izazova trenutno nije moguće promijeniti.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeleteChallenge = (challenge: Challenge) => {
    Alert.alert(
      'Obrisati izazov?',
      `Izazov „${challenge.title}“ i njegova evidentirana izvršenja biće trajno obrisani.`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusyId(challenge.id);
              setChallengeError(null);
              setChallengeFeedback(null);
              try {
                await deleteCustomChallenge(challenge.id);
                if (editingId === challenge.id) {
                  resetChallengeForm();
                }
                setChallengeFeedback('Korisnički izazov je obrisan.');
                await loadChallenges();
              } catch (caughtError) {
                setChallengeError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : 'Izazov trenutno nije moguće obrisati.',
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

  const activeCount = challenges.filter(challenge => challenge.isActive).length;
  return (
    <Screen
      eyebrow="PO TVOJOJ MJERI"
      title="Postavke"
      description="Prilagodi svoj mali prostor zahvalnosti."
    >
      <Card>
        <Copy heading>Izgled aplikacije</Copy>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Tema aplikacije"
          style={styles.options}
        >
          {options.map(option => {
            const selected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${option.title}. ${option.description}`}
                onPress={() => setPreference(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: selected
                      ? colors.surfaceAlt
                      : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <View style={styles.optionText}>
                  <Copy heading>{option.title}</Copy>
                  <Copy muted>{option.description}</Copy>
                </View>
                <Text
                  importantForAccessibility="no"
                  style={[styles.check, { color: colors.primary }]}
                >
                  {selected ? '●' : '○'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Copy muted>
          Izbor trenutno važi dok je aplikacija otvorena. Trajno čuvanje
          postavki dodat ćemo uz lokalnu bazu.
        </Copy>
      </Card>
      <Card>
        <Copy heading>Dnevni podsjetnik</Copy>
        <Copy muted>
          Ovdje ćeš moći uključiti podsjetnik i izabrati vrijeme koje ti
          odgovara.
        </Copy>
        <Badge>U pripremi</Badge>
      </Card>
      <Card>
        <Copy heading>Tvoji izazovi</Copy>
        <Copy muted>
          Aktivni izazovi ulaze u nasumičan izbor. Ugrađene možeš uključiti ili
          isključiti, a svoje možeš i uređivati ili brisati.
        </Copy>
        <Badge>{`${activeCount} aktivnih · ${challenges.length} ukupno`}</Badge>

        <View style={styles.challengeForm}>
          <Copy heading>
            {editingId ? 'Uredi svoj izazov' : 'Dodaj svoj izazov'}
          </Copy>
          <TextInput
            accessibilityLabel="Naziv korisničkog izazova"
            editable={busyId === null}
            maxLength={100}
            onChangeText={setChallengeTitle}
            placeholder="Na primjer: Pročitaj deset stranica knjige."
            placeholderTextColor={colors.muted}
            style={[
              styles.challengeInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={challengeTitle}
          />
          <Text style={[styles.counter, { color: colors.muted }]}>
            {challengeTitle.length}/100
          </Text>
          <Button
            disabled={busyId !== null || !challengeTitle.trim()}
            label={
              busyId === (editingId ?? 'new')
                ? 'Čuvanje…'
                : editingId
                ? 'Sačuvaj izmjene'
                : 'Dodaj izazov'
            }
            onPress={saveChallenge}
          />
          {editingId ? (
            <Pressable
              accessibilityRole="button"
              disabled={busyId !== null}
              onPress={resetChallengeForm}
              style={({ pressed }) => [
                styles.secondaryAction,
                {
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                Odustani od uređivanja
              </Text>
            </Pressable>
          ) : null}
        </View>

        {challengeFeedback ? (
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.primary }]}
          >
            {challengeFeedback}
          </Text>
        ) : null}
        {challengeError ? (
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.accent }]}
          >
            {challengeError}
          </Text>
        ) : null}

        {loadingChallenges ? (
          <View style={styles.loadingChallenges}>
            <ActivityIndicator color={colors.primary} />
            <Copy muted>Učitavanje izazova…</Copy>
          </View>
        ) : (
          <View style={styles.challengeList}>
            {challenges.map(challenge => (
              <View
                key={challenge.id}
                style={[
                  styles.challengeRow,
                  {
                    backgroundColor: challenge.isActive
                      ? colors.surfaceAlt
                      : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeCopy}>
                    <Copy heading>{challenge.title}</Copy>
                    <Copy muted>
                      {challenge.origin === 'built-in'
                        ? 'Ugrađeni izazov'
                        : 'Tvoj izazov'}
                    </Copy>
                  </View>
                  <Switch
                    accessibilityLabel={`${
                      challenge.isActive ? 'Isključi' : 'Uključi'
                    } izazov ${challenge.title}`}
                    disabled={busyId !== null}
                    onValueChange={() => {
                      void toggleChallenge(challenge);
                    }}
                    thumbColor={
                      challenge.isActive ? colors.primary : colors.muted
                    }
                    trackColor={{
                      false: colors.border,
                      true: colors.accentSurface,
                    }}
                    value={challenge.isActive}
                  />
                </View>
                {challenge.origin === 'custom' ? (
                  <View style={styles.challengeActions}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busyId !== null}
                      onPress={() => {
                        setEditingId(challenge.id);
                        setChallengeTitle(challenge.title);
                        setChallengeError(null);
                        setChallengeFeedback(null);
                      }}
                      style={({ pressed }) => [
                        styles.smallAction,
                        {
                          borderColor: colors.primary,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.actionText, { color: colors.primary }]}
                      >
                        Uredi
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busyId !== null}
                      onPress={() => confirmDeleteChallenge(challenge)}
                      style={({ pressed }) => [
                        styles.smallAction,
                        {
                          borderColor: colors.accent,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.actionText, { color: colors.accent }]}
                      >
                        Obriši
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Card>
      <Card tinted>
        <Copy heading>GrowGratitude</Copy>
        <Copy muted>Verzija {version} · Početna razvojna verzija</Copy>
        <Copy muted>
          Mali dnevni ritual zahvalnosti, uz baštu koja raste s tobom.
        </Copy>
      </Card>
    </Screen>
  );
}
const styles = StyleSheet.create({
  options: { gap: spacing.sm },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  optionText: { flex: 1 },
  check: { fontSize: 24 },
  challengeForm: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  challengeInput: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
  },
  counter: {
    marginTop: -spacing.xs,
    textAlign: 'right',
    fontSize: typography.small,
  },
  secondaryAction: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionText: { fontSize: typography.body, fontWeight: '600' },
  message: { fontSize: typography.body, fontWeight: '600', lineHeight: 24 },
  loadingChallenges: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  challengeList: { gap: spacing.md },
  challengeRow: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  challengeCopy: { flex: 1, gap: spacing.xs },
  challengeActions: { flexDirection: 'row', gap: spacing.sm },
  smallAction: {
    minHeight: 44,
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
});
