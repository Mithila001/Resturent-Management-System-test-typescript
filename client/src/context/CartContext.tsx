/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Medium-level typing for cart context
export interface CartItem {
  _id: string;
  name?: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    menuItem: Partial<CartItem> & { _id: string; price?: number },
    quantity?: number,
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemCount: () => number;
  isInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Helper function to get or create a guest session ID
const getGuestSessionId = (): string => {
  let guestId = localStorage.getItem("guestSessionId");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guestSessionId", guestId);
  }
  return guestId;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() as { user: any };

  // Determine cart key based on user or guest session
  const getCartKey = (): string => {
    if (user && user._id) {
      // For logged-in users, use their user ID
      return `cart_${user._id}`;
    } else {
      // For guests, use a guest session ID
      return `cart_${getGuestSessionId()}`;
    }
  };

  // Use lazy initialization to load from localStorage only once
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const cartKey = user && user._id ? `cart_${user._id}` : `cart_${getGuestSessionId()}`;
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        return JSON.parse(savedCart) as CartItem[];
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes or user changes
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, user]);

  // Load cart when user changes (login/logout)
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart) as CartItem[]);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Add item to cart
  const addToCart = (
    menuItem: Partial<CartItem> & { _id: string; price?: number },
    quantity = 1,
  ): void => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === menuItem._id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item._id === menuItem._id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      } else {
        // Add new item
        const price = menuItem.price ?? 0;
        return [...prevItems, { ...menuItem, _id: menuItem._id, price, quantity } as CartItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string): void => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item._id === itemId ? { ...item, quantity } : item)),
    );
  };

  // Increment item quantity
  const incrementQuantity = (itemId: string): void => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  // Decrement item quantity
  const decrementQuantity = (itemId: string): void => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item._id === itemId) {
            const newQuantity = item.quantity - 1;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item._id !== itemId || item.quantity > 0),
    );
  };

  // Clear entire cart
  const clearCart = (): void => {
    setCartItems([]);
  };

  // Calculate cart totals
  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemCount = (): number => {
    return cartItems.length;
  };

  // Check if item is in cart
  const isInCart = (itemId: string): boolean => {
    return cartItems.some((item) => item._id === itemId);
  };

  // Get item quantity in cart
  const getItemQuantity = (itemId: string): number => {
    const item = cartItems.find((item) => item._id === itemId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getItemCount,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
