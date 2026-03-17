import { View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Wallet, 
  CheckCircle2, 
  ArrowRight,
  DollarSign,
  ShieldCheck
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { AgentTopbar } from '../../../components/AgentTopbar';
import { AgentBottomNav } from '../../../components/AgentBottomNav';
import { StorageService } from '../../../services/storage';
import { User, apiService } from '../../../services/api';
import { webSocketService, CardScannedEvent } from '../../../services/websocket';

export default function AgentTopupScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const [amount, setAmount] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardUID, setCardUID] = useState('');
  const [userCards, setUserCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [detectedCard, setDetectedCard] = useState<CardScannedEvent | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Load current user data and their cards
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUser();
        setCurrentUser(user);
        
        // Set API token for authenticated requests
        const token = await StorageService.getToken();
        if (token) {
          apiService.setToken(token);
        }

        // Load user's cards
        const cardsResponse = await apiService.getUserCards();
        if (cardsResponse.success) {
          setUserCards(cardsResponse.cards);
          if (cardsResponse.cards.length > 0) {
            // Select first card by default
            setSelectedCard(cardsResponse.cards[0]);
            setCardUID(cardsResponse.cards[0].cardUid);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  // WebSocket connection for real-time RFID detection
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const connected = await webSocketService.connect();
        setIsWebSocketConnected(connected);
        
        if (connected) {
          // Listen for real RFID card detections
          const handleCardScanned = (data: CardScannedEvent) => {
            console.log('📱 RFID card detected in topup:', data);
            setDetectedCard(data);
            setCardUID(data.uid);
            setSelectedCard(null); // Clear user card selection when RFID detected
          };

          webSocketService.on('card-scanned', handleCardScanned);

          return () => {
            webSocketService.off('card-scanned', handleCardScanned);
          };
        }
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setIsWebSocketConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!cardUID) {
      Alert.alert('No Card Selected', 'Please select a card or add a new one');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('💰 Processing top-up:', { cardUID, amount });
      
      const response = await apiService.topup(cardUID, parseFloat(amount));
      
      if (response.success) {
        Alert.alert(
          'Top-up Successful',
          `Successfully added $${amount} to card ${cardUID}\nNew balance: $${response.newBalance}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount('');
                // Navigate to scan screen instead of going back to maintain session
                router.replace('/(main)/agent/scan');
              }
            }
          ]
        );
        console.log('✅ Top-up successful:', response);
      } else {
        throw new Error(response.error || 'Top-up failed');
      }
    } catch (error) {
      console.error('❌ Top-up error:', error);
      Alert.alert('Top-up Failed', error.message || 'Failed to process top-up. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  const [isSuccess, setIsSuccess] = useState(false);
  const [balance, setBalance] = useState(1250.00);

  // Animation values
  const walletProgress = useSharedValue(0);
  const moneyProgress = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const moneyPulse = useSharedValue(1);

  function withRepeatPulse() {
    return withSequence(
       withTiming(1.2, { duration: 300 }),
       withTiming(1, { duration: 300 })
    );
  }

  const walletFillStyle = useAnimatedStyle(() => ({
    height: `${walletProgress.value * 100}%`,
    backgroundColor: '#4ade80',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.6,
  }));

  const moneyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - moneyProgress.value) * -120 },
      { scale: moneyPulse.value * moneyProgress.value }
    ],
    opacity: moneyProgress.value,
  }));

  const successContentStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: 0.8 + (successOpacity.value * 0.2) }]
  }));

  if (isSuccess) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-10">
        <View className="items-center">
          {/* animated-wallet-container */}
          <View className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-100 items-center justify-center relative mb-8 bg-slate-50">
             <Animated.View style={walletFillStyle} className="rounded-t-3xl" />
             <Wallet size={64} color={primaryNavy} />
             <Animated.View style={moneyStyle} className="absolute">
                <View className="bg-white/90 p-3 rounded-full shadow-lg">
                  <DollarSign size={32} color="#16a34a" strokeWidth={3} />
                </View>
             </Animated.View>
          </View>

          <Animated.View style={successContentStyle} className="items-center">
            <View className="bg-green-500 w-16 h-16 rounded-full items-center justify-center mb-6 shadow-xl shadow-green-500/30">
               <CheckCircle2 size={40} color="white" />
            </View>
            <Text style={{ color: primaryNavy }} className="text-3xl font-black mt-2 text-center tracking-tighter">Load Success!</Text>
            <Text className="text-slate-400 font-bold text-lg mt-2">New Balance: ${balance.toFixed(2)}</Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AgentTopbar 
        name={currentUser?.username || 'Agent'} 
        role={currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'} 
        primaryNavy={primaryNavy} 
      />
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <View>
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_900Black'
            }} className="text-3xl tracking-tighter">Top-Up Wallet</Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-base mt-1">Add funds to your Nexa card</Text>
          </View>
          <View className="bg-blue-50 p-3 rounded-xl">
            <View className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center">
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_700Bold'
              }} className="text-xs">$</Text>
            </View>
          </View>
        </View>

        {/* card-details-card */}
        <View 
          style={{ height: 280, backgroundColor: primaryNavy, borderRadius: 16, padding: 30 }} 
          className="shadow-2xl shadow-blue-900/20 border border-blue-100 relative overflow-hidden mb-8"
        >
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: 200, height: 200, borderRadius: 100, position: 'absolute', top: -100, right: -100 }} />
          <View className="flex-row justify-between items-start mb-6">
            <View style={{ backgroundColor: '#FFD700', width: 50, height: 38, borderRadius: 8, opacity: 0.9, position: 'relative', overflow: 'hidden' }}>
               <View className="absolute inset-0 border border-black/10 opacity-20" />
               <View className="absolute top-1/2 w-full h-[1px] bg-black/10" />
               <View className="absolute left-1/2 h-full w-[1px] bg-black/10" />
            </View>
            <View className="bg-white/20 p-1 rounded-md">
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-xs">VISA</Text>
            </View>
          </View>
          <Text style={{ 
            color: 'white',
            fontFamily: 'Poppins_900Black'
          }} className="text-2xl tracking-[4px] mb-8 opacity-80">
            **** **** **** ****
          </Text>
          <View className="flex-row justify-between items-end mt-auto">
            <View>
              <Text style={{ 
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-[10px] uppercase tracking-[2px] mb-2">CARD UID</Text>
              <View className="flex-row items-center">
                <Text style={{ 
                  color: 'white',
                  fontFamily: 'Poppins_900Black'
                }} className="text-lg tracking-tighter">{cardUID || 'No card selected'}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text style={{ 
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-[10px] uppercase tracking-[2px] mb-2">WALLET BALANCE</Text>
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_900Black'
              }} className="text-2xl">${selectedCard ? selectedCard.balance.toFixed(2) : '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Card Selection */}
        {userCards.length > 0 && (
          <View className="mb-6">
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-sm uppercase tracking-widest mb-3 ml-1">Select Card</Text>
            <View className="flex-row flex-wrap">
              {userCards.map((card, index) => (
                <Pressable 
                  key={card.cardUid}
                  onPress={() => {
                    setSelectedCard(card);
                    setCardUID(card.cardUid);
                  }}
                  className={`mr-3 mb-3 px-4 py-3 rounded-xl border-2 ${
                    selectedCard?.cardUid === card.cardUid 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <Text style={{ 
                    color: selectedCard?.cardUid === card.cardUid ? primaryNavy : '#64748b',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-sm">{card.cardUid}</Text>
                  <Text style={{ 
                    color: '#94a3b8',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-xs">${card.balance.toFixed(2)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Add New Card Option */}
        <View className="mb-6">
          <Text style={{ 
            color: '#64748b',
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-sm uppercase tracking-widest mb-3 ml-1">Or Add New Card</Text>
          <View className="flex-row">
            <TextInput 
              placeholder="Enter card UID (e.g., 70:77:88:99)"
              placeholderTextColor="#94a3b8"
              style={{ 
                color: primaryNavy, 
                fontFamily: 'Poppins_600SemiBold',
                flex: 1,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 12
              }}
              value={cardUID}
              onChangeText={setCardUID}
            />
            <Pressable 
              onPress={async () => {
                if (cardUID && !userCards.find(c => c.cardUid === cardUID)) {
                  try {
                    await apiService.assignCardToUser(cardUID);
                    // Reload cards
                    const cardsResponse = await apiService.getUserCards();
                    if (cardsResponse.success) {
                      setUserCards(cardsResponse.cards);
                      const newCard = cardsResponse.cards.find(c => c.cardUid === cardUID);
                      if (newCard) {
                        setSelectedCard(newCard);
                      }
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Failed to add card');
                  }
                }
              }}
              className="bg-blue-500 px-4 py-3 rounded-xl"
            >
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">Add</Text>
            </Pressable>
          </View>
        </View>

        {/* Enhanced Amount Input Section */}
        <View className="mb-10">
          <Text style={{ 
            color: '#64748b',
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-sm uppercase tracking-widest mb-6 ml-1">Enter Credit Amount</Text>
          
          {/* Amount Input Card */}
          <View className="bg-white border border-slate-100 rounded-2xl p-6 shadow-lg shadow-blue-900/5 mb-6 relative overflow-hidden">
            {/* Decorative background element */}
            <View style={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: '#10b981', 
              opacity: 0.05 
            }} />
            
            <View className="flex-row items-center">
              <View className="bg-green-50 p-3 rounded-xl mr-4 border border-green-100">
                <View className="flex-row items-center">
                  <Text style={{ 
                    color: '#10b981',
                    fontFamily: 'Poppins_900Black'
                  }} className="text-2xl">$</Text>
                </View>
              </View>
              <View className="flex-1">
                <TextInput 
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={{ 
                    color: primaryNavy, 
                    fontFamily: 'Poppins_900Black',
                    fontSize: 28,
                    letterSpacing: -1,
                    textAlignVertical: 'center'
                  }}
                  className="h-16 py-0"
                  autoFocus
                  multiline={false}
                  scrollEnabled={false}
                />
                <Text style={{ 
                  color: '#94a3b8',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-xs mt-1">Amount to add to wallet</Text>
              </View>
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View>
            <Text style={{ 
              color: '#94a3b8',
              fontFamily: 'Poppins_600SemiBold'
            }} className="text-xs uppercase tracking-wider mb-3 ml-1">Quick Select</Text>
            <View className="flex-row justify-between">
              {[10, 25, 50, 100].map((quickAmount) => (
                <Pressable 
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount.toString())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 mx-1 items-center active:bg-slate-100"
                >
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-base">${quickAmount}</Text>
                  <Text style={{ 
                    color: '#94a3b8',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-xs mt-1">USD</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Transaction Info Card */}
        <View className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8">
          <View className="flex-row items-start">
            <View className="bg-blue-100 p-2 rounded-xl mr-4">
              <ShieldCheck size={20} color={primaryNavy} />
            </View>
            <View className="flex-1">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_700Bold'
              }} className="text-base mb-2">Secure Transaction</Text>
              <Text style={{ 
                color: '#64748b',
                fontFamily: 'Poppins_500Medium'
              }} className="text-sm leading-5">Your transaction is protected with bank-level encryption. Funds will be available instantly after confirmation.</Text>
            </View>
          </View>
        </View>

        {/* confirm-button */}
        <View className="items-center mb-12">
          <Pressable 
            onPress={handleTopUp}
            disabled={isProcessing}
            style={{ backgroundColor: primaryNavy, borderRadius: 16, width: '80%', opacity: isProcessing ? 0.7 : 1 }}
            className="h-20 items-center justify-center flex-row shadow-2xl shadow-blue-900/30 overflow-hidden"
          >
            <Text style={{ 
              color: 'white',
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl uppercase tracking-widest">{isProcessing ? 'Processing...' : 'Top up'}</Text>
          </Pressable>
        </View>
        <View className="h-40" />
      </ScrollView>

      <AgentBottomNav primaryNavy={primaryNavy} />
    </SafeAreaView>
  );
}
