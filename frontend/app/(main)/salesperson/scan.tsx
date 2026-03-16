import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Maximize, Search, Wifi, Cpu, ShieldCheck, CheckCircle, ChevronRight, Radio } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { AgentTopbar } from '../../../components/AgentTopbar';
import { AgentBottomNav } from '../../../components/AgentBottomNav';
import { StorageService } from '../../../services/storage';
import { User } from '../../../services/api';

export default function SalespersonScanScreen() {
  const primaryNavy = "#002B5B";
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{id: string, name: string, balance: number} | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user data
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

  // Animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const scanLinePosition = useSharedValue(0);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      // Pulse animation
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 600 }),
          withTiming(0, { duration: 600 })
        ),
        -1,
        false
      );

      // Scanning line animation
      scanLinePosition.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Ripple effect
      rippleScale.value = withRepeat(
        withTiming(2, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      rippleOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 200 }),
          withTiming(0, { duration: 1800 })
        ),
        -1,
        false
      );

      // Glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      pulseOpacity.value = withTiming(0, { duration: 300 });
      scanLinePosition.value = withTiming(0, { duration: 300 });
      rippleScale.value = withTiming(1, { duration: 300 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isScanning]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const animatedScanLineStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: interpolate(scanLinePosition.value, [0, 1], [-55, 55]) 
    }],
    opacity: isScanning ? 0.8 : 0,
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate successful scan after 2.5 seconds
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        id: '70:77:88:99',
        name: 'Alex Nexa',
        balance: 1250.00
      });
    }, 2500);
  };

  const NexaCard = () => (
    <View className="px-4 mt-2">
      <View 
        style={{ height: 210, backgroundColor: 'white', borderRadius: 32, padding: 30 }} 
        className="shadow-2xl shadow-blue-900/10 border border-slate-100 relative overflow-hidden"
      >
        <View style={{ backgroundColor: primaryNavy, width: 200, height: 200, borderRadius: 100, position: 'absolute', top: -100, right: -100, opacity: 0.03 }} />
        <View className="flex-row justify-between items-start mb-6">
          <View style={{ backgroundColor: '#FFD700', width: 50, height: 38, borderRadius: 8, opacity: 0.9, position: 'relative', overflow: 'hidden' }}>
             <View className="absolute inset-0 border border-black/10 opacity-20" />
             <View className="absolute top-1/2 w-full h-[1px] bg-black/10" />
             <View className="absolute left-1/2 h-full w-[1px] bg-black/10" />
          </View>
          <Wifi size={24} color={primaryNavy} opacity={0.2} />
        </View>
        <Text style={{ color: primaryNavy }} className="text-2xl font-black tracking-[4px] mb-8 opacity-80">
          **** **** **** ****
        </Text>
        <View className="flex-row justify-between items-end mt-auto">
          <View>
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-2">CARD UID</Text>
            <View className="flex-row items-center">
              <Cpu size={14} color={primaryNavy} className="mr-2" opacity={0.5} />
              <Text style={{ color: primaryNavy }} className="text-lg font-black tracking-tighter">70:77:88:99</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-2">WALLET BALANCE</Text>
            <Text style={{ color: primaryNavy }} className="text-2xl font-black">$1,250.00</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AgentTopbar 
        name={currentUser?.username || 'Sales Pro'} 
        role={currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'} 
        primaryNavy={primaryNavy} 
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <NexaCard />
        
        <View className="px-6 mt-10">
          <View className="flex-row justify-between items-center mb-6">
             <View>
                <Text style={{ color: primaryNavy }} className="text-2xl font-black tracking-tighter">Sales Terminal</Text>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Ready for transaction</Text>
             </View>
             <View className="bg-green-50 px-3 py-1 rounded-full border border-green-100 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-700 text-[10px] font-bold">ACTIVE</Text>
             </View>
          </View>
          
          <View className="flex-row space-x-4">
            <Pressable 
              onPress={handleStartScan}
              disabled={isScanning}
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 items-center justify-center active:bg-slate-100 h-40"
            >
              <View style={{ backgroundColor: primaryNavy }} className="w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
                <Maximize size={24} color="white" />
              </View>
              <Text style={{ color: primaryNavy }} className="font-black text-sm text-center">
                {isScanning ? 'Scanning...' : 'Process Scan'}
              </Text>
            </Pressable>

            <Pressable className="flex-1 bg-white border-2 border-slate-100 rounded-3xl p-6 items-center justify-center active:bg-slate-50 h-40">
               <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mb-4">
                <Search size={24} color={primaryNavy} opacity={0.6} />
              </View>
              <Text className="text-slate-500 font-bold text-sm text-center">Manual Search</Text>
            </Pressable>
          </View>

          {/* Enhanced Scanning Animation Section */}
          <View className="mt-8 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <Text style={{ color: primaryNavy, fontFamily: 'Poppins_800ExtraBold' }} className="text-xl mb-6">Payment Terminal</Text>
            
            <View className="items-center justify-center py-8">
              <Pressable 
                onPress={handleStartScan}
                disabled={isScanning}
                className="items-center justify-center"
              >
                {/* Multiple ripple effects */}
                <Animated.View 
                  style={[
                    { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: primaryNavy },
                    animatedRippleStyle
                  ]} 
                />
                <Animated.View 
                  style={[
                    { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#3b82f6' },
                    { ...animatedRippleStyle, opacity: animatedRippleStyle.opacity * 0.6 }
                  ]} 
                />
                
                {/* Pulse effect */}
                <Animated.View 
                  style={[
                    { position: 'absolute', width: 200, height: 125, borderRadius: 16, backgroundColor: primaryNavy },
                    animatedPulseStyle
                  ]} 
                />
                
                {/* Glow effect */}
                <Animated.View 
                  style={[
                    { 
                      position: 'absolute', 
                      width: 190, 
                      height: 115, 
                      borderRadius: 14, 
                      backgroundColor: '#60a5fa',
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 20,
                      elevation: 20
                    },
                    animatedGlowStyle
                  ]} 
                />
                
                {/* Card Visual - Blue Design */}
                <View 
                  style={{ 
                    backgroundColor: isScanning ? '#1e40af' : primaryNavy,
                    width: 180,
                    height: 110,
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8
                  }}
                  className="items-center justify-center relative overflow-hidden"
                >
                  {/* Background gradient circles */}
                  <View 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      position: 'absolute',
                      top: -30,
                      right: -20
                    }}
                  />
                  <View 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      position: 'absolute',
                      bottom: -20,
                      left: -10
                    }}
                  />
                  
                  {/* Card chip */}
                  <View 
                    style={{ 
                      backgroundColor: '#FFD700',
                      width: 28,
                      height: 22,
                      borderRadius: 4,
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3
                    }}
                  >
                    {/* Chip details */}
                    <View className="absolute inset-1 border border-yellow-600/20 rounded-sm" />
                  </View>
                  
                  {/* VISA logo area */}
                  <View className="absolute top-4 right-4">
                    <Text className="text-white font-bold text-xs opacity-80">VISA</Text>
                  </View>
                  
                  {/* Card number */}
                  <View className="absolute bottom-8 left-4">
                    <Text className="text-white font-mono text-sm tracking-wider">
                      7048 •••• •••• 0349
                    </Text>
                  </View>
                  
                  {/* Cardholder name */}
                  <View className="absolute bottom-3 left-4">
                    <Text className="text-white/80 text-xs font-medium uppercase tracking-wide">
                      GERTRUDE AMELL KENT
                    </Text>
                  </View>
                  
                  {/* Expiry */}
                  <View className="absolute bottom-3 right-4">
                    <Text className="text-white/60 text-xs">12/28</Text>
                  </View>
                  
                  {/* Scanning line animation */}
                  {isScanning && (
                    <Animated.View 
                      style={[
                        {
                          position: 'absolute',
                          width: '100%',
                          height: 2,
                          backgroundColor: '#60a5fa',
                          shadowColor: '#60a5fa',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 1,
                          shadowRadius: 8,
                          elevation: 10
                        },
                        animatedScanLineStyle
                      ]}
                    />
                  )}
                  
                  {/* RFID scanning indicator */}
                  {isScanning && (
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="flex-row items-center">
                        <Radio size={16} color="white" className="mr-2" />
                        <View className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                        <View className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                        <View className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
              
              <Text style={{ 
                color: isScanning ? '#2563eb' : '#64748b',
                fontFamily: 'Poppins_700Bold'
              }} className="text-lg mt-6">
                {isScanning ? 'Scanning RFID card...' : 'Tap to scan RFID card'}
              </Text>
              
              {isScanning && (
                <View className="items-center mt-3">
                  <Text style={{ 
                    color: '#3b82f6',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm animate-pulse mb-2">
                    Hold card close to device
                  </Text>
                  <View className="flex-row items-center">
                    <Radio size={14} color="#3b82f6" className="mr-2" />
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_400Regular'
                    }} className="text-xs">
                      RFID signal detected
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Scan Result Card */}
          {scanResult && (
            <View className="mt-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl shadow-blue-900/10">
               <View className="flex-row items-center mb-6">
                  <View className="bg-green-100 p-2 rounded-xl mr-4">
                     <CheckCircle size={24} color="#16a34a" />
                  </View>
                  <View>
                     <Text className="text-green-600 font-black text-xs uppercase tracking-widest">Payment Ready</Text>
                     <Text style={{ color: primaryNavy }} className="text-lg font-black">Card Detected</Text>
                  </View>
               </View>

               <View className="bg-slate-50 p-5 rounded-2xl mb-6">
                  <View className="flex-row justify-between mb-2">
                     <Text className="text-slate-400 font-bold text-[10px] uppercase">Customer</Text>
                     <Text style={{ color: primaryNavy }} className="font-black text-sm">{scanResult.name}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                     <Text className="text-slate-400 font-bold text-[10px] uppercase">Card UID</Text>
                     <Text style={{ color: primaryNavy }} className="font-mono text-sm">{scanResult.id}</Text>
                  </View>
                  <View className="flex-row justify-between">
                     <Text className="text-slate-400 font-bold text-[10px] uppercase">Balance</Text>
                     <Text style={{ color: '#16a34a' }} className="font-black text-lg">${scanResult.balance.toFixed(2)}</Text>
                  </View>
               </View>

               <Pressable 
                 onPress={() => Alert.alert('Payment', 'Proceed to payment screen?', [
                   { text: 'Cancel', style: 'cancel' },
                   { text: 'Continue', onPress: () => {} }
                 ])}
                 style={{ backgroundColor: primaryNavy }}
                 className="h-14 rounded-2xl flex-row items-center justify-center active:bg-blue-900"
               >
                  <Text className="text-white font-black text-sm uppercase tracking-widest mr-2">Process Payment</Text>
                  <ChevronRight size={18} color="white" />
               </Pressable>
            </View>
          )}

          {!scanResult && !isScanning && (
            <View className="mt-8 bg-blue-50/50 p-8 rounded-2xl border border-blue-100/50 flex-row items-start">
               <View className="bg-blue-600/10 p-3 rounded-xl mr-6">
                  <ShieldCheck size={28} color={primaryNavy} />
               </View>
               <View className="flex-1">
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_800ExtraBold'
                  }} className="text-lg mb-2">Sale Protection</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-base leading-6">Hold your RFID card close to the back of the device for secure payment processing.</Text>
               </View>
            </View>
          )}
        </View>
        <View className="h-40" />
      </ScrollView>

      {/* Note: In a real app we'd have a SalespersonBottomNav if the tabs were different */}
      <AgentBottomNav primaryNavy={primaryNavy} />
    </SafeAreaView>
  );
}
