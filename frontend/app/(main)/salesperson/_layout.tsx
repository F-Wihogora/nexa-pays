import { Stack } from 'expo-router';

export default function SalespersonLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'white' },
      }}
    />
  );
}