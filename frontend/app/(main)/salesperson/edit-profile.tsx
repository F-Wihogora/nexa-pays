import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { StorageService } from '../../../services/storage';
import { User as UserType, apiService } from '../../../services/api';

export default function SalespersonEditProfile() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const accentBlue = "#3b82f6";
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUser();
        if (user) {
          setCurrentUser(user);
          setFormData(prev => ({
            ...prev,
            username: user.username,
            email: user.email
          }));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.username.trim() || !formData.email.trim()) {
        Alert.alert('Error', 'Username and email are required');
        return;
      }

      // Password validation if changing password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          Alert.alert('Error', 'Current password is required to change password');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          Alert.alert('Error', 'New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters long');
          return;
        }
      }

      setIsLoading(true);

      // Set API token
      const token = await StorageService.getToken();
      if (token) {
        apiService.setToken(token);

        // Prepare update data
        const updateData: any = {
          username: formData.username,
          email: formData.email
        };

        if (formData.newPassword) {
          updateData.currentPassword = formData.currentPassword;
          updateData.newPassword = formData.newPassword;
        }

        // Update profile
        const response = await apiService.updateProfile(updateData);

        if (response.success) {
          // Update stored user data
          await StorageService.saveAuthData(response.token, response.user);

          Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('Error', response.error || 'Failed to update profile');
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={primaryNavy} />
          </Pressable>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-xl">Edit Profile</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Profile Avatar */}
          <View className="items-center mb-8">
            <View 
              style={{ backgroundColor: primaryNavy, width: 100, height: 100, borderRadius: 50 }} 
              className="items-center justify-center mb-4 shadow-lg"
            >
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_900Black'
              }} className="text-3xl">
                {formData.username.split(' ').map(n => n[0]).join('') || 'SP'}
              </Text>
            </View>
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_700Bold'
            }} className="text-xl">{currentUser?.username || 'Salesperson'}</Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-sm">{currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesperson'}</Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            {/* Username */}
            <View>
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-base mb-2">Username</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                <User size={20} color="#94a3b8" />
                <TextInput
                  value={formData.username}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                  placeholder="Enter username"
                  className="ml-3 flex-1 text-slate-700 text-base"
                  placeholderTextColor="#94a3b8"
                  style={{ fontFamily: 'Poppins_500Medium' }}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-base mb-2">Email</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                <Mail size={20} color="#94a3b8" />
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="ml-3 flex-1 text-slate-700 text-base"
                  placeholderTextColor="#94a3b8"
                  style={{ fontFamily: 'Poppins_500Medium' }}
                />
              </View>
            </View>

            {/* Password Section */}
            <View className="mt-8">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_700Bold'
              }} className="text-lg mb-4">Change Password (Optional)</Text>

              {/* Current Password */}
              <View className="mb-4">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-base mb-2">Current Password</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                  <Lock size={20} color="#94a3b8" />
                  <TextInput
                    value={formData.currentPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrentPassword}
                    className="ml-3 flex-1 text-slate-700 text-base"
                    placeholderTextColor="#94a3b8"
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  />
                  <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* New Password */}
              <View className="mb-4">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-base mb-2">New Password</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                  <Lock size={20} color="#94a3b8" />
                  <TextInput
                    value={formData.newPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
                    placeholder="Enter new password"
                    secureTextEntry={!showNewPassword}
                    className="ml-3 flex-1 text-slate-700 text-base"
                    placeholderTextColor="#94a3b8"
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-6">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-base mb-2">Confirm New Password</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                  <Lock size={20} color="#94a3b8" />
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirmPassword}
                    className="ml-3 flex-1 text-slate-700 text-base"
                    placeholderTextColor="#94a3b8"
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Pressable 
            onPress={handleSave}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#94a3b8' : primaryNavy,
              height: 60 
            }}
            className="rounded-2xl items-center justify-center shadow-lg mt-8"
          >
            <Text style={{ 
              color: 'white',
              fontFamily: 'Poppins_700Bold'
            }} className="text-lg">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}