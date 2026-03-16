import { View, Text, Pressable, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Logo } from '../components/Logo';
import { StorageService } from '../services/storage';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { isLoggedIn, user } = await StorageService.initializeAuth();
      
      if (isLoggedIn && user) {
        console.log('✅ User already logged in:', user);
        // Navigate based on user role
        if (user.role === 'admin') {
          router.replace('/(main)/agent/scan');
        } else {
          router.replace('/(main)/salesperson/dashboard');
        }
        return;
      }
      
      console.log('ℹ️ No active session found, showing welcome screen');
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ backgroundColor: primaryNavy }} className="flex-1 items-center justify-center">
        <StatusBar barStyle="light-content" />
        <Logo size={width * 0.3} inverted={true} />
        <Text style={{ 
          color: 'white',
          fontFamily: 'Poppins_500Medium'
        }} className="text-base mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: primaryNavy }} className="flex-1">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-between py-16 px-10">
          
          {/* Logo Section */}
          <View className="items-center justify-center flex-1 mt-10">
            <Logo size={width * 0.4} inverted={true} />
          </View>

          {/* Buttons Section */}
          <View className="w-full space-y-4 mb-16">
            <Pressable 
              onPress={() => router.push('/signup')}
              className="bg-white h-20 rounded-2xl items-center justify-center shadow-xl shadow-black/20 active:bg-slate-50"
            >
              <Text style={{ color: primaryNavy, fontFamily: 'Poppins_700Bold' }} className="text-lg">Register</Text>
            </Pressable>
            
            <Pressable 
              onPress={() => router.push('/login')}
              className="bg-white h-20 rounded-2xl items-center justify-center shadow-xl shadow-black/20 active:bg-slate-50 mt-4"
            >
              <Text style={{ color: primaryNavy, fontFamily: 'Poppins_700Bold' }} className="text-lg">Login</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="items-center">
            <Text style={{ 
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Poppins_500Medium'
            }} className="text-xs tracking-widest">Nexa Pay v1.0</Text>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}
