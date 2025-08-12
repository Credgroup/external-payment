import { create } from 'zustand';
import { GlobalState, Product, UserData, PaymentMethod } from '@/types';

export const useGlobalStore = create<GlobalState>((set) => ({
  product: null,
  userData: null,
  wsRoomId: null,
  paymentMethod: null,
  
  setProduct: (product: Product) => set({ product }),
  setUserData: (userData: UserData) => set({ userData }),
  setWsRoomId: (wsRoomId: string) => set({ wsRoomId }),
  setPaymentMethod: (paymentMethod: PaymentMethod) => set({ paymentMethod }),
  
  reset: () => set({
    product: null,
    userData: null,
    wsRoomId: null,
    paymentMethod: null,
  }),
})); 