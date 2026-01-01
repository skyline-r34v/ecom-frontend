import { create } from "zustand";

const useCartStore = create((set, get) => ({
  products: [],

  addToCart: (product) =>
    set((state) => {
      const exists = state.products.find(
        (item) => item._id === product._id
      );

      if (exists) {
        return {
          products: state.products.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        products: [...state.products, { ...product, quantity: 1 }],
      };
    }),

  clearCart: () => set({ products: [] }),

  totalPrice: () =>
    get().products.reduce(
      (sum, item) =>
        sum +
        (item.discountPrice ?? item.price) * item.quantity,
      0
    ),
}));

export default useCartStore;
