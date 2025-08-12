import { create } from 'zustand';
import { GlobalState } from '@/types';

export const useGlobalStore = create<GlobalState>((set) => ({
  product: null,
  userData: null,
  wsRoomId: null,
  paymentMethod: null,
  
  setProduct: (product) => set({ product }),
  setUserData: (userData) => set({ userData }),
  setWsRoomId: (wsRoomId) => set({ wsRoomId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  
  reset: () => set({
    product: null,
    userData: null,
    wsRoomId: null,
    paymentMethod: null,
  }),
})); 