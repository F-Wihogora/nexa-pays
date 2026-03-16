import { View, Text, ScrollView, Pressable, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  Zap, 
  Shield, 
  CreditCard, 
  Settings, 
  Users, 
  Smartphone, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  Star, 
  ThumbsUp, 
  ExternalLink,
  ChevronRight,
  Clock,
  Globe,
  Headphones
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { StorageService } from '../../../services/storage';
import { User } from '../../../services/api';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  articles: number;
}

export default function HelpCenterScreen() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(50);
  const cardsOpacity = useSharedValue(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();

    // Animate entrance
    headerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    headerOpacity.value = withTiming(1, { duration: 800 });
    cardsTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    cardsOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardsTranslateY.value }],
    opacity: cardsOpacity.value,
  }));

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using Nexa',
      icon: Zap,
      color: '#3b82f6',
      articles: 12
    },
    {
      id: 'payments',
      title: 'Payments & Cards',
      description: 'Managing transactions and cards',
      icon: CreditCard,
      color: '#10b981',
      articles: 18
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Keep your account secure',
      icon: Shield,
      color: '#f59e0b',
      articles: 8
    },
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Profile and preferences',
      icon: Settings,
      color: '#8b5cf6',
      articles: 15
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Fix common issues',
      icon: AlertCircle,
      color: '#ef4444',
      articles: 22
    },
    {
      id: 'mobile',
      title: 'Mobile App',
      description: 'App features and navigation',
      icon: Smartphone,
      color: '#06b6d4',
      articles: 10
    }
  ];

  const popularFAQs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I top up a card?',
      answer: 'To top up a card, go to the Agent dashboard, tap "Top-up", enter the card UID or scan the card, enter the amount, and confirm the transaction. The balance will be updated instantly.',
      category: 'payments',
      helpful: 245
    },
    {
      id: '2',
      question: 'What should I do if a payment fails?',
      answer: 'If a payment fails, check the card balance first. If the balance is sufficient, try the transaction again. If it continues to fail, check your internet connection and contact support if the issue persists.',
      category: 'troubleshooting',
      helpful: 189
    },
    {
      id: '3',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Edit Profile, enter your current password, then enter and confirm your new password. Your password must be at least 6 characters long.',
      category: 'account',
      helpful: 156
    },
    {
      id: '4',
      question: 'Can I view transaction history?',
      answer: 'Yes! Go to the Transactions tab to view all your transaction history. You can filter by status (success/failed) and see detailed information for each transaction.',
      category: 'payments',
      helpful: 203
    },
    {
      id: '5',
      question: 'Is my data secure?',
      answer: 'Absolutely! We use bank-level encryption to protect your data. All transactions are secured with SSL encryption, and we never store sensitive payment information.',
      category: 'security',
      helpful: 178
    }
  ];

  const contactOptions = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      color: '#10b981',
      action: () => Alert.alert('Live Chat', 'Live chat will be available soon!'),
      available: '24/7'
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      color: '#3b82f6',
      action: () => Linking.openURL('mailto:support@nexa.com'),
      available: 'Response in 2-4 hours'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      color: '#f59e0b',
      action: () => Linking.openURL('tel:+1234567890'),
      available: 'Mon-Fri 9AM-6PM'
    }
  ];

  const filteredFAQs = popularFAQs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (selectedCategory && faq.category === selectedCategory)
  );

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setSearchQuery('');
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const markHelpful = (faqId: string) => {
    Alert.alert('Thank you!', 'Your feedback helps us improve our help center.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Animated Header */}
      <Animated.View style={headerAnimatedStyle}>
        <View className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-white/20">
          <View className="flex-row items-center justify-between mb-6">
            <Pressable 
              onPress={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-xl items-center justify-center shadow-lg border border-white/30"
            >
              <ArrowLeft size={20} color={primaryNavy} />
            </Pressable>
            
            <View className="flex-1 items-center">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-xl">Help Center</Text>
              <Text style={{ 
                color: '#64748b',
                fontFamily: 'Poppins_500Medium'
              }} className="text-sm">We're here to help you succeed</Text>
            </View>
            
            <View className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-lg">
              <Headphones size={20} color="white" />
            </View>
          </View>

          {/* Hero Section */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 items-center justify-center mb-6 shadow-2xl shadow-blue-500/30">
              <View className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl items-center justify-center">
                <HelpCircle size={32} color="white" />
              </View>
            </View>
            
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_900Black'
            }} className="text-3xl text-center mb-3 tracking-tight">How can we help you?</Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-center text-base leading-6 px-4">
              Find answers, get support, and learn how to make the most of Nexa
            </Text>
          </View>

          {/* Search Bar */}
          <View className="relative mb-6">
            <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search size={20} color="#94a3b8" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for help articles, FAQs..."
              placeholderTextColor="#94a3b8"
              style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_600SemiBold'
              }}
              className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl pl-12 pr-4 py-4 text-base shadow-lg"
            />
          </View>
        </View>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View style={cardsAnimatedStyle} className="px-6">
          {/* Quick Actions */}
          <View className="mb-8">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl mb-4">Quick Actions</Text>
            
            <View className="flex-row justify-between mb-4">
              {contactOptions.map((option, index) => (
                <Pressable
                  key={option.id}
                  onPress={option.action}
                  className="flex-1 mx-1"
                >
                  <View className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-4 items-center shadow-lg">
                    <View 
                      style={{ backgroundColor: `${option.color}15` }}
                      className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                    >
                      <option.icon size={24} color={option.color} />
                    </View>
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-sm text-center mb-1">{option.title}</Text>
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-xs text-center">{option.available}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Help Categories */}
          <View className="mb-8">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl mb-4">Browse by Category</Text>
            
            <View className="flex-row flex-wrap justify-between">
              {helpCategories.map((category, index) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  className="w-[48%] mb-4"
                >
                  <View className={`bg-white/80 backdrop-blur-xl border rounded-2xl p-5 shadow-lg ${
                    selectedCategory === category.id 
                      ? 'border-blue-300 bg-blue-50/80' 
                      : 'border-white/30'
                  }`}>
                    <View className="flex-row items-center justify-between mb-3">
                      <View 
                        style={{ backgroundColor: `${category.color}15` }}
                        className="w-12 h-12 rounded-xl items-center justify-center"
                      >
                        <category.icon size={20} color={category.color} />
                      </View>
                      <View className="bg-slate-100 px-2 py-1 rounded-lg">
                        <Text style={{ 
                          color: '#64748b',
                          fontFamily: 'Poppins_600SemiBold'
                        }} className="text-xs">{category.articles}</Text>
                      </View>
                    </View>
                    
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-base mb-2">{category.title}</Text>
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-sm leading-5">{category.description}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Popular FAQs */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-xl">
                {selectedCategory ? 'Filtered Results' : 'Popular Questions'}
              </Text>
              {selectedCategory && (
                <Pressable 
                  onPress={() => setSelectedCategory(null)}
                  className="bg-blue-100 px-3 py-1 rounded-lg"
                >
                  <Text style={{ 
                    color: '#3b82f6',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-sm">Clear Filter</Text>
                </Pressable>
              )}
            </View>
            
            {filteredFAQs.length === 0 ? (
              <View className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 items-center shadow-lg">
                <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
                  <Search size={24} color="#94a3b8" />
                </View>
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_700Bold'
                }} className="text-lg mb-2">No results found</Text>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-center">Try adjusting your search or browse categories above</Text>
              </View>
            ) : (
              filteredFAQs.map((faq, index) => (
                <View key={faq.id} className="mb-3">
                  <Pressable
                    onPress={() => toggleFAQ(faq.id)}
                    className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-lg"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text style={{ 
                        color: primaryNavy,
                        fontFamily: 'Poppins_700Bold'
                      }} className="text-base flex-1 mr-3">{faq.question}</Text>
                      <View className={`w-8 h-8 rounded-full items-center justify-center ${
                        expandedFAQ === faq.id ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <ChevronRight 
                          size={16} 
                          color={expandedFAQ === faq.id ? '#3b82f6' : '#64748b'}
                          style={{ 
                            transform: [{ rotate: expandedFAQ === faq.id ? '90deg' : '0deg' }] 
                          }}
                        />
                      </View>
                    </View>
                    
                    {expandedFAQ === faq.id && (
                      <View className="mt-4 pt-4 border-t border-slate-100">
                        <Text style={{ 
                          color: '#64748b',
                          fontFamily: 'Poppins_500Medium'
                        }} className="text-sm leading-6 mb-4">{faq.answer}</Text>
                        
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <ThumbsUp size={14} color="#10b981" />
                            <Text style={{ 
                              color: '#10b981',
                              fontFamily: 'Poppins_600SemiBold'
                            }} className="text-xs ml-2">{faq.helpful} found this helpful</Text>
                          </View>
                          
                          <Pressable 
                            onPress={() => markHelpful(faq.id)}
                            className="bg-green-50 px-3 py-1 rounded-lg"
                          >
                            <Text style={{ 
                              color: '#10b981',
                              fontFamily: 'Poppins_600SemiBold'
                            }} className="text-xs">Helpful?</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {/* Additional Resources */}
          <View className="mb-8">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl mb-4">Additional Resources</Text>
            
            <View className="space-y-3">
              <Pressable className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-xl">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Video size={20} color="white" className="mr-2" />
                      <Text style={{ 
                        color: 'white',
                        fontFamily: 'Poppins_700Bold'
                      }} className="text-lg">Video Tutorials</Text>
                    </View>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-sm">Watch step-by-step guides</Text>
                  </View>
                  <ExternalLink size={20} color="white" />
                </View>
              </Pressable>

              <Pressable className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-orange-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                      <BookOpen size={20} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text style={{ 
                        color: primaryNavy,
                        fontFamily: 'Poppins_700Bold'
                      }} className="text-base mb-1">User Guide</Text>
                      <Text style={{ 
                        color: '#64748b',
                        fontFamily: 'Poppins_500Medium'
                      }} className="text-sm">Complete documentation</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#94a3b8" />
                </View>
              </Pressable>

              <Pressable className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-lg">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-green-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                      <Users size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text style={{ 
                        color: primaryNavy,
                        fontFamily: 'Poppins_700Bold'
                      }} className="text-base mb-1">Community Forum</Text>
                      <Text style={{ 
                        color: '#64748b',
                        fontFamily: 'Poppins_500Medium'
                      }} className="text-sm">Connect with other users</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#94a3b8" />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Contact Support CTA */}
          <View className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 mb-8 shadow-2xl">
            <View className="items-center">
              <View className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl items-center justify-center mb-4">
                <MessageCircle size={28} color="white" />
              </View>
              
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-2xl text-center mb-3">Still need help?</Text>
              <Text style={{ 
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Poppins_500Medium'
              }} className="text-center text-base mb-6 leading-6">
                Our support team is available 24/7 to assist you with any questions or issues.
              </Text>
              
              <Pressable 
                onPress={() => Alert.alert('Contact Support', 'Choose your preferred contact method from the options above.')}
                className="bg-white px-8 py-4 rounded-2xl shadow-lg"
              >
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_700Bold'
                }} className="text-base">Contact Support</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}