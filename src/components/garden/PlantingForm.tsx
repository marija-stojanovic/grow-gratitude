import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GratitudeTheme } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { SunflowerIllustration } from '../SunflowerIllustration';
import { Badge, Button, Card, Copy } from '../UI';

export function PlantingForm({
  availableThemes,
  selectedTheme,
  plantName,
  busy,
  onChooseTheme,
  onChangeName,
  onPlant,
  onChooseAnotherTheme,
  lockTheme = false,
}: {
  availableThemes: GratitudeTheme[];
  selectedTheme: GratitudeTheme | null;
  plantName: string;
  busy: boolean;
  onChooseTheme: (theme: GratitudeTheme) => void;
  onChangeName: (value: string) => void;
  onPlant: () => void;
  onChooseAnotherTheme: () => void;
  lockTheme?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card>
      <Copy heading>Dodaj novu biljku</Copy>
      {selectedTheme ? (
        <View style={styles.form}>
          <Copy muted>Izabrani sektor: {selectedTheme.name}</Copy>
          <SunflowerIllustration stage="seed" compact />
          <Badge>Suncokret</Badge>
          <Copy muted>Za sada sve teme koriste isti prikaz suncokreta.</Copy>
          <Copy heading>Naziv biljke</Copy>
          <TextInput
            accessibilityLabel="Naziv nove biljke"
            editable={!busy}
            maxLength={50}
            onChangeText={onChangeName}
            placeholder="Unesi naziv biljke"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={plantName}
          />
          <Button
            disabled={busy || !plantName.trim()}
            label={busy ? 'Sadnja…' : 'Započni uzgoj'}
            onPress={onPlant}
          />
          {!lockTheme ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onChooseAnotherTheme}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  borderColor: colors.border,
                  opacity: busy ? 0.5 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.secondaryText, { color: colors.text }]}> 
                Izaberi drugu temu
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : availableThemes.length === 0 ? (
        <Copy muted>U svakoj dostupnoj temi već raste po jedna biljka.</Copy>
      ) : (
        <View style={styles.options}>
          <Copy muted>Prikazane su samo teme koje nemaju aktivnu biljku.</Copy>
          {availableThemes.map(theme => (
            <Pressable
              key={theme.id}
              accessibilityRole="button"
              onPress={() => onChooseTheme(theme)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={styles.optionCopy}>
                <Copy heading>{theme.name}</Copy>
                <Copy muted>{theme.description}</Copy>
              </View>
              <Text style={[styles.chevron, { color: colors.primary }]}>›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
  },
  secondaryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryText: { fontSize: typography.body, fontWeight: '600' },
  options: { gap: spacing.sm },
  option: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  optionCopy: { flex: 1, gap: spacing.xs },
  chevron: { fontSize: 32 },
});
