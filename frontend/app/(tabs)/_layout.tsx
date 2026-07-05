import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useUserStore } from '@/store/userStore';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? Colors.tabActive : Colors.tabInactive }]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isOnboardingCompleted, isHydrated } = useUserStore();

  useEffect(() => {
    if (isHydrated && !isOnboardingCompleted) {
      router.replace('/(onboarding)');
    }
  }, [isHydrated, isOnboardingCompleted]);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <TabIcon label="홈" emoji="🏠" focused={focused} /> }} />
      <Tabs.Screen name="timetable" options={{ tabBarIcon: ({ focused }) => <TabIcon label="시간표" emoji="📅" focused={focused} /> }} />
      <Tabs.Screen name="recommendation" options={{ tabBarIcon: ({ focused }) => <TabIcon label="추천" emoji="✨" focused={focused} /> }} />
      <Tabs.Screen name="friend" options={{ tabBarIcon: ({ focused }) => <TabIcon label="친구" emoji="👥" focused={focused} /> }} />
      <Tabs.Screen name="mypage" options={{ tabBarIcon: ({ focused }) => <TabIcon label="마이" emoji="👤" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: Spacing.tabBarHeight, backgroundColor: Colors.tabBackground, borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 },
  tabItem: { alignItems: 'center', gap: 2, minWidth: Spacing.minTouchSize, minHeight: Spacing.minTouchSize, justifyContent: 'center' },
  emoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
});
