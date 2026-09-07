import { create } from "zustand";
import api from "../../api";

const useCartStore = create((set, get) => ({
  // ─── Navbar flat products (for cart count badge) ───
  products: [],

  // ─── Full raw items from backend (for Cart page) ───
  cartItems: [],

  // ─── Sync cartItems + products from backend response ───
  // Pass in res.data.cart (the cart object with .items array)
  syncCart: (cart) => {
    const items = cart?.items || [];
    set({
      cartItems: items,
      products: items.map((item) => ({
        _id: item.product._id,
        title: item.product.title,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        images: item.product.images,
        thumbnail: item.product.thumbnail,
        quantity: item.quantity,
        pickingAddress: item.productDetail?.pickUpaddresses,
      })),
    });
  },

  // ─── Fetch cart from backend & sync ───
  fetchCart: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined" || token === "null") return;
      const res = await api.post("/users/cart", {});
      if (res.data?.success) {
        get().syncCart(res.data.cart);
      }
    } catch (err) {
      console.error("fetchCart error:", err);
    }
  },

  // ─── Legacy: setCart from Navbar (items array) ───
  setCart: (items) => {
    if (!Array.isArray(items)) return;
    set({
      products: items.map((item) => ({
        _id: item.product._id,
        title: item.product.title,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        images: item.product.images,
        thumbnail: item.product.thumbnail,
        quantity: item.quantity,
        pickingAddress: item.productDetail?.pickUpaddresses,
      })),
    });
  },

  clearCart: () => set({ products: [], cartItems: [] }),

  // ─── Computed ───
  cartCount: () =>
    get().products.reduce((sum, item) => sum + (item.quantity || 0), 0),

  totalPrice: () =>
    get().products.reduce(
      (sum, item) => sum + (item.discountPrice ?? item.price ?? 0) * item.quantity,
      0
    ),
}));

export default useCartStore;