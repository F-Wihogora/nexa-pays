import { Stack } from 'expo-router';
import { useSessionGuard } from '../../services/sessionGuard';
import { View, Text } from 'react-native';

export default function MainLayout() {
  const { isAuthenticated, currentUser } = useSessionGuard();

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-slate-600">Loading...</Text>
      </View>
    );
  }

  // If not authenticated, the session guard will handle redirect
  if (!isAuthenticated) {
    return null;
  }

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