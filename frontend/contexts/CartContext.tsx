import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const savedCart = await StorageService.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await StorageService.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const addToCart = (product: any, quantity: number) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item._id === product._id
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item
        const cartItem: CartItem = {
          _id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          description: product.description,
          badge: product.badge,
          badgeColor: product.badgeColor,
          quantity
        };
        return [...prevItems, cartItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item._id === productId);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};