import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="school-select" />
      <Stack.Screen name="timetable-setup" />
      <Stack.Screen name="interest-select" />
    </Stack>
  );
}
