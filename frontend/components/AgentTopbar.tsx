import { View, Text, Pressable, Platform, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface AgentTopbarProps {
  name: string;
  role: string;
  primaryNavy: string;
  showWelcome?: boolean;
  notificationCount?: number;
}

export const AgentTopbar = ({ name, role, primaryNavy, showWelcome = true, notificationCount = 0 }: AgentTopbarProps) => {
  const router = useRouter();
  
  return (
    <View style={{ paddingTop: Platform.OS === 'ios' ? 0 : 40 }} className="px-6 pb-6 bg-white">
      {/* Top row with logo and profile */}
      <View className="flex-row justify-between items-center mb-4">
        {/* Rounded Logo */}
        <View className="bg-white rounded-full p-2 shadow-lg shadow-blue-900/10 border border-slate-100">
          <Image 
            source={require('../assets/nexa.png')}
            style={{ 
              width: 40, 
              height: 40,
              resizeMode: 'contain'
            }}
          />
        </View>
        
        {/* Right side - Profile and Notification */}
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.push('/(main)/agent/profile')}
            className="relative shadow-lg shadow-blue-900/10 mr-3"
          >
            <View 
              style={{ backgroundColor: primaryNavy, width: 48, height: 48, borderRadius: 24 }} 
              className="items-center justify-center"
            >
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_900Black'
              }} className="text-xl">{name.split(' ').map(n => n[0]).join('')}</Text>
            </View>
            <View className="absolute bottom-[-1] right-[-1] bg-white rounded-full p-[2px] border border-white">
               <View className="bg-green-500 w-3 h-3 rounded-full" />
            </View>
          </Pressable>
          
          <Pressable 
            onPress={() => router.push('/(main)/agent/notifications')}
            style={{ backgroundColor: primaryNavy }} 
            className="w-11 h-11 rounded-full items-center justify-center shadow-lg shadow-blue-900/20 relative"
          >
            <Bell size={20} color="white" />
            {notificationCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text style={{ 
                  color: 'white',
                  fontFamily: 'Poppins_700Bold'
                }} className="text-xs">
                  {notificationCount > 99 ? '99+' : notificationCount.toString()}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      
      {/* Welcome message - conditionally rendered */}
      {showWelcome && (
        <View>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-3xl tracking-tight">Welcome back, {name}!</Text>
          <Text style={{ 
            color: '#94a3b8',
            fontFamily: 'Poppins_600SemiBold'
          }} className="text-sm uppercase tracking-widest mt-1">{role}</Text>
        </View>
      )}
    </View>
  );
};
