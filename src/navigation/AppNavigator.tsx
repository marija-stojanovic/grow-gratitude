import React, { useEffect, useState } from 'react';
import {
  AppState,
  BackHandler,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TodayScreen } from '../screens/TodayScreen';
import { GardenScreen } from '../screens/GardenScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SpinWheelScreen } from '../screens/SpinWheelScreen';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, typography } from '../theme/tokens';

type Tab =
  | 'today'
  | 'garden'
  | 'spin-wheel'
  | 'history'
  | 'statistics'
  | 'settings';
const tabs: { id: Tab; label: string; symbol: string }[] = [
  { id: 'today', label: 'Danas', symbol: '☀' },
  { id: 'garden', label: 'Bašta', symbol: '♧' },
  { id: 'spin-wheel', label: 'Izazovi', symbol: '✦' },
  { id: 'history', label: 'Istorija', symbol: '≡' },
  { id: 'statistics', label: 'Statistika', symbol: '▥' },
  { id: 'settings', label: 'Postavke', symbol: '⚙' },
];

// A small tab shell for this milestone. Detail routes come with forms.
export function AppNavigator() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [, refreshDate] = useState(0);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (activeTab === 'today') {
          return false;
        }
        setActiveTab('today');
        return true;
      },
    );
    return () => subscription.remove();
  }, [activeTab]);
  useEffect(() => {
    // Refresh the date across midnight and when returning to the application.
    const timer = setInterval(() => refreshDate(value => value + 1), 60000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshDate(value => value + 1);
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  let screen: React.ReactNode;
  switch (activeTab) {
    case 'garden':
      screen = <GardenScreen />;
      break;
    case 'history':
      screen = <HistoryScreen />;
      break;
    case 'spin-wheel':
      screen = <SpinWheelScreen />;
      break;
    case 'statistics':
      screen = <StatisticsScreen />;
      break;
    case 'settings':
      screen = <SettingsScreen />;
      break;
    default:
      screen = (
        <TodayScreen
          onOpenGarden={() => setActiveTab('garden')}
          onOpenSpinWheel={() => setActiveTab('spin-wheel')}
        />
      );
  }
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View key={activeTab} style={styles.screen}>
        {screen}
      </View>
      <View
        style={[
          styles.navigation,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.tabList}
        >
          {tabs.map(tab => {
            const selected = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(tab.id)}
                style={({ pressed }) => [
                  styles.tab,
                  {
                    backgroundColor: selected
                      ? colors.surfaceAlt
                      : colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  importantForAccessibility="no"
                  style={[
                    styles.icon,
                    { color: selected ? colors.primary : colors.muted },
                  ]}
                >
                  {tab.symbol}
                </Text>
                <Text
                  style={[
                    styles.label,
                    { color: selected ? colors.primary : colors.muted },
                    selected ? styles.selectedLabel : styles.unselectedLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  navigation: { borderTopWidth: 1, paddingVertical: spacing.sm },
  tabList: { flexGrow: 1, paddingHorizontal: spacing.sm, gap: spacing.xs },
  tab: {
    flexGrow: 1,
    minWidth: 64,
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  icon: { fontSize: 23 },
  label: { fontSize: typography.small },
  selectedLabel: { fontWeight: '700' },
  unselectedLabel: { fontWeight: '400' },
});
