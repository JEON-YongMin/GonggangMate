import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { Colors } from '@/constants/colors';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function AppContent() {
  const { loadFromStorage, isHydrated } = useUserStore();

  useEffect(() => { loadFromStorage(); }, []);

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  // 웹 환경에서 모바일 앱처럼 중앙 정렬 + 375px 고정
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuter}>
        <View style={styles.webInner}>
          <GestureHandlerRootView style={styles.root}>
            <QueryClientProvider client={queryClient}>
              <AppContent />
            </QueryClientProvider>
          </GestureHandlerRootView>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  // 웹 전용 스타일
  webOuter: {
    flex: 1,
    backgroundColor: '#E5E7EB', // 바깥 배경 회색
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100vh' as any,
  },
  webInner: {
    width: 375,
    height: '100vh' as any,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    position: 'relative',
    // 모바일 앱처럼 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
});
