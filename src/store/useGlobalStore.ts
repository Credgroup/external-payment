import { create } from 'zustand';
import { GlobalState } from '@/types';

export const useGlobalStore = create<GlobalState>((set) => ({
  productAndUserData: null,
  wsRoomId: null,
  paymentMethod: null,
  
  setProductAndUserData: (productAndUserData) => set({ productAndUserData }),
  setWsRoomId: (wsRoomId) => set({ wsRoomId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  
  reset: () => set({
    productAndUserData: null,
    wsRoomId: null,
    paymentMethod: null,
  }),
})); 