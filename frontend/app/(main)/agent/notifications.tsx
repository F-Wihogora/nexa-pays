import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Clock,
  MoreHorizontal,
  Check,
  Trash2
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storage';
import { User, apiService } from '../../../services/api';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'transaction' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  metadata?: any;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Load current user data and notifications
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
        
        // Load notifications
        await loadNotifications();
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Load notifications from API
      const response = await apiService.getNotifications(20);
      
      if (response.success) {
        // Convert API response to match our interface
        const apiNotifications = response.notifications.map(notif => ({
          id: notif._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.createdAt),
          read: notif.read,
          actionable: notif.type === 'transaction' || notif.type === 'warning',
          metadata: notif.metadata
        }));
        
        setNotifications(apiNotifications);
        console.log('✅ Notifications loaded:', apiNotifications.length);
      } else {
        console.error('Failed to load notifications:', response.error);
        // Fallback to empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteNotification(notificationId);
              setNotifications(prev => 
                prev.filter(notif => notif.id !== notificationId)
              );
            } catch (error) {
              console.error('Failed to delete notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    if (!notification.actionable) return;

    switch (notification.type) {
      case 'transaction':
        if (notification.metadata?.cardUid) {
          // Navigate to card details or transactions
          router.push('/(main)/agent/transactions');
        }
        break;
      case 'warning':
        if (notification.metadata?.cardUid) {
          // Navigate to top-up screen
          router.push('/(main)/agent/topup');
        }
        break;
      case 'success':
        if (notification.metadata?.reportDate) {
          Alert.alert('Report', 'Report download functionality will be available soon.');
        }
        break;
    }
    
    markAsRead(notification.id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: '#10b981' };
      case 'warning':
        return { icon: AlertTriangle, color: '#f59e0b' };
      case 'info':
        return { icon: Info, color: '#3b82f6' };
      case 'transaction':
        return { icon: CreditCard, color: '#8b5cf6' };
      case 'security':
        return { icon: Shield, color: '#ef4444' };
      default:
        return { icon: Bell, color: '#64748b' };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || (filter === 'unread' && !notif.read)
  );

  const unreadCount = notifications.filter(notif => !notif.read).length;

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
        
        <View className="flex-1 items-center">
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_700Bold'
          }} className="text-lg">Notifications</Text>
          {unreadCount > 0 && (
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-xs">{unreadCount} unread</Text>
          )}
        </View>
        
        <Pressable 
          onPress={() => {
            Alert.alert(
              'Notification Options',
              'Choose an action',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Mark All Read', onPress: markAllAsRead },
                { text: 'Clear All', style: 'destructive', onPress: () => setNotifications([]) }
              ]
            );
          }}
          className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center"
        >
          <MoreHorizontal size={20} color={primaryNavy} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-6 py-4 bg-white border-b border-slate-100">
        <Pressable 
          onPress={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl mr-3 ${
            filter === 'all' ? 'bg-blue-500' : 'bg-slate-100'
          }`}
        >
          <Text style={{ 
            color: filter === 'all' ? 'white' : '#64748b',
            fontFamily: 'Poppins_600SemiBold'
          }} className="text-sm">All ({notifications.length})</Text>
        </Pressable>
        
        <Pressable 
          onPress={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl ${
            filter === 'unread' ? 'bg-blue-500' : 'bg-slate-100'
          }`}
        >
          <Text style={{ 
            color: filter === 'unread' ? 'white' : '#64748b',
            fontFamily: 'Poppins_600SemiBold'
          }} className="text-sm">Unread ({unreadCount})</Text>
        </Pressable>
      </View>

      {/* Notifications List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 py-4">
          {isLoading ? (
            <View className="items-center py-8">
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base">Loading notifications...</Text>
            </View>
          ) : filteredNotifications.length === 0 ? (
            <View className="items-center py-12">
              <View className="w-20 h-20 rounded-full bg-slate-100 items-center justify-center mb-4">
                <Bell size={32} color="#94a3b8" />
              </View>
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_700Bold'
              }} className="text-xl mb-2">No Notifications</Text>
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_500Medium'
              }} className="text-center">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification, index) => {
              const { icon: IconComponent, color } = getNotificationIcon(notification.type);
              
              return (
                <Pressable
                  key={notification.id}
                  onPress={() => handleNotificationAction(notification)}
                  className={`bg-white border border-slate-100 rounded-2xl p-4 mb-3 shadow-sm ${
                    !notification.read ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <View className="flex-row items-start">
                    {/* Icon */}
                    <View 
                      style={{ backgroundColor: `${color}15` }}
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4 mt-1"
                    >
                      <IconComponent size={20} color={color} />
                    </View>
                    
                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between mb-2">
                        <Text style={{ 
                          color: primaryNavy,
                          fontFamily: 'Poppins_700Bold'
                        }} className="text-base flex-1 mr-2">{notification.title}</Text>
                        
                        <View className="flex-row items-center">
                          <Text style={{ 
                            color: '#94a3b8',
                            fontFamily: 'Poppins_500Medium'
                          }} className="text-xs mr-2">{formatTimeAgo(notification.timestamp)}</Text>
                          
                          {!notification.read && (
                            <View className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </View>
                      </View>
                      
                      <Text style={{ 
                        color: '#64748b',
                        fontFamily: 'Poppins_500Medium'
                      }} className="text-sm leading-5 mb-3">{notification.message}</Text>
                      
                      {/* Action Buttons */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Clock size={12} color="#94a3b8" />
                          <Text style={{ 
                            color: '#94a3b8',
                            fontFamily: 'Poppins_500Medium'
                          }} className="text-xs ml-1">
                            {notification.timestamp.toLocaleDateString()}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center space-x-2">
                          {!notification.read && (
                            <Pressable 
                              onPress={() => markAsRead(notification.id)}
                              className="bg-blue-50 px-3 py-1 rounded-lg"
                            >
                              <Text style={{ 
                                color: '#3b82f6',
                                fontFamily: 'Poppins_600SemiBold'
                              }} className="text-xs">Mark Read</Text>
                            </Pressable>
                          )}
                          
                          <Pressable 
                            onPress={() => deleteNotification(notification.id)}
                            className="bg-red-50 p-2 rounded-lg"
                          >
                            <Trash2 size={12} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}