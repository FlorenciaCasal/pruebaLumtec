import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductImage } from '@/types/productImage.types';


type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: ProductImage[];
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const itemIndex = state.items.findIndex(item => item.cartItemId === action.payload.cartItemId);
      if (itemIndex !== -1) {
        state.items[itemIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.cartItemId !== action.payload);
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.cartItemId === action.payload);
      if (item) item.quantity++;
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.cartItemId === action.payload);
      if (item && item.quantity > 1) item.quantity--;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
