import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, Clock, Calendar } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SalespersonTopbar } from '../../../components/SalespersonTopbar';
import { SalespersonBottomNav } from '../../../components/SalespersonBottomNav';
import { StorageService } from '../../../services/storage';
import { User, apiService } from '../../../services/api';

export default function SalespersonHistoryScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user data and transactions
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
        
        // Load user transactions
        await loadTransactions();
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserTransactions(20);
      
      if (response.success) {
        setTransactions(response.transactions);
        console.log('✅ User transactions loaded:', response.transactions.length);
      } else {
        console.error('Failed to load transactions:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SalespersonTopbar 
        name={currentUser?.username || 'Salesman'} 
        role={currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'} 
        primaryNavy={primaryNavy}
        showWelcome={false}
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 mt-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color={primaryNavy} />
            </Pressable>
            <View className="flex-1">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_900Black'
              }} className="text-3xl tracking-tighter">Transaction History</Text>
              <Text style={{ 
                color: '#64748b',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base mt-1">Your payment activities</Text>
            </View>
          </View>

          {/* Transaction List */}
          {isLoading ? (
            <View className="items-center py-8">
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base">Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="items-center py-8">
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base">No transactions found</Text>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <View key={transaction._id} className="bg-white border border-slate-100 p-6 rounded-2xl mb-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                      transaction.status === 'SUCCESS' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <CheckCircle size={20} color={transaction.status === 'SUCCESS' ? '#10b981' : '#ef4444'} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ 
                        color: primaryNavy,
                        fontFamily: 'Poppins_700Bold'
                      }} className="text-lg">{transaction.type === 'TOPUP' ? 'Top-up' : 'Payment'}</Text>
                      <Text style={{ 
                        color: '#94a3b8',
                        fontFamily: 'Poppins_500Medium'
                      }} className="text-sm">{transaction.cardUid}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text style={{ 
                      color: transaction.status === 'SUCCESS' ? '#10b981' : '#ef4444',
                      fontFamily: 'Poppins_800ExtraBold'
                    }} className="text-xl">{transaction.type === 'TOPUP' ? '+' : '-'}${transaction.amount.toFixed(2)}</Text>
                    <Text style={{ 
                      color: transaction.status === 'SUCCESS' ? '#10b981' : '#ef4444',
                      fontFamily: 'Poppins_600SemiBold'
                    }} className="text-xs uppercase">{transaction.status}</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center pt-4 border-t border-slate-50">
                  <View className="flex-row items-center">
                    <Clock size={14} color="#94a3b8" />
                    <Text style={{ 
                      color: '#94a3b8',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-sm ml-2">{new Date(transaction.createdAt).toLocaleString()}</Text>
                  </View>
                  {transaction.reason && (
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_400Regular'
                    }} className="text-xs">{transaction.reason}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
        <View className="h-40" />
      </ScrollView>

      <SalespersonBottomNav primaryNavy={primaryNavy} />
    </SafeAreaView>
  );
}