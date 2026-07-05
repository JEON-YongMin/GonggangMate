import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useUserStore } from '@/store/userStore';

export default function SplashScreen() {
  const { loadFromStorage } = useUserStore();

  useEffect(() => {
    const init = async () => {
      await loadFromStorage();
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      setTimeout(() => {
        if (completed === 'true') {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(onboarding)/school-select');
        }
      }, 1500);
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎓</Text>
      <Text style={styles.title}>공강메이트</Text>
      <Text style={styles.subtitle}>공강 시간을 알차게!</Text>
      <ActivityIndicator style={styles.loader} color={Colors.white} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: Typography.size.display, fontWeight: Typography.weight.bold, color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: Typography.size.lg, color: 'rgba(255,255,255,0.8)' },
  loader: { marginTop: 48 },
});
