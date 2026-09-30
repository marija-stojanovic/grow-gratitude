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
import { openNotificationSettings } from '../services/notificationService';
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
  const {
    colors,
    preference,
    settings,
    settingsLoading,
    settingsSaving,
    settingsError,
    setPreference,
    updateSettings,
    reloadSettings,
  } = useTheme();
  const [reminderTime, setReminderTime] = useState('20:00');
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(
    null,
  );
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [showChallengeEditor, setShowChallengeEditor] = useState(false);

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

  useEffect(() => {
    setReminderTime(settings.notificationTime);
  }, [settings.notificationTime]);

  const saveTheme = async (value: ThemePreference) => {
    setSettingsFeedback(null);
    if (await setPreference(value)) {
      setSettingsFeedback('Izgled aplikacije je sačuvan.');
    }
  };

  const toggleReminders = async (enabled: boolean) => {
    setSettingsFeedback(null);
    if (await updateSettings({ notificationsEnabled: enabled })) {
      setSettingsFeedback(
        enabled
          ? 'Dnevni podsjetnik je uključen.'
          : 'Dnevni podsjetnik je isključen.',
      );
    }
  };

  const saveReminderTime = async () => {
    setSettingsFeedback(null);
    if (await updateSettings({ notificationTime: reminderTime.trim() })) {
      setSettingsFeedback(
        `Vrijeme podsjetnika je sačuvano: ${reminderTime.trim()}.`,
      );
    }
  };

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
      {settingsLoading ? (
        <Card tinted>
          <View style={styles.settingsStatus}>
            <ActivityIndicator color={colors.primary} />
            <Copy muted>Učitavanje sačuvanih postavki…</Copy>
          </View>
        </Card>
      ) : null}
      {settingsError ? (
        <Card>
          <Text
            accessibilityRole="alert"
            style={[styles.message, { color: colors.accent }]}
          >
            {settingsError}
          </Text>
          <Button
            disabled={settingsLoading || settingsSaving}
            label={settingsLoading ? 'Učitavanje…' : 'Pokušaj ponovo'}
            onPress={() => {
              void reloadSettings();
            }}
          />
          {settingsError.includes('nisu dozvoljena') ? (
            <Pressable
              accessibilityRole="button"
              disabled={settingsSaving}
              onPress={() => {
                void openNotificationSettings();
              }}
              style={({ pressed }) => [
                styles.secondaryAction,
                {
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                Otvori Android postavke obavještenja
              </Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}
      {settingsFeedback ? (
        <Text
          accessibilityRole="alert"
          style={[styles.message, { color: colors.primary }]}
        >
          {settingsFeedback}
        </Text>
      ) : null}
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
                accessibilityState={{
                  checked: selected,
                  disabled: settingsLoading || settingsSaving,
                }}
                accessibilityLabel={`${option.title}. ${option.description}`}
                disabled={settingsLoading || settingsSaving}
                onPress={() => {
                  void saveTheme(option.value);
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: selected
                      ? colors.surfaceAlt
                      : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity:
                      settingsLoading || settingsSaving
                        ? 0.55
                        : pressed
                        ? 0.75
                        : 1,
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
          Izbor se čuva na telefonu i ponovo primjenjuje pri narednom pokretanju
          aplikacije.
        </Copy>
      </Card>
      <Card>
        <View style={styles.settingHeader}>
          <View style={styles.settingCopy}>
            <Copy heading>Dnevni podsjetnik</Copy>
            <Copy muted>
              Odredi želiš li svakodnevni podsjetnik za zahvalnost.
            </Copy>
          </View>
          <Switch
            accessibilityLabel="Dnevni podsjetnik"
            disabled={settingsLoading || settingsSaving}
            onValueChange={value => {
              void toggleReminders(value);
            }}
            thumbColor={
              settings.notificationsEnabled ? colors.primary : colors.muted
            }
            trackColor={{ false: colors.border, true: colors.accentSurface }}
            value={settings.notificationsEnabled}
          />
        </View>
        <Copy heading>Vrijeme podsjetnika</Copy>
        <Copy muted>
          Unesi vrijeme u obliku sati i minuta. Početna vrijednost je 20:00.
        </Copy>
        <View style={styles.reminderForm}>
          <TextInput
            accessibilityLabel="Vrijeme dnevnog podsjetnika"
            autoCorrect={false}
            editable={!settingsLoading && !settingsSaving}
            maxLength={5}
            onChangeText={setReminderTime}
            placeholder="20:00"
            placeholderTextColor={colors.muted}
            selectTextOnFocus
            style={[
              styles.timeInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={reminderTime}
          />
          <Button
            disabled={settingsLoading || settingsSaving || !reminderTime.trim()}
            label={settingsSaving ? 'Čuvanje…' : 'Sačuvaj vrijeme'}
            onPress={() => {
              void saveReminderTime();
            }}
          />
        </View>
        <Copy muted>
          Trenutno sačuvano vrijeme: {settings.notificationTime}
        </Copy>
        <Copy muted>
          Kada je prekidač uključen, Android će svakog dana prikazati stvarno
          GrowGratitude obavještenje u izabrano vrijeme.
        </Copy>
      </Card>
      <Card>
        <Copy heading>Jezik aplikacije</Copy>
        <Badge>Srpski · latinica · ijekavica</Badge>
        <Copy muted>
          Oznaka jezika koja se čuva u bazi je {settings.language}. Ovo je jezik
          prve verzije aplikacije.
        </Copy>
      </Card>
      <Card>
        <Copy heading>Tvoji izazovi</Copy>
        <Copy muted>
          Aktivni izazovi ulaze u nasumičan izbor. Ugrađene možeš uključiti ili
          isključiti, a svoje možeš i uređivati ili brisati.
        </Copy>
        <Badge>{`${activeCount} aktivnih · ${challenges.length} ukupno`}</Badge>
        <Button
          label={showChallengeEditor ? 'Zatvori uređivanje' : 'Uredi'}
          onPress={() => {
            setShowChallengeEditor(value => !value);
            if (showChallengeEditor) {
              resetChallengeForm();
              setChallengeFeedback(null);
              setChallengeError(null);
            }
          }}
        />

        {showChallengeEditor ? (
          <>
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
          </>
        ) : null}
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
  settingsStatus: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingCopy: { flex: 1, gap: spacing.xs },
  reminderForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeInput: {
    width: 92,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
    fontSize: typography.body,
    fontWeight: '600',
  },
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
