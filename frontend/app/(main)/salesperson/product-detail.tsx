import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MoreHorizontal, Heart, Plus, Minus, Package, Star } from 'lucide-react-native';
import { SalespersonBottomNav } from '../../../components/SalespersonBottomNav';
import { StorageService } from '../../../services/storage';
import { apiService } from '../../../services/api';
import { useCart } from '../../../contexts/CartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  inStock: boolean;
  active: boolean;
}

export default function ProductDetail() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const primaryNavy = "#002B5B";
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  // Cart context
  const { addToCart, isInCart } = useCart();

  // Available sizes for products
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Loading product with ID:', productId);
        
        const token = await StorageService.getToken();
        if (token) {
          apiService.setToken(token);
          console.log('🔑 Token set, making API request...');
          
          const response = await apiService.getProduct(productId as string);
          console.log('📦 Product API response:', response);
          
          if (response.success && response.product) {
            setProduct(response.product);
            console.log('✅ Product loaded successfully:', response.product.name);
          } else {
            console.log('❌ Product not found in response');
            setError('Product not found');
          }
        } else {
          console.log('❌ No token found');
          setError('Authentication required');
        }
      } catch (error) {
        console.error('❌ Failed to load product:', error);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    } else {
      console.log('❌ No productId provided');
      setError('No product ID provided');
      setIsLoading(false);
    }
  }, [productId]);

  const updateQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleLongPressIncrement = () => {
    setQuantity(Math.max(1, quantity + 5));
  };

  const handleLongPressDecrement = () => {
    setQuantity(Math.max(1, quantity - 5));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      // Cars don't have sizes, so no size selection needed
      addToCart(product, quantity);
      
      // Reset quantity to 1 after adding to cart
      setQuantity(1);
      
      // Show success notification
      Alert.alert(
        'Added to Cart',
        `${quantity} x ${product.name} added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { 
            text: 'View Cart', 
            onPress: () => router.push('/(main)/salesperson/pay')
          }
        ]
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Here you could also save to backend/storage if needed
    console.log(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4 animate-pulse">
            <Package size={32} color="#94a3b8" />
          </View>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_600SemiBold'
          }} className="text-lg">Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} color={primaryNavy} />
          </Pressable>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_700Bold'
          }} className="text-lg">Product Details</Text>
          <View className="w-10" />
        </View>
        
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <Package size={40} color="#ef4444" />
          </View>
          <Text style={{ 
            color: primaryNavy,
            fontFamily: 'Poppins_800ExtraBold'
          }} className="text-xl mb-2">Product Not Found</Text>
          <Text style={{ 
            color: '#64748b',
            fontFamily: 'Poppins_500Medium'
          }} className="text-base text-center mb-6">{error || 'The product you are looking for could not be found.'}</Text>
          <Pressable 
            onPress={() => router.back()}
            style={{ backgroundColor: primaryNavy }}
            className="px-8 py-4 rounded-2xl"
          >
            <Text style={{ 
              color: 'white',
              fontFamily: 'Poppins_600SemiBold'
            }} className="text-base">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} color={primaryNavy} />
        </Pressable>
        <Text style={{ 
          color: primaryNavy,
          fontFamily: 'Poppins_700Bold'
        }} className="text-lg">Product Details</Text>
        <Pressable className="w-10 h-10 items-center justify-center">
          <MoreHorizontal size={24} color={primaryNavy} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Product Image */}
        <View className="px-6 mb-6">
          <View className="bg-slate-50 rounded-3xl p-8 items-center justify-center relative" style={{ height: 320 }}>
            {product.image ? (
              <Image 
                source={{ uri: product.image }}
                style={{ width: 280, height: 240, resizeMode: 'cover', borderRadius: 24 }}
              />
            ) : (
              <View className="w-280 h-240 bg-slate-200 rounded-3xl items-center justify-center">
                <Package size={48} color="#94a3b8" />
              </View>
            )}
            
            {/* Product Badge */}
            {product.badge && (
              <View 
                style={{ backgroundColor: product.badgeColor || '#3b82f6' }}
                className="absolute top-4 right-4 px-3 py-2 rounded-full"
              >
                <Text style={{ 
                  color: 'white',
                  fontFamily: 'Poppins_700Bold'
                }} className="text-sm">{product.badge}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Info */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text style={{ 
                color: primaryNavy,
                fontFamily: 'Poppins_800ExtraBold'
              }} className="text-2xl mb-1">{product.name}</Text>
              <Text style={{ 
                color: '#64748b',
                fontFamily: 'Poppins_500Medium'
              }} className="text-base">{product.category}</Text>
            </View>
            <Pressable onPress={handleLike} className="w-10 h-10 items-center justify-center">
              <Heart size={24} color={isLiked ? "#ef4444" : "#94a3b8"} fill={isLiked ? "#ef4444" : "transparent"} />
            </Pressable>
          </View>

          {/* Price */}
          <View className="flex-row items-center mb-4">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_800ExtraBold'
            }} className="text-3xl mr-3">${(product.price / 100).toFixed(2)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={{ 
                color: '#94a3b8',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-lg line-through">${(product.originalPrice / 100).toFixed(2)}</Text>
            )}
          </View>

          {/* Rating */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row mr-3">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star} 
                  size={20} 
                  color={star <= Math.floor(product.rating || 4.5) ? "#f59e0b" : "#e5e7eb"} 
                  fill={star <= Math.floor(product.rating || 4.5) ? "#f59e0b" : "transparent"}
                />
              ))}
            </View>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-sm">({product.rating || '4.5'}) • 1,200+ reviews</Text>
          </View>

          {/* Stock Status */}
          <View className="mb-6">
            <View className={`px-4 py-2 rounded-full self-start ${product.inStock ? 'bg-green-50' : 'bg-red-50'}`}>
              <Text style={{ 
                color: product.inStock ? '#10b981' : '#ef4444',
                fontFamily: 'Poppins_600SemiBold'
              }} className="text-sm">
                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Car Specifications */}
          <View className="mb-8">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_700Bold'
            }} className="text-lg mb-4">Specifications</Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Premium automotive engineering</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Advanced safety features</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Comprehensive warranty coverage</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Professional delivery service</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_700Bold'
            }} className="text-lg mb-4">Description</Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-base leading-6 mb-2">
              {product.description}
            </Text>
            <Text style={{ 
              color: '#64748b',
              fontFamily: 'Poppins_500Medium'
            }} className="text-base leading-6">
              This premium quality product is crafted with attention to detail and designed for comfort and style. Perfect for everyday use or special occasions.
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            <Text style={{ 
              color: primaryNavy,
              fontFamily: 'Poppins_700Bold'
            }} className="text-lg mb-4">Features</Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Premium quality materials</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Comfortable and durable design</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Easy care and maintenance</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text style={{ 
                  color: '#64748b',
                  fontFamily: 'Poppins_500Medium'
                }} className="text-base">Available in multiple sizes</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="px-6 py-4 bg-white border-t border-slate-100" style={{ paddingBottom: 120 }}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Quantity Selector */}
          <View className="flex-row items-center">
            <Pressable 
              onPress={() => updateQuantity(-1)}
              onLongPress={handleLongPressDecrement}
              className="w-14 h-14 rounded-full border border-slate-300 items-center justify-center mr-4"
            >
              <Minus size={22} color={primaryNavy} />
            </Pressable>
            <View className="w-16 h-16 rounded-full bg-slate-900 items-center justify-center">
              <Text style={{ 
                color: 'white',
                fontFamily: 'Poppins_700Bold'
              }} className="text-2xl">{quantity}</Text>
            </View>
            <Pressable 
              onPress={() => updateQuantity(1)}
              onLongPress={handleLongPressIncrement}
              className="w-14 h-14 rounded-full border border-slate-300 items-center justify-center ml-4"
            >
              <Plus size={22} color={primaryNavy} />
            </Pressable>
          </View>

          {/* Add to Cart Button */}
          <Pressable 
            onPress={handleAddToCart}
            style={{ 
              backgroundColor: product.inStock ? primaryNavy : '#94a3b8',
              height: 72 
            }}
            className="flex-1 ml-6 items-center justify-center rounded-2xl shadow-lg"
            disabled={!product.inStock}
          >
            <Text style={{ 
              color: 'white',
              fontFamily: 'Poppins_700Bold'
            }} className="text-xl">
              {product.inStock ? (isInCart(product._id) ? 'Add More' : 'Add to cart') : 'Out of Stock'}
            </Text>
          </Pressable>
        </View>
      </View>

      <SalespersonBottomNav primaryNavy={primaryNavy} />
    </SafeAreaView>
  );
}