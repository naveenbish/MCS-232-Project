import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FoodItem, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

// Load cart from localStorage if available
const loadCartFromStorage = (): CartState => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch {
        return initialState;
      }
    }
  }
  return initialState;
};

const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(state));
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + Number(item.foodItem.price) * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart(state, action: PayloadAction<{ foodItem: FoodItem; quantity?: number }>) {
      const { foodItem, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.foodItem.id === foodItem.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ foodItem, quantity });
      }

      state.totalAmount = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.foodItem.id !== action.payload);
      state.totalAmount = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    updateQuantity(state, action: PayloadAction<{ itemId: string; quantity: number }>) {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((item) => item.foodItem.id === itemId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.foodItem.id !== itemId);
        } else {
          item.quantity = quantity;
        }
      }

      state.totalAmount = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
      saveCartToStorage(state);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
