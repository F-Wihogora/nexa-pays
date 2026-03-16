import { View, Text, ScrollView, Pressable, TextInput, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Zap, History, LayoutGrid, Bell, Search, MoreVertical, Layers, PieChart, BarChart3, Target, Filter, Clock, Shirt, Package, Gem, Briefcase, Heart, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SalespersonBottomNav } from '../../../components/SalespersonBottomNav';
import { SalespersonTopbar } from '../../../components/SalespersonTopbar';
import { StorageService } from '../../../services/storage';
import { User, apiService } from '../../../services/api';
import { useCart } from '../../../contexts/CartContext';

export default function SalespersonDashboard() {
  const router = useRouter();
  const primaryNavy = "#002B5B";
  const accentBlue = "#3b82f6";
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showCart, setShowCart] = useState(false);
  
  // Cart context
  const { items, addToCart, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();

  // Load current user data and products
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const user = await StorageService.getUser();
        setCurrentUser(user);
        
        // Set API token for authenticated requests
        const token = await StorageService.getToken();
        if (token) {
          apiService.setToken(token);
          
          // Load products from backend
          const productsResponse = await apiService.getProducts();
          if (productsResponse.success) {
            setProducts(productsResponse.products || []);
            console.log('📦 Products loaded:', productsResponse.products);
          }
          
          // Load notification count
          const notifCountResponse = await apiService.getUnreadNotificationCount();
          if (notifCountResponse.success) {
            setNotificationCount(notifCountResponse.count || 0);
            console.log('🔔 Notification count loaded:', notifCountResponse.count);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-change featured product every 4 seconds
  useEffect(() => {
    if (featuredProducts && featuredProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentProductIndex((prevIndex) => 
          (prevIndex + 1) % featuredProducts.length
        );
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [featuredProducts?.length]);

  // Reset index when products change
  useEffect(() => {
    if (featuredProducts && featuredProducts.length > 0) {
      setCurrentProductIndex(0);
    }
  }, [products]);

  const categories = [
    { 
      name: 'Sports', 
      color: primaryNavy,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=200&fit=crop'
    },
    { 
      name: 'Supercar', 
      color: primaryNavy,
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=200&fit=crop'
    },
    { 
      name: 'Motorcycle', 
      color: primaryNavy,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
    },
    { 
      name: 'Private Jet', 
      color: primaryNavy,
      image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=200&h=200&fit=crop'
    },
    { 
      name: 'Yacht', 
      color: primaryNavy,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop'
    },
    { 
      name: 'Electric', 
      color: primaryNavy,
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=200&h=200&fit=crop'
    },
  ];

  const filters = ['All', 'New', 'Popular', 'Premium'];

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/(main)/salesperson/products',
      params: { category: categoryName }
    });
  };

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Filter products based on selected filter and search
  const getFilteredProducts = () => {
    if (!products || products.length === 0) return [];
    
    let filtered = products;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    switch (selectedFilter) {
      case 'New':
        return filtered.filter(p => p.badge === 'New' || p.badge === 'Featured');
      case 'Popular':
        return filtered.filter(p => p.badge === 'Popular' || p.badge === 'Best Seller' || p.badge === 'Trending');
      case 'Premium':
        return filtered.filter(p => p.badge === 'Premium' || p.badge === 'Limited');
      case 'All':
      default:
        return filtered;
    }
  };

  const filteredProducts = getFilteredProducts();

  // Cart functionality - same as products tab
  const handleQuantityUpdate = (product: any, delta: number) => {
    const currentItem = items.find(item => item._id === product._id);
    const currentQuantity = currentItem ? currentItem.quantity : 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    
    if (newQuantity === 0 && currentItem) {
      removeFromCart(product._id);
    } else if (newQuantity > 0) {
      if (currentItem) {
        updateQuantity(product._id, newQuantity);
      } else {
        addToCart(product, delta);
      }
    }
    
    // Show cart when + button is pressed
    if (delta > 0) {
      setShowCart(true);
    }
  };

  const getProductQuantity = (productId: string) => {
    const item = items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/(main)/salesperson/product-detail',
      params: { productId: productId }
    });
  };

  const handleCheckout = () => {
    router.push('/(main)/salesperson/pay');
  };

  // Featured products for carousel
  const featuredProducts = filteredProducts?.slice(0, 3) || [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SalespersonTopbar 
        name={currentUser?.username || 'Salesperson'} 
        role={currentUser?.role === 'admin' ? 'Nexa Agent' : 'Nexa Salesperson'} 
        primaryNavy={primaryNavy}
        notificationCount={notificationCount}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl mr-3">
              <Search size={20} color="#94a3b8" />
              <TextInput 
                placeholder="Search products..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="ml-3 flex-1 text-slate-600 text-base"
                placeholderTextColor="#94a3b8"
                style={{ fontFamily: 'Poppins_500Medium' }}
              />
            </View>
            <Pressable 
              style={{ backgroundColor: accentBlue }}
              className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
            >
              <Filter size={22} color="white" />
            </Pressable>
          </View>
        </View>
        {/* Featured Product Auto-Carousel */}
        <View className="px-6 mb-8">
          
          {/* Single Auto-Changing Featured Product Card */}
          {featuredProducts && featuredProducts.length > 0 && featuredProducts[currentProductIndex] ? (
            <Pressable 
              onPress={() => handleProductPress(featuredProducts[currentProductIndex]._id)}
              className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 flex-row items-center"
              style={{ minHeight: 200 }}
            >
              <View className="flex-1 pr-6">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-3xl mb-4" numberOfLines={2}>
                  {featuredProducts[currentProductIndex].name}
                </Text>
                
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-lg mb-6" numberOfLines={3}>
                  {featuredProducts[currentProductIndex].description || 'Premium luxury vehicle with exceptional performance and cutting-edge technology'}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <Pressable 
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push('/(main)/salesperson/products');
                    }}
                    style={{ backgroundColor: primaryNavy }}
                    className="px-8 py-4 rounded-xl"
                  >
                    <Text style={{ 
                      color: 'white',
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-lg">Shop Now</Text>
                  </Pressable>
                  
                  {/* Product indicator dots */}
                  <View className="flex-row">
                    {featuredProducts.map((_, index) => (
                      <View 
                        key={index}
                        style={{ 
                          backgroundColor: index === currentProductIndex ? primaryNavy : '#e2e8f0',
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          marginHorizontal: 3
                        }}
                      />
                    ))}
                  </View>
                </View>
              </View>
              
              <View className="relative">
                <View className="w-44 h-36 rounded-2xl overflow-hidden shadow-xl">
                  <Image 
                    source={{ uri: featuredProducts[currentProductIndex].image }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                </View>
                {featuredProducts[currentProductIndex].badge && (
                  <View 
                    style={{ 
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: featuredProducts[currentProductIndex].badgeColor || '#ef4444',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4
                    }}
                  >
                    <Text style={{ 
                      color: 'white',
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-sm">{featuredProducts[currentProductIndex].badge}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ) : (
            // Fallback when no products are available
            <View className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 flex-row items-center" style={{ minHeight: 200 }}>
              <View className="flex-1 pr-6">
                <Text style={{ 
                  color: primaryNavy,
                  fontFamily: 'Poppins_800ExtraBold'
                }} className="text-3xl mb-4">
                  Premium Vehicles
                </Text>
                
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-lg mb-6">
                  Loading our exclusive collection of luxury vehicles...
                </Text>
                
                <Pressable 
                  onPress={() => router.push('/(main)/salesperson/products')}
                  style={{ backgroundColor: primaryNavy }}
                  className="px-8 py-4 rounded-xl self-start"
                >
                  <Text style={{ 
                    color: 'white',
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-lg">Browse All</Text>
                </Pressable>
              </View>
              
              <View className="w-44 h-36 rounded-2xl bg-gray-100 items-center justify-center">
                <Package size={40} color="#9ca3af" />
              </View>
            </View>
          )}
        </View>

        {/* Categories */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl">Category</Text>
            <Pressable onPress={() => router.push('/(main)/salesperson/products')}>
              <Text style={{ 
                color: accentBlue,
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">See All</Text>
            </Pressable>
          </View>
          
          <View className="flex-row justify-between">
            {categories.map((category, index) => (
              <Pressable 
                key={index}
                onPress={() => handleCategoryPress(category.name)}
                className="items-center"
              >
                <View className="w-20 h-20 rounded-full overflow-hidden mb-3 shadow-lg border-2 border-white">
                  <Image 
                    source={{ uri: category.image }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                </View>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm">{category.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Products */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-xl">Products</Text>
            <Pressable onPress={() => router.push('/(main)/salesperson/products')}>
              <Text style={{ 
                color: accentBlue,
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">See All</Text>
            </Pressable>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filters.map((filter, index) => (
                <Pressable 
                  key={index}
                  onPress={() => handleFilterPress(filter)}
                  style={{ 
                    backgroundColor: selectedFilter === filter ? primaryNavy : 'transparent',
                    marginRight: 16
                  }}
                  className="px-6 py-3 rounded-2xl border border-slate-200"
                >
                  <Text style={{ 
                    color: selectedFilter === filter ? 'white' : '#64748b',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-base">{filter}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Products Grid - Exact match with products tab */}
          <View className="flex-row flex-wrap justify-between">
            {isLoading ? (
              // Loading state
              <>
                <View className="w-[48%] bg-slate-100 rounded-3xl p-4 animate-pulse mb-4">
                  <View className="w-full h-40 bg-slate-200 rounded-2xl mb-3" />
                  <View className="w-3/4 h-4 bg-slate-200 rounded mb-1" />
                  <View className="w-1/2 h-3 bg-slate-200 rounded mb-2" />
                  <View className="w-1/3 h-6 bg-slate-200 rounded" />
                </View>
                <View className="w-[48%] bg-slate-100 rounded-3xl p-4 animate-pulse mb-4">
                  <View className="w-full h-40 bg-slate-200 rounded-2xl mb-3" />
                  <View className="w-3/4 h-4 bg-slate-200 rounded mb-1" />
                  <View className="w-1/2 h-3 bg-slate-200 rounded mb-2" />
                  <View className="w-1/3 h-6 bg-slate-200 rounded" />
                </View>
              </>
            ) : filteredProducts.length > 0 ? (
              // Real products from backend - EXACT same design as products tab
              filteredProducts.slice(0, 4).map((product, index) => (
                <View key={product._id || index} className="w-[48%] mb-4">
                  <Pressable 
                    onPress={() => handleProductPress(product._id)}
                    className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm"
                  >
                    <View className="relative mb-3">
                      <View className="w-full h-40 rounded-2xl overflow-hidden">
                        {product.image ? (
                          <Image 
                            source={{ uri: product.image }}
                            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                          />
                        ) : (
                          <View className="w-full h-full bg-slate-100 items-center justify-center">
                            <Package size={32} color={primaryNavy} />
                          </View>
                        )}
                      </View>
                      {product.badge && (
                        <View 
                          style={{ backgroundColor: product.badgeColor || '#3b82f6' }}
                          className="absolute top-2 right-2 px-2 py-1 rounded-full"
                        >
                          <Text style={{ 
                            color: 'white',
                            fontFamily: 'Poppins_700Bold'
                          }} className="text-xs">{product.badge}</Text>
                        </View>
                      )}
                      <Pressable className="absolute top-2 left-2 w-8 h-8 bg-white/80 rounded-full items-center justify-center">
                        <Heart size={16} color="#64748b" />
                      </Pressable>
                      {!product.inStock && (
                        <View className="absolute inset-0 bg-black/50 rounded-2xl items-center justify-center">
                          <Text style={{ 
                            color: 'white',
                            fontFamily: 'Poppins_700Bold'
                          }} className="text-sm">Out of Stock</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-sm mb-1" numberOfLines={2}>{product.name}</Text>
                    
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_500Medium'
                    }} className="text-xs mb-2" numberOfLines={1}>{product.description || 'Premium quality product'}</Text>
                    
                    <View className="flex-row items-center justify-between mb-3">
                      <View>
                        <Text style={{ 
                          color: accentBlue,
                          fontFamily: 'Poppins_800ExtraBold'
                        }} className="text-lg">${(product.price / 100).toFixed(2)}</Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Text style={{ 
                            color: '#94a3b8',
                            fontFamily: 'Poppins_500Medium'
                          }} className="text-xs line-through">${(product.originalPrice / 100).toFixed(2)}</Text>
                        )}
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-yellow-500 mr-1">★</Text>
                        <Text style={{ 
                          color: '#64748b',
                          fontFamily: 'Poppins_500Medium'
                        }} className="text-xs">{product.rating || '4.5'}</Text>
                      </View>
                    </View>

                    {product.inStock && (
                      <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-2xl">
                        <Pressable 
                          onPress={(e) => {
                            e.stopPropagation();
                            handleQuantityUpdate(product, -1);
                          }} 
                          className="w-10 h-10 items-center justify-center bg-white rounded-full border border-slate-200 shadow-sm"
                        >
                          <Minus size={16} color={primaryNavy} />
                        </Pressable>
                        <Text style={{ 
                          color: primaryNavy,
                          fontFamily: 'Poppins_700Bold'
                        }} className="text-base">{getProductQuantity(product._id)}</Text>
                        <Pressable 
                          onPress={(e) => {
                            e.stopPropagation();
                            handleQuantityUpdate(product, 1);
                          }} 
                          className="w-10 h-10 items-center justify-center bg-white rounded-full border border-slate-200 shadow-sm"
                        >
                          <Plus size={16} color={primaryNavy} />
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                </View>
              ))
            ) : (
              // No products available
              <View className="w-full bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <View className="items-center">
                  <Package size={48} color="#3b82f6" className="mb-4" />
                  <Text style={{ 
                    color: primaryNavy,
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-lg mb-2">No Products Found</Text>
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_500Medium'
                  }} className="text-sm text-center">
                    {searchQuery ? `No products match "${searchQuery}"` : `No ${selectedFilter.toLowerCase()} products available`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        <View className="h-40" />
      </ScrollView>

      {/* Sliding Cart Section */}
      {showCart && (
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200" style={{ height: '50%' }}>
          <View className="p-6">
            {/* Handle */}
            <View className="w-12 h-1 bg-slate-300 rounded-full self-center mb-6" />
            
            {/* Cart Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-2xl">Shopping Cart</Text>
              <Pressable onPress={() => setShowCart(false)}>
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_600SemiBold'
                }} className="text-sm">Close</Text>
              </Pressable>
            </View>

            {/* Cart Items */}
            <ScrollView className="flex-1 mb-6" showsVerticalScrollIndicator={false}>
              {items.length > 0 ? items.map((item, index) => (
                <View key={item._id} className="flex-row items-center bg-slate-50 p-4 rounded-2xl mb-3">
                  <View className="w-16 h-16 rounded-2xl overflow-hidden mr-4">
                    {item.image ? (
                      <Image 
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                      />
                    ) : (
                      <View className="w-full h-full bg-slate-100 items-center justify-center">
                        <Package size={20} color={primaryNavy} />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-base mb-1" numberOfLines={1}>{item.name}</Text>
                    <Text style={{ 
                      color: accentBlue,
                      fontFamily: 'Poppins_800ExtraBold'
                    }} className="text-lg">${(item.price / 100).toFixed(2)}</Text>
                  </View>
                  <View className="flex-row items-center mr-3">
                    <Pressable 
                      onPress={() => updateQuantity(item._id, item.quantity - 1)} 
                      className="w-10 h-10 items-center justify-center bg-white rounded-full border border-slate-200"
                    >
                      <Minus size={16} color={primaryNavy} />
                    </Pressable>
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="mx-4 text-base">{item.quantity}</Text>
                    <Pressable 
                      onPress={() => updateQuantity(item._id, item.quantity + 1)} 
                      className="w-10 h-10 items-center justify-center bg-white rounded-full border border-slate-200"
                    >
                      <Plus size={16} color={primaryNavy} />
                    </Pressable>
                  </View>
                  {/* Delete Button */}
                  <Pressable 
                    onPress={() => removeFromCart(item._id)}
                    className="w-10 h-10 items-center justify-center bg-red-50 rounded-full border border-red-200"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </View>
              )) : (
                <View className="items-center py-8">
                  <Text style={{ 
                    color: '#64748b',
                    fontFamily: 'Poppins_600SemiBold'
                  }} className="text-base">Your cart is empty</Text>
                </View>
              )}
            </ScrollView>

            {/* Cart Summary */}
            {items.length > 0 && (
              <>
                <View className="bg-slate-50 p-4 rounded-2xl mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_600SemiBold'
                    }} className="text-base">Items ({getTotalItems()})</Text>
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-base">${(getTotalPrice() / 100).toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ 
                      color: '#64748b',
                      fontFamily: 'Poppins_600SemiBold'
                    }} className="text-base">Tax</Text>
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_700Bold'
                    }} className="text-base">${(getTotalPrice() * 0.1 / 100).toFixed(2)}</Text>
                  </View>
                  <View className="h-px bg-slate-300 my-2" />
                  <View className="flex-row justify-between items-center">
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_800ExtraBold'
                    }} className="text-xl">Total</Text>
                    <Text style={{ 
                      color: primaryNavy,
                      fontFamily: 'Poppins_800ExtraBold'
                    }} className="text-xl">${(getTotalPrice() * 1.1 / 100).toFixed(2)}</Text>
                  </View>
                </View>

                {/* Checkout Button */}
                <Pressable 
                  onPress={handleCheckout}
                  style={{ backgroundColor: primaryNavy }}
                  className="h-16 flex-row items-center justify-center rounded-2xl shadow-lg"
                >
                  <ShoppingCart size={22} color="white" className="mr-3" />
                  <Text style={{ 
                    color: 'white',
                    fontFamily: 'Poppins_700Bold'
                  }} className="text-lg">Proceed to Checkout</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}

      <SalespersonBottomNav primaryNavy={primaryNavy} />
    </SafeAreaView>
  );
}
