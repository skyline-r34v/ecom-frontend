import { create } from "zustand";

const useAppStore = create((set) => ({
  appMode: "SHOP", // "SHOP" or "FOOD"
  setAppMode: (mode) => set({ appMode: mode }),
}));

export default useAppStore;
