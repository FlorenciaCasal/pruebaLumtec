import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductImage } from '@/types/productImage.types';

type Package = {
  id: string;
  weightKg: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  quantity: number;
};

type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: ProductImage[];
  type: string;
  packages: Package[];
};

type CartState = {
  cartId: string | null;
  items: CartItem[];
};

const initialState: CartState = {
  cartId: null,
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    setCartId(state, action: PayloadAction<string>) {
      state.cartId = action.payload;
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
      state.cartId = null;
    },
  },
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart, setCartItems, setCartId } = cartSlice.actions;
export default cartSlice.reducer;
