import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Filter, CheckCircle, XCircle, TrendingUp, Calendar, Clock, ArrowUpRight, ArrowDownRight, Search, ChevronRight } from 'lucide-react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AgentTopbar } from '../../../components/AgentTopbar';
import { AgentBottomNav } from '../../../components/AgentBottomNav';
import { StorageService } from '../../../services/storage';
import { User, apiService } from '../../../services/api';

const AgentTransactionsScreen = () => {
  const primaryNavy = "#002B5B";
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
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
        
        // Load transactions for a sample card UID
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
      // Use user-specific transactions instead of hardcoded card UID
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

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    return transactions.filter(transaction => {
      if (activeFilter === 'success') return transaction.status === 'SUCCESS';
      if (activeFilter === 'failed') return transaction.status === 'FAILED';
      return true; // 'all' filter
    });
  }, [transactions, activeFilter]);

  const todayTotal = useMemo(() => {
    if (!transactions.length) return 0;
    
    const today = new Date().toDateString();
    return transactions
      .filter(t => new Date(t.createdAt).toDateString() === today)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const successCount = useMemo(() => {
    return transactions.filter(t => t.status === 'SUCCESS').length;
  }, [transactions]);
  
  const failedCount = useMemo(() => {
    return transactions.filter(t => t.status === 'FAILED').length;
  }, [transactions]);

  const handleFilterChange = useCallback((filter: 'all' | 'success' | 'failed') => {
    setActiveFilter(filter);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <AgentTopbar 
        name={currentUser?.username || 'Agent'} 
        role={currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesman'} 
        primaryNavy={primaryNavy} 
      />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 mt-6">
          {/* Enhanced Header */}
          <View className="flex-row justify-between items-center mb-8">
             <View className="flex-1">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_900Black'
                }} className="text-3xl tracking-tighter">Transaction History</Text>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base mt-1">Track all your payment activities</Text>
             </View>
             <View className="flex-row space-x-3">
               <Pressable className="bg-white w-12 h-12 rounded-xl items-center justify-center border border-slate-200 shadow-sm">
                  <Search size={20} color={primaryNavy} />
               </Pressable>
               <Pressable className="bg-white w-12 h-12 rounded-xl items-center justify-center border border-slate-200 shadow-sm">
                  <Filter size={20} color={primaryNavy} />
               </Pressable>
             </View>
          </View>

          {/* Enhanced Stats Summary Card */}
          <View className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 relative overflow-hidden" style={{ backgroundColor: primaryNavy, height: 200 }}>
            {/* Background decorative elements */}
            <View style={{ 
              position: 'absolute', 
              top: -40, 
              right: -40, 
              width: 160, 
              height: 160, 
              borderRadius: 80, 
              backgroundColor: 'rgba(255,255,255,0.1)' 
            }} />
            <View style={{ 
              position: 'absolute', 
              bottom: -30, 
              left: -30, 
              width: 120, 
              height: 120, 
              borderRadius: 60, 
              backgroundColor: 'rgba(255,255,255,0.05)' 
            }} />
            
            {/* Card image/illustration */}
            <View style={{ 
              position: 'absolute', 
              top: 20, 
              right: 20, 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: 'rgba(255,255,255,0.15)',
            }} className="items-center justify-center">
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30, 
                backgroundColor: 'rgba(255,255,255,0.2)',
              }} className="items-center justify-center">
                <Image 
                  source={require('../../../assets/nexa.png')}
                  style={{ 
                    width: 40, 
                    height: 40,
                    resizeMode: 'contain',
                    tintColor: 'white',
                    opacity: 0.8
                  }}
                />
              </View>
            </View>
            
            <View className="flex-1 justify-between">
              <View>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm uppercase tracking-wider">Today's Total Volume</Text>
                <Text style={{ 
                  color: 'white',
                  fontFamily: 'Poppins_900Black'
                }} className="text-4xl mt-3">${todayTotal.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between items-end">
                <View className="flex-row items-center">
                  <TrendingUp size={18} color="#10b981" />
                  <Text style={{ 
                    color: '#10b981',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-base ml-2">+12.5% from yesterday</Text>
                </View>
                <View className="bg-white/20 p-2 rounded-xl">
                  <History size={20} color="white" />
                </View>
              </View>
            </View>
          </View>

          {/* Functional Filter Tabs */}
          <View className="flex-row mb-6">
            <Pressable 
              onPress={() => handleFilterChange('all')}
              className={`px-6 py-3 rounded-xl mr-3 border ${
                activeFilter === 'all' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-transparent'
              }`}
            >
              <Text style={{ 
                color: activeFilter === 'all' ? primaryNavy : '#64748b',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">All ({transactions.length})</Text>
            </Pressable>
            <Pressable 
              onPress={() => handleFilterChange('success')}
              className={`px-6 py-3 rounded-xl mr-3 border ${
                activeFilter === 'success' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-transparent'
              }`}
            >
              <Text style={{ 
                color: activeFilter === 'success' ? primaryNavy : '#64748b',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">Success ({successCount})</Text>
            </Pressable>
            <Pressable 
              onPress={() => handleFilterChange('failed')}
              className={`px-6 py-3 rounded-xl border ${
                activeFilter === 'failed' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-transparent'
              }`}
            >
              <Text style={{ 
                color: activeFilter === 'failed' ? primaryNavy : '#64748b',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">Failed ({failedCount})</Text>
            </Pressable>
          </View>

          {/* Refresh Button */}
          <Pressable 
            onPress={loadTransactions}
            disabled={isLoading}
            className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex-row items-center justify-center shadow-sm"
          >
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_600SemiBold'
            }} className="text-base">{isLoading ? 'Refreshing...' : 'Refresh Transactions'}</Text>
          </Pressable>

          {/* Transaction Cards - Exact Scan Tab Design */}
          {isLoading ? (
            <View className="items-center py-8">
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base">Loading transactions...</Text>
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View className="items-center py-8">
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base">No transactions found</Text>
            </View>
          ) : (
            filteredTransactions.map((item, index) => (
              <View key={item._id} className="mt-8 bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-blue-900/10" style={{ minHeight: 280 }}>
                <View className="flex-row items-center mb-6">
                  <View className={`p-2 rounded-xl mr-4 ${
                    item.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {item.status === 'SUCCESS' ? 
                      <CheckCircle size={24} color="#16a34a" /> :
                      <XCircle size={24} color="#dc2626" />
                    }
                  </View>
                  <View>
                    <Text className={`font-black text-xs uppercase tracking-widest ${
                      item.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.status === 'SUCCESS' ? 'Transaction Completed' : 'Transaction Failed'}
                    </Text>
                    <Text style={{ color: primaryNavy }} className="text-lg font-black">
                      {item.type === 'TOPUP' ? 'Top-up Transaction' : 'Payment Transaction'}
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-50 p-5 rounded-2xl mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase">Card UID</Text>
                    <Text style={{ color: primaryNavy }} className="font-mono text-sm">{item.cardUid}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase">Amount</Text>
                    <Text style={{ color: primaryNavy }} className="font-black text-lg">
                      {item.type === 'TOPUP' ? '+' : '-'}${item.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase">Date</Text>
                    <Text style={{ color: primaryNavy }} className="font-black text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase">Time</Text>
                    <Text style={{ color: primaryNavy }} className="font-black text-sm">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                  {item.reason && (
                    <>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-slate-400 font-bold text-[10px] uppercase">Reason</Text>
                        <Text style={{ color: primaryNavy }} className="font-black text-sm">{item.reason}</Text>
                      </View>
                    </>
                  )}
                </View>

                <Pressable 
                  onPress={() => {
                    Alert.alert('Transaction Details', `Transaction ID: ${item._id}\nType: ${item.type}\nAmount: $${item.amount.toFixed(2)}\nStatus: ${item.status}`);
                  }}
                  style={{ backgroundColor: primaryNavy }}
                  className="h-14 rounded-2xl flex-row items-center justify-center active:bg-blue-900"
                >
                  <Text className="text-white font-black text-sm uppercase tracking-widest mr-2">View Details</Text>
                  <ChevronRight size={18} color="white" />
                </Pressable>
              </View>
            ))
          )}
        </View>
        <View className="h-40" />
      </ScrollView>

      <AgentBottomNav primaryNavy={primaryNavy} />
    </SafeAreaView>
  );
};

export default AgentTransactionsScreen;