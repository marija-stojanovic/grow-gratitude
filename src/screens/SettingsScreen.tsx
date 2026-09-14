import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, Copy, Screen } from '../components/UI';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { ThemePreference } from '../types';
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
          Dodavanje i uređivanje vlastitih Spin Wheel izazova dolazi u fazi
          izrade izazova.
        </Copy>
        <Badge>U pripremi</Badge>
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
});
