import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { GratitudeTheme, Plant } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Button, Copy } from '../UI';

export function WaterPlantForm({
  theme,
  plant,
  draft,
  canWaterToday,
  busy,
  onChangeDraft,
  onWater,
}: {
  theme: GratitudeTheme;
  plant: Plant;
  draft: string;
  canWaterToday: boolean;
  busy: boolean;
  onChangeDraft: (value: string) => void;
  onWater: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.form}>
      <Copy heading>Današnja zahvalnost</Copy>
      <TextInput
        accessibilityLabel={`Zahvalnost za temu ${theme.name}`}
        editable={!busy && canWaterToday}
        maxLength={300}
        multiline
        onChangeText={onChangeDraft}
        placeholder={
          canWaterToday
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
        disabled={busy || !canWaterToday || !draft.trim()}
        label={busy ? 'Čuvanje…' : `Zalij: ${plant.name}`}
        onPress={onWater}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md, paddingTop: spacing.sm },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: 24,
  },
});
