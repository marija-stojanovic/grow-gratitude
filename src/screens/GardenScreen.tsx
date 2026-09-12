import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Card, Copy, EmptyState, Screen } from '../components/UI';
import { gratitudeThemes, growthStages } from '../constants/gratitude';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, typography } from '../theme/tokens';

export function GardenScreen() {
  const { colors } = useTheme();
  return (
    <Screen
      eyebrow="TVOJ PROSTOR ZA RAST"
      title="Bašta zahvalnosti"
      description="Različite teme. Različite biljke. Prostor za sve što ti znači."
    >
      <Card tinted>
        <EmptyState
          symbol="♧"
          title="Tvoja bašta još je prazna"
          description="Ovdje ćeš uzgajati više biljaka istovremeno. Svaka će imati svoju temu i zaseban niz zalivanja."
        />
        <Badge>Sadnja stiže u narednoj fazi</Badge>
      </Card>
      <View style={styles.section}>
        <Copy heading>Teme za tvoju baštu</Copy>
        <Copy muted>
          Za svaku od ovih tema pripremit ćemo drugačiju biljku. Moći ćeš
          definisati i vlastite teme.
        </Copy>
        {gratitudeThemes.map((theme, index) => (
          <View
            key={theme.name}
            style={[styles.row, { borderColor: colors.border }]}
          >
            <Text style={[styles.number, { color: colors.primary }]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <View style={styles.rowText}>
              <Copy heading>{theme.name}</Copy>
              <Copy muted>{theme.description}</Copy>
            </View>
          </View>
        ))}
      </View>
      <Card>
        <Copy heading>21 dan zajedničkog rasta</Copy>
        <Copy muted>
          Jedan unos zahvalnosti zaliva jednu biljku. Za završetak je potreban
          niz od 21 uzastopnog dana.
        </Copy>
        {growthStages.map(stage => (
          <View key={stage.days} style={styles.stage}>
            <Text style={[styles.days, { color: colors.primary }]}>
              {stage.days}
            </Text>
            <View style={styles.rowText}>
              <Copy>{stage.label}</Copy>
            </View>
          </View>
        ))}
        <Copy muted>
          Brojevi označavaju zalivanja u trenutnom nizu. Preskočen dan znači da
          biljka uvene. Novim unosom počinje niz 1/21, dok stare zahvalnosti
          ostaju. Završena biljka više ne vene.
        </Copy>
      </Card>
    </Screen>
  );
}
const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  number: {
    fontSize: typography.small,
    fontWeight: '700',
    paddingTop: 5,
    minWidth: 26,
  },
  rowText: { flex: 1, gap: spacing.xs },
  stage: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  days: {
    width: 64,
    fontSize: typography.body,
    lineHeight: 25,
    fontWeight: '600',
  },
});
