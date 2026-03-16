import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Logo } from '../components/Logo';
import { Mail, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'cashier'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const primaryNavy = "#002B5B";

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { isLoggedIn, user } = await StorageService.initializeAuth();
        if (isLoggedIn && user) {
          console.log('✅ User already logged in, redirecting...');
          if (user.role === 'admin') {
            router.replace('/(main)/agent/scan');
          } else {
            router.replace('/(main)/salesperson/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      }
    };
    checkExistingSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('🚀 Starting login process...');
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      console.log('✅ Login response:', response);
      
      if (response.success) {
        // Validate that the user's role matches the selected role
        if (response.user.role !== role) {
          const userRoleText = response.user.role === 'admin' ? 'Agent' : 'Salesman';
          const selectedRoleText = role === 'admin' ? 'Agent' : 'Salesman';
          Alert.alert(
            'Role Mismatch', 
            `You are registered as ${userRoleText} but trying to login as ${selectedRoleText}. Please select the correct role.`
          );
          setIsLoading(false);
          return;
        }

        // Save auth data to storage
        await StorageService.saveAuthData(response.token, response.user);
        
        // Navigate based on user's actual role (not selected role)
        if (response.user.role === 'admin') {
          router.replace('/(main)/agent/scan');
        } else {
          router.replace('/(main)/salesperson/dashboard');
        }
      } else {
        Alert.alert('Login Failed', response.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: primaryNavy }} className="flex-1">
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="px-8 pt-16 pb-10 justify-center flex-1">
            {/* Back Button */}
            <Pressable 
              onPress={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center mb-8 active:bg-white/20"
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>

            {/* Header section with Logo */}
            <View className="mb-10 items-center">
              <Logo size={120} showText={false} inverted={true} />
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_900Black'
              }} className="text-4xl mt-6 tracking-tighter">Sign In</Text>
              <Text style={{ 
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Poppins_500Medium'
              }} className="text-lg mt-1">Access your portal</Text>
            </View>

            {/* Form Section */}
            <View className="space-y-6">
              <View>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-[10px] mb-3 ml-1 uppercase tracking-[2px]">Email Address</Text>
                <View className="flex-row items-center bg-white rounded-2xl px-6 h-20 shadow-lg shadow-black/20">
                  <Mail size={20} color={primaryNavy} opacity={0.4} className="mr-3" />
                  <TextInput 
                    placeholder="name@example.com"
                    placeholderTextColor="#94a3b8"
                    style={{ fontFamily: 'Poppins_700Bold' }}
                    className="flex-1 text-slate-900 text-lg h-full"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View className="mt-4">
                <Text className="text-white/40 text-[10px] font-black mb-3 ml-1 uppercase tracking-[2px]">Password</Text>
                <View className="flex-row items-center bg-white rounded-2xl px-6 h-20 shadow-lg shadow-black/20">
                  <Lock size={20} color={primaryNavy} opacity={0.4} className="mr-3" />
                  <TextInput 
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 text-slate-900 text-lg font-bold h-full"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    className="ml-2 p-2"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={primaryNavy} opacity={0.6} />
                    ) : (
                      <Eye size={20} color={primaryNavy} opacity={0.6} />
                    )}
                  </Pressable>
                </View>
                <Pressable className="mt-4 self-end">
                  <Text className="text-white/60 text-sm font-bold">Forgot Password?</Text>
                </Pressable>
              </View>

              {/* Portal Selection */}
              <View className="mt-4">
                <Text className="text-white/40 text-[10px] font-black mb-3 ml-1 uppercase tracking-[2px]">Select Portal</Text>
                <View className="flex-row space-x-4">
                  <Pressable 
                    onPress={() => setRole('admin')}
                    className={`flex-1 h-16 rounded-xl border-2 items-center justify-center flex-row ${role === 'admin' ? 'border-white bg-white/10' : 'bg-transparent border-white/10'}`}
                  >
                    <Text className={`text-white ${role === 'admin' ? 'font-black' : 'font-bold opacity-40'}`}>Agent</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setRole('cashier')}
                    className={`flex-1 h-16 rounded-xl border-2 items-center justify-center flex-row ${role === 'cashier' ? 'border-white bg-white/10' : 'bg-transparent border-white/10'} ml-4`}
                  >
                    <Text className={`text-white ${role === 'cashier' ? 'font-black' : 'font-bold opacity-40'}`}>Salesman</Text>
                  </Pressable>
                </View>
              </View>

              {/* Main Login Button (White) */}
              <Pressable 
                onPress={handleLogin}
                disabled={isLoading}
                className={`bg-white h-20 rounded-2xl items-center justify-center shadow-2xl shadow-black/30 mt-10 ${isLoading ? 'opacity-70' : 'active:bg-slate-50'}`}
              >
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-xl uppercase tracking-widest">
                  {isLoading ? 'Signing In...' : 'Login'}
                </Text>
              </Pressable>

              <View className="flex-row justify-center items-center mt-10 mb-10">
                <Text className="text-white/40 text-base font-medium">New around here? </Text>
                <Pressable onPress={() => router.push('/signup')}>
                  <Text className="text-white text-base font-bold underline">Create account</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
