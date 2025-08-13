import { create } from 'zustand';
import { GlobalState, UserDataAndProductData } from '@/types';

export const useGlobalStore = create<GlobalState>((set) => ({
  productAndUserData: getProductAndUserDataFromLocalStorage(),
  wsRoomId: null,
  paymentMethod: null,
  
  setProductAndUserData: (productAndUserData) => {
    setProductAndUserDataToLocalStorage(productAndUserData);
    set({ productAndUserData })
  },
  setWsRoomId: (wsRoomId) => set({ wsRoomId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  
  reset: () => set({
    productAndUserData: null,
    wsRoomId: null,
    paymentMethod: null,
  }),
})); 

function getProductAndUserDataFromLocalStorage(){
  const productAndUserData = localStorage.getItem('cDfAppTIon');
  if(productAndUserData){
    return JSON.parse(productAndUserData);
  }
  return null;
}

function setProductAndUserDataToLocalStorage(productAndUserData: UserDataAndProductData | null){
  if(productAndUserData){
    localStorage.setItem('cDfAppTIon', JSON.stringify(productAndUserData));
  }else{
    localStorage.removeItem('cDfAppTIon');
  }
}