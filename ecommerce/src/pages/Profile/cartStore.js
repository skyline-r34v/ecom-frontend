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

  // ─── Add any item (dish or product) directly to store ───
  addItem: (item, qty = 1) => {
    const currentProducts = get().products;
    const currentCartItems = get().cartItems;
    const itemId = item._id || item.id;
    const existingIndex = currentProducts.findIndex((p) => p._id === itemId);

    let updatedProducts;
    let updatedCartItems;

    if (existingIndex > -1) {
      updatedProducts = currentProducts.map((p, idx) =>
        idx === existingIndex ? { ...p, quantity: (p.quantity || 1) + qty } : p
      );
      updatedCartItems = currentCartItems.map((ci, idx) =>
        idx === existingIndex ? { ...ci, quantity: (ci.quantity || 1) + qty } : ci
      );
    } else {
      const formattedProduct = {
        _id: itemId,
        title: item.title || item.name,
        price: item.price,
        discountPrice: item.discountPrice ?? item.price,
        images: item.img ? [item.img] : item.images || [],
        thumbnail: item.img || item.thumbnail,
        quantity: qty,
        restaurant: item.rest || item.restaurant || null,
        isFood: !!item.categoryId || !!item.restaurantId,
      };
      updatedProducts = [...currentProducts, formattedProduct];
      updatedCartItems = [
        ...currentCartItems,
        {
          _id: itemId,
          product: formattedProduct,
          quantity: qty,
        },
      ];
    }

    set({ products: updatedProducts, cartItems: updatedCartItems });
  },

  // ─── Update item quantity ───
  updateQuantity: (itemId, change) => {
    const currentProducts = get().products;
    const currentCartItems = get().cartItems;

    const updatedProducts = currentProducts
      .map((p) => (p._id === itemId ? { ...p, quantity: (p.quantity || 1) + change } : p))
      .filter((p) => (p.quantity || 0) > 0);

    const updatedCartItems = currentCartItems
      .map((ci) => {
        const pId = ci.product?._id || ci._id;
        return pId === itemId ? { ...ci, quantity: (ci.quantity || 1) + change } : ci;
      })
      .filter((ci) => (ci.quantity || 0) > 0);

    set({ products: updatedProducts, cartItems: updatedCartItems });
  },

  // ─── Remove single item ───
  removeItem: (itemId) => {
    const updatedProducts = get().products.filter((p) => p._id !== itemId);
    const updatedCartItems = get().cartItems.filter(
      (ci) => (ci.product?._id || ci._id) !== itemId
    );
    set({ products: updatedProducts, cartItems: updatedCartItems });
  },

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