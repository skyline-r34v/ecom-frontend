import { create } from "zustand";

const useCartStore = create((set, get) => ({
  products: [],

  addToCart: (product) =>
    set((state) => {

      const pickingAddress =
        product?.productDetail?.pickUpaddresses ||
        product?.detail?.pickUpaddresses ||
        null;

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
        products: [
          ...state.products,
          {
            ...product,
            quantity: 1,
            pickingAddress, // ✅ store pickup address
          },
        ],
      };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      products: state.products.filter((item) => item._id !== id),
    })),

  updateQuantity: (id, qty) =>
    set((state) => ({
      products: state.products.map((item) =>
        item._id === id ? { ...item, quantity: qty } : item
      ),
    })),

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