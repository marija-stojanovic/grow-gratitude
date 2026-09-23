import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

export function Copy({
  children,
  muted = false,
  heading = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  heading?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Text
      accessibilityRole={heading ? 'header' : undefined}
      style={[
        styles.copy,
        { color: muted ? colors.muted : colors.text },
        heading && styles.heading,
      ]}
    >
      {children}
    </Text>
  );
}

export function Screen({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {eyebrow}
          </Text>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            {title}
          </Text>
          <Copy muted>{description}</Copy>
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function Card({
  children,
  tinted = false,
}: {
  children: React.ReactNode;
  tinted?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tinted ? colors.surfaceAlt : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.accentSurface }]}>
      <Text style={[styles.badgeText, { color: colors.accent }]}>
        {children}
      </Text>
    </View>
  );
}

export function EmptyState({
  symbol,
  title,
  description,
}: {
  symbol: string;
  title: string;
  description: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.symbol, { backgroundColor: colors.surfaceAlt }]}
      >
        <Text style={[styles.symbolText, { color: colors.primary }]}>
          {symbol}
        </Text>
      </View>
      <Copy heading>{title}</Copy>
      <Copy muted>{description}</Copy>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xl },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.small,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: { fontSize: typography.hero, fontWeight: '700' },
  copy: { fontSize: typography.body, lineHeight: 25 },
  heading: { fontSize: typography.heading, lineHeight: 27, fontWeight: '600' },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { fontSize: typography.small, fontWeight: '600' },
  empty: {
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  symbol: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: { fontSize: 28 },
});
