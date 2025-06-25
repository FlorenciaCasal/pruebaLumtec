import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart/cartSlice';
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
