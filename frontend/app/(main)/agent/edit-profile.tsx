import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Save, Camera } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storage';
import { User as UserType, apiService } from '../../../services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUser();
        if (user) {
          setCurrentUser(user);
          setUsername(user.username);
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Track changes
  useEffect(() => {
    if (currentUser) {
      const hasProfileChanges = username !== currentUser.username || email !== currentUser.email;
      const hasPasswordChanges = currentPassword || newPassword || confirmPassword;
      setHasChanges(hasProfileChanges || hasPasswordChanges);
    }
  }, [username, email, currentPassword, newPassword, confirmPassword, currentUser]);

  const handleSaveProfile = async () => {
    if (!hasChanges) {
      Alert.alert('No Changes', 'No changes to save.');
      return;
    }

    // Validation
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    // Password validation if changing password
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        Alert.alert('Validation Error', 'Current password is required to change password.');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Validation Error', 'New passwords do not match.');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);
    try {
      // Prepare update data
      const updateData: any = {
        username: username.trim(),
        email: email.trim(),
      };

      // Add password fields if changing password
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      // Call API to update profile
      const response = await apiService.updateProfile(updateData);
      
      if (response.success) {
        // Update local storage with new token and user data
        await StorageService.saveAuthData(response.token, response.user);
        setCurrentUser(response.user);

        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        Alert.alert(
          'Profile Updated',
          'Your profile has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <Pressable 
            onPress={handleDiscardChanges}
            className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center"
          >
            <ArrowLeft size={20} color={primaryNavy} />
          </Pressable>
          
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_700Bold'
          }} className="text-lg">Edit Profile</Text>
          
          <Pressable 
            onPress={handleSaveProfile}
            disabled={!hasChanges || isLoading}
            className={`px-4 py-2 rounded-xl ${
              hasChanges && !isLoading 
                ? 'bg-blue-500' 
                : 'bg-slate-200'
            }`}
          >
            <Text style={{ 
              color: hasChanges && !isLoading ? 'white' : '#94a3b8',
              fontFamily: 'Poppins_600SemiBold'
            }} className="text-sm">
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Profile Picture Section */}
            <View className="items-center mb-8">
              <View className="relative">
                <View className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  <View 
                    style={{ backgroundColor: primaryNavy, width: 96, height: 96, borderRadius: 48 }} 
                    className="items-center justify-center"
                  >
                    <Text style={{ 
                      color: 'white',
                      fontFamily: 'Poppins_900Black'
                    }} className="text-3xl">{username ? username.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}</Text>
                  </View>
                </View>
                
                <Pressable 
                  onPress={() => Alert.alert('Change Photo', 'Photo upload functionality will be available soon.')}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full items-center justify-center shadow-lg"
                >
                  <Camera size={18} color="white" />
                </Pressable>
              </View>
              
              <Text style={{ 
                color: '#64748b',
                fontFamily: 'Poppins_500Medium'
              }} className="text-sm mt-3">Tap to change profile photo</Text>
            </View>

            {/* Profile Information */}
            <View className="space-y-6">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-xl mb-2">Profile Information</Text>

              {/* Username Field */}
              <View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2 ml-1">Full Name</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14">
                  <User size={20} color="#94a3b8" className="mr-3" />
                  <TextInput 
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94a3b8"
                    style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_600SemiBold',
                      flex: 1
                    }}
                    className="text-base"
                  />
                </View>
              </View>

              {/* Email Field */}
              <View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2 ml-1">Email Address</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14">
                  <Mail size={20} color="#94a3b8" className="mr-3" />
                  <TextInput 
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_600SemiBold',
                      flex: 1
                    }}
                    className="text-base"
                  />
                </View>
              </View>

              {/* Role Field (Read-only) */}
              <View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2 ml-1">Role</Text>
                <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-4 h-14">
                  <View className="w-5 h-5 rounded-full bg-blue-500 mr-3" />
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-base">
                    {currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'}
                  </Text>
                </View>
                <Text style={{ 
                  color: '#94a3b8',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-xs mt-1 ml-1">Role cannot be changed</Text>
              </View>
            </View>

            {/* Password Change Section */}
            <View className="mt-8 space-y-6">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-xl mb-2">Change Password</Text>

              {/* Current Password */}
              <View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2 ml-1">Current Password</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14">
                  <Lock size={20} color="#94a3b8" className="mr-3" />
                  <TextInput 
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showCurrentPassword}
                    style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_600SemiBold',
                      flex: 1
                    }}
                    className="text-base"
                  />
                  <Pressable 
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="ml-2 p-2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} color="#94a3b8" />
                    ) : (
                      <Eye size={18} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* New Password */}
              <View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2 ml-1">New Password</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14">
                  <Lock size={20} color="#94a3b8" className="mr-3" />
                  <TextInput 
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNewPassword}
                    style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_600SemiBold',
                      flex: 1
                    }}
                    className="text-base"
                  />
                  <Pressable 
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    className="ml-2 p-2"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} color="#94a3b8" />
                    ) : (
                      <Eye size={18} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Confirm New Password */}
              <View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2 ml-1">Confirm New Password</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14">
                  <Lock size={20} color="#94a3b8" className="mr-3" />
                  <TextInput 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_600SemiBold',
                      flex: 1
                    }}
                    className="text-base"
                  />
                  <Pressable 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 p-2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#94a3b8" />
                    ) : (
                      <Eye size={18} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Additional spacing after confirm password */}
              <View className="h-4" />

              {/* Password Requirements */}
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Text style={{ 
                  color: '#1e40af',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm mb-2">Password Requirements:</Text>
                <Text style={{ 
                  color: '#3b82f6',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-xs leading-5">
                  • At least 6 characters long{'\n'}
                  • Include both letters and numbers{'\n'}
                  • Avoid common passwords
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <Pressable 
              onPress={handleSaveProfile}
              disabled={!hasChanges || isLoading}
              style={{ 
                backgroundColor: hasChanges && !isLoading ? primaryNavy : '#e2e8f0'
              }}
              className="flex-row items-center justify-center p-4 rounded-xl mt-8 shadow-sm"
            >
              <Save size={20} color={hasChanges && !isLoading ? 'white' : '#94a3b8'} className="mr-3" />
              <Text style={{ 
                color: hasChanges && !isLoading ? 'white' : '#94a3b8',
                fontFamily: 'Poppins_700Bold'
              }} className="text-base">
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}