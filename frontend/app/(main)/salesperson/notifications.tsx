import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Check, Trash2, MoreVertical, Package, DollarSign, User, Settings } from 'lucide-react-native';
import { apiService } from '../../../services/api';
import { StorageService } from '../../../services/storage';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

export default function SalespersonNotifications() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const accentBlue = "#3b82f6";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const token = await StorageService.getToken();
      if (token) {
        apiService.setToken(token);
        const response = await apiService.getNotifications(50);
        if (response.success) {
          setNotifications(response.notifications || []);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <DollarSign size={20} color={accentBlue} />;
      case 'product':
        return <Package size={20} color="#10b981" />;
      case 'profile':
        return <User size={20} color="#8b5cf6" />;
      case 'system':
        return <Settings size={20} color="#f59e0b" />;
      default:
        return <Bell size={20} color="#64748b" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={primaryNavy} />
          </Pressable>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-xl">Notifications</Text>
          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead}>
              <Text style={{ 
                color: accentBlue,
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">Mark All Read</Text>
            </Pressable>
          )}
          {unreadCount === 0 && <View className="w-6" />}
        </View>

        {unreadCount > 0 && (
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_700Bold'
            }} className="text-base mb-1">
              {unreadCount} Unread Notification{unreadCount > 1 ? 's' : ''}
            </Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-sm">Stay updated with your latest activities</Text>
          </View>
        )}
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          // Loading state
          <View className="px-6 py-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} className="bg-slate-100 rounded-2xl p-4 mb-3 animate-pulse">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-slate-200 rounded-full mr-3" />
                  <View className="flex-1">
                    <View className="w-3/4 h-4 bg-slate-200 rounded mb-2" />
                    <View className="w-full h-3 bg-slate-200 rounded mb-1" />
                    <View className="w-1/2 h-3 bg-slate-200 rounded" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : notifications.length > 0 ? (
          <View className="px-6 py-4">
            {notifications.map((notification) => (
              <Pressable
                key={notification._id}
                onPress={() => !notification.read && markAsRead(notification._id)}
                className={`rounded-2xl p-4 mb-3 border ${
                  notification.read 
                    ? 'bg-white border-slate-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <View className="flex-row items-start">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    notification.read ? 'bg-slate-100' : 'bg-white'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text style={{ 
                        color: primaryNavy,
                        fontFamily: notification.read ? 'Poppins_600SemiBold' : 'Poppins_800ExtraBold'
                      }} className="text-base flex-1 mr-2" numberOfLines={2}>
                        {notification.title}
                      </Text>
                      
                      <View className="flex-row items-center">
                        {!notification.read && (
                          <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        )}
                        <Pressable onPress={() => deleteNotification(notification._id)}>
                          <Trash2 size={16} color="#94a3b8" />
                        </Pressable>
                      </View>
                    </View>
                    
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-sm mb-2" numberOfLines={3}>
                      {notification.message}
                    </Text>
                    
                    <Text style={{ 
                      color: '#94a3b8',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-xs">
                      {formatDate(notification.createdAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          // Empty state
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
              <Bell size={32} color="#94a3b8" />
            </View>
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl mb-2">No Notifications</Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-base text-center">
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}