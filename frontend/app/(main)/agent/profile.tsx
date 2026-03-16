import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Shield, Calendar, MapPin, Phone, Edit3, Settings, LogOut } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storage';
import { User as UserType, apiService } from '../../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [userStats, setUserStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 0,
    isLoading: true
  });

  // Load current user data and stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUser();
        setCurrentUser(user);
        
        // Set API token for authenticated requests
        const token = await StorageService.getToken();
        if (token) {
          apiService.setToken(token);
          await loadUserStats();
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const loadUserStats = async () => {
    try {
      setUserStats(prev => ({ ...prev, isLoading: true }));
      
      const transactionsResponse = await apiService.getUserTransactions(1000);
      
      if (transactionsResponse.success) {
        const transactions = transactionsResponse.transactions || [];
        const totalTransactions = transactions.length;
        const totalVolume = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
        const successfulTransactions = transactions.filter((tx: any) => tx.status === 'SUCCESS').length;
        const successRate = totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0;
        
        setUserStats({
          totalTransactions,
          totalVolume: totalVolume / 100,
          successRate,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      setUserStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center"
        >
          <ArrowLeft size={20} color={primaryNavy} />
        </Pressable>
        
        <Text style={{ 
          color: primaryNavy,
          fontFamily: 'Poppins_700Bold'
        }} className="text-lg">Profile</Text>
        
        <Pressable 
          onPress={() => router.push('/(main)/agent/edit-profile')}
          className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center"
        >
          <Edit3 size={18} color={primaryNavy} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Profile Header */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100">
            <View className="items-center">
              {/* Profile Image */}
              <View className="relative mb-4">
                <View className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  <View 
                    style={{ backgroundColor: primaryNavy, width: 96, height: 96, borderRadius: 48 }} 
                    className="items-center justify-center"
                  >
                    <Text style={{ 
                      color: 'white',
                      fontFamily: 'Poppins_900Black'
                    }} className="text-3xl">{currentUser?.username ? currentUser.username.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}</Text>
                  </View>
                </View>
                <View className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-md" />
              </View>
              
              {/* Profile Info */}
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-2xl mb-1">{currentUser?.username || 'Agent'}</Text>
              <Text style={{ 
                color: '#64748b',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm mb-1">{currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'}</Text>
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-xs mb-6">{currentUser?.email || 'Not available'}</Text>
              
              {/* Action Buttons */}
              <View className="flex-row space-x-4">
                <Pressable 
                  onPress={() => router.push('/(main)/agent/edit-profile')}
                  style={{ backgroundColor: primaryNavy }}
                  className="px-6 py-3 rounded-xl shadow-sm flex-row items-center"
                >
                  <Edit3 size={16} color="white" className="mr-2" />
                  <Text style={{ 
                    color: 'white',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-sm">Edit Profile</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => router.push('/(main)/agent/settings')}
                  className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 flex-row items-center"
                >
                  <Settings size={16} color={primaryNavy} className="mr-2" />
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-sm">Settings</Text>
                </Pressable>
              </View>
            </View>
          </View>
          {/* Stats Cards */}
          <View className="flex-row justify-between mb-6 space-x-3">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <View className="items-center">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-2xl mb-1">
                  {userStats.isLoading ? '...' : userStats.totalTransactions.toLocaleString()}
                </Text>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-xs text-center">Total{'\n'}Transactions</Text>
              </View>
            </View>
            
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <View className="items-center">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-2xl mb-1">
                  {userStats.isLoading ? '...' : 
                   userStats.totalVolume >= 1000 
                     ? `$${(userStats.totalVolume / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`
                     : `$${userStats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  }
                </Text>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-xs text-center">Total{'\n'}Volume</Text>
              </View>
            </View>
            
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <View className="items-center">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-2xl mb-1">
                  {userStats.isLoading ? '...' : `${userStats.successRate}%`}
                </Text>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-xs text-center">Success{'\n'}Rate</Text>
              </View>
            </View>
          </View>

          {/* Profile Details */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-lg mb-6">Profile Details</Text>
            
            <View className="space-y-5">
              <View className="flex-row items-center p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl border border-blue-100">
                <View className="w-12 h-12 rounded-xl bg-blue-500 items-center justify-center mr-4 shadow-sm">
                  <User size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: '#3b82f6',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-xs mb-1 uppercase tracking-wider">Full Name</Text>
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base">{currentUser?.username || 'Not available'}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center p-4 bg-gradient-to-r from-green-50 to-green-50 rounded-xl border border-green-100">
                <View className="w-12 h-12 rounded-xl bg-green-500 items-center justify-center mr-4 shadow-sm">
                  <Mail size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: '#10b981',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-xs mb-1 uppercase tracking-wider">Email Address</Text>
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base">{currentUser?.email || 'Not available'}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-xl border border-purple-100">
                <View className="w-12 h-12 rounded-xl bg-purple-500 items-center justify-center mr-4 shadow-sm">
                  <Shield size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: '#8b5cf6',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-xs mb-1 uppercase tracking-wider">Role</Text>
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base">{currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center p-4 bg-gradient-to-r from-orange-50 to-orange-50 rounded-xl border border-orange-100">
                <View className="w-12 h-12 rounded-xl bg-orange-500 items-center justify-center mr-4 shadow-sm">
                  <Calendar size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: '#f59e0b',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-xs mb-1 uppercase tracking-wider">Member Since</Text>
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base">March 2024</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Quick Actions */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-lg mb-6">Quick Actions</Text>
            
            <View className="space-y-4">
              <Pressable 
                onPress={() => router.push('/(main)/agent/transactions')}
                className="flex-row items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm active:scale-95"
                style={{ transform: [{ scale: 1 }] }}
              >
                <View className="w-12 h-12 rounded-xl bg-blue-500 items-center justify-center mr-4 shadow-sm">
                  <Text className="text-xl">📊</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base mb-1">View Transactions</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm">Check your transaction history</Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                  <Text style={{ 
                    color: 'white',
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-sm">→</Text>
                </View>
              </Pressable>
              
              <Pressable 
                onPress={() => router.push('/(main)/agent/notifications')}
                className="flex-row items-center p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 shadow-sm active:scale-95"
                style={{ transform: [{ scale: 1 }] }}
              >
                <View className="w-12 h-12 rounded-xl bg-yellow-500 items-center justify-center mr-4 shadow-sm">
                  <Text className="text-xl">🔔</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base mb-1">Notifications</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm">View alerts and updates</Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-yellow-500 items-center justify-center">
                  <Text style={{ 
                    color: 'white',
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-sm">→</Text>
                </View>
              </Pressable>
              
              <Pressable 
                onPress={() => router.push('/(main)/agent/help-center')}
                className="flex-row items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm active:scale-95"
                style={{ transform: [{ scale: 1 }] }}
              >
                <View className="w-12 h-12 rounded-xl bg-green-500 items-center justify-center mr-4 shadow-sm">
                  <Text className="text-xl">❓</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base mb-1">Help Center</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm">Get support and guidance</Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                  <Text style={{ 
                    color: 'white',
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-sm">→</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Sign Out */}
          <Pressable 
            onPress={() => {
              Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Sign Out", 
                    style: "destructive",
                    onPress: async () => {
                      try {
                        apiService.logout();
                        await StorageService.clearAuthData();
                        router.replace('/login');
                      } catch (error) {
                        console.error('Logout error:', error);
                        Alert.alert('Error', 'Failed to sign out. Please try again.');
                      }
                    }
                  }
                ]
              );
            }}
            className="flex-row items-center justify-center bg-white border-2 border-red-200 p-4 rounded-2xl shadow-sm"
          >
            <LogOut size={20} color="#dc2626" className="mr-3" />
            <Text style={{ 
              color: '#dc2626',
              fontFamily: 'Poppins_700Bold'
            }} className="text-base">Sign Out</Text>
          </Pressable>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}