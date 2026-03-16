import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, ArrowLeft, Star, TrendingUp, Package, DollarSign } from 'lucide-react-native';
import { StorageService } from '../../../services/storage';
import { User as UserType, apiService } from '../../../services/api';

export default function SalespersonProfile() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const accentBlue = "#3b82f6";
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await StorageService.clearAuthData();
      apiService.clearToken();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleEditProfile = () => {
    router.push('/(main)/salesperson/edit-profile');
  };

  const handleSettings = () => {
    router.push('/(main)/salesperson/settings');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white">
        <View className="flex-row justify-between items-center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={primaryNavy} />
          </Pressable>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-xl">Profile</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-6 mb-8">
          <View className="items-center mb-6">
            <View 
              style={{ backgroundColor: primaryNavy, width: 100, height: 100, borderRadius: 50 }} 
              className="items-center justify-center mb-4 shadow-lg"
            >
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_900Black'
              }} className="text-3xl">
                {currentUser?.username.split(' ').map(n => n[0]).join('') || 'SP'}
              </Text>
            </View>
            
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-2xl mb-1">{currentUser?.username || 'Salesperson'}</Text>
            
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_600SemiBold'
            }} className="text-sm uppercase tracking-widest mb-2">
              {currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesperson'}
            </Text>
            
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-sm">{currentUser?.email}</Text>
          </View>

        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-xl mb-4">Quick Actions</Text>
          
          <View className="space-y-3">
            <Pressable 
              onPress={handleEditProfile}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <View className="flex-row items-center">
                <View 
                  style={{ backgroundColor: accentBlue }} 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                >
                  <User size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base mb-1">Edit Profile</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm">Update your personal information</Text>
                </View>
                <Text style={{ color: '#64748b' }} className="text-lg">›</Text>
              </View>
            </Pressable>

            <Pressable 
              onPress={handleSettings}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <View className="flex-row items-center">
                <View 
                  style={{ backgroundColor: '#64748b' }} 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                >
                  <Settings size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base mb-1">Settings</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm">Manage your preferences</Text>
                </View>
                <Text style={{ color: '#64748b' }} className="text-lg">›</Text>
              </View>
            </Pressable>

            <Pressable 
              onPress={handleSignOut}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-red-500">
                  <LogOut size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: '#dc2626',
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base mb-1">Sign Out</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm">Sign out of your account</Text>
                </View>
                <Text style={{ color: '#64748b' }} className="text-lg">›</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}