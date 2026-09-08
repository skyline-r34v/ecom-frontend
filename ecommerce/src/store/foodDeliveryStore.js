import { create } from "zustand";

// Realistic coordinates in Mumbai region for accurate distance/mapping simulation
export const LOCATIONS = {
  BANDRA: { lat: 19.0596, lng: 72.8295, label: "Bandra West, Mumbai" },
  ANDHERI: { lat: 19.1136, lng: 72.8697, label: "Andheri East, Mumbai" },
  JUHU: { lat: 19.1075, lng: 72.8263, label: "Juhu, Mumbai" },
  POWAI: { lat: 19.1176, lng: 72.9060, label: "Powai, Mumbai" },
  MALAD: { lat: 19.1860, lng: 72.8485, label: "Malad West, Mumbai" },
  BKC: { lat: 19.0662, lng: 72.8672, label: "BKC, Mumbai" },
  LOWER_PAREL: { lat: 19.0006, lng: 72.8302, label: "Lower Parel, Mumbai" },
  COLABA: { lat: 18.9067, lng: 72.8147, label: "Colaba, Mumbai" }
};

export const INITIAL_RESTAURANTS = [
  {
    id: "rest-1",
    name: "Pizza Palace",
    tagline: "Authentic Woodfired Pizzas & Pastas",
    cuisine: "Italian • Pizza • Fast Food",
    rating: 4.8,
    reviewCount: 1240,
    prepTime: "25–30 min",
    deliveryFee: 35,
    minOrder: 199,
    address: "123 Linking Road, Bandra West, Mumbai",
    lat: 19.0596,
    lng: 72.8295,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
    offer: "50% OFF up to ₹100",
    isPureVeg: false,
    isOpen: true,
    categories: ["Pizzas", "Pastas", "Sides", "Beverages"],
    items: [
      {
        id: "item-101",
        name: "Margherita Supreme Pizza",
        desc: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil",
        price: 349,
        originalPrice: 420,
        category: "Pizzas",
        isVeg: true,
        isBestseller: true,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600"
      },
      {
        id: "item-102",
        name: "Pepperoni & Cheese Feast",
        desc: "Loaded with smoky pepperoni, mozzarella, parmesan and oregano",
        price: 499,
        originalPrice: 599,
        category: "Pizzas",
        isVeg: false,
        isBestseller: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600"
      },
      {
        id: "item-103",
        name: "Creamy Truffle Penne Pasta",
        desc: "Penne pasta in rich wild mushroom and truffle cream sauce with parmesan",
        price: 389,
        category: "Pastas",
        isVeg: true,
        isBestseller: false,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?q=80&w=600"
      },
      {
        id: "item-104",
        name: "Cheesy Garlic Dough Balls",
        desc: "Golden baked dough balls stuffed with herbs and melting garlic butter",
        price: 199,
        category: "Sides",
        isVeg: true,
        isBestseller: true,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=600"
      },
      {
        id: "item-105",
        name: "Classic Italian Tiramisu",
        desc: "Espresso soaked ladyfingers layered with mascarpone cream & cocoa",
        price: 249,
        category: "Beverages",
        isVeg: true,
        isBestseller: false,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600"
      }
    ]
  },
  {
    id: "rest-2",
    name: "Burger Haven & Grill",
    tagline: "Smashed Patties & Loaded Gourmet Fries",
    cuisine: "American • Burgers • Shakes",
    rating: 4.7,
    reviewCount: 980,
    prepTime: "20–25 min",
    deliveryFee: 25,
    minOrder: 150,
    address: "45 Juhu Tara Road, Juhu, Mumbai",
    lat: 19.1075,
    lng: 72.8263,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
    offer: "BUY 1 GET 1 ON SHAKES",
    isPureVeg: false,
    isOpen: true,
    categories: ["Gourmet Burgers", "Loaded Fries", "Milkshakes", "Desserts"],
    items: [
      {
        id: "item-201",
        name: "Smoky BBQ Bacon Cheeseburger",
        desc: "Double smashed tender patty, smoked bacon, aged cheddar, caramelised onions, brioche",
        price: 369,
        originalPrice: 420,
        category: "Gourmet Burgers",
        isVeg: false,
        isBestseller: true,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600"
      },
      {
        id: "item-202",
        name: "Crispy Paneer Makhani Burger",
        desc: "Crispy panko spiced cottage cheese steak with rich butter makhani aioli",
        price: 289,
        category: "Gourmet Burgers",
        isVeg: true,
        isBestseller: true,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600"
      },
      {
        id: "item-203",
        name: "Peri-Peri Cheesy Fries",
        desc: "Hand-cut french fries tossed in African peri peri seasoning with melted cheddar",
        price: 189,
        category: "Loaded Fries",
        isVeg: true,
        isBestseller: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=600"
      },
      {
        id: "item-204",
        name: "Dark Belgian Chocolate Shake",
        desc: "Thick hand-spun milkshake with premium 70% dark Belgian chocolate and whipped cream",
        price: 219,
        category: "Milkshakes",
        isVeg: true,
        isBestseller: false,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"
      }
    ]
  },
  {
    id: "rest-3",
    name: "Royal Biryani Darbar",
    tagline: "Dum Handi Biryanis & Nawabi Kebabs",
    cuisine: "Hyderabadi • Mughlai • Biryani",
    rating: 4.9,
    reviewCount: 2310,
    prepTime: "30–35 min",
    deliveryFee: 40,
    minOrder: 250,
    address: "78 Central Avenue, BKC, Mumbai",
    lat: 19.0662,
    lng: 72.8672,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800",
    offer: "FLAT ₹125 OFF",
    isPureVeg: false,
    isOpen: true,
    categories: ["Biryanis", "Kebabs", "Curries", "Breads & Desserts"],
    items: [
      {
        id: "item-301",
        name: "Hyderabadi Dum Chicken Biryani",
        desc: "Fragrant long grain basmati rice slow-cooked with tender marinated chicken & saffron",
        price: 399,
        originalPrice: 480,
        category: "Biryanis",
        isVeg: false,
        isBestseller: true,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600"
      },
      {
        id: "item-302",
        name: "Nizami Paneer Tikka Biryani",
        desc: "Chargrilled malai paneer cubes layered with aromatic spiced basmati rice and fried onions",
        price: 349,
        category: "Biryanis",
        isVeg: true,
        isBestseller: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?q=80&w=600"
      },
      {
        id: "item-303",
        name: "Galouti Kebab Melt (4 pcs)",
        desc: "Melt in mouth minced spiced kebabs served with mint chutney and ulte tawa ka paratha",
        price: 379,
        category: "Kebabs",
        isVeg: false,
        isBestseller: false,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=600"
      },
      {
        id: "item-304",
        name: "Shahi Phirni in Clay Pot",
        desc: "Slow reduced creamy ground rice pudding infused with saffron, cardamom & pistachios",
        price: 169,
        category: "Breads & Desserts",
        isVeg: true,
        isBestseller: false,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"
      }
    ]
  },
  {
    id: "rest-4",
    name: "Tokyo Sushi & Ramen House",
    tagline: "Handcrafted Sushi, Dumplings & Ramen",
    cuisine: "Japanese • Asian • Sushi",
    rating: 4.8,
    reviewCount: 650,
    prepTime: "30–40 min",
    deliveryFee: 50,
    minOrder: 300,
    address: "14 Hiranandani Gardens, Powai, Mumbai",
    lat: 19.1176,
    lng: 72.9060,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800",
    offer: "20% OFF ABOVE ₹500",
    isPureVeg: false,
    isOpen: true,
    categories: ["Sushi Rolls", "Ramen Bowls", "Dim Sums", "Boba Tea"],
    items: [
      {
        id: "item-401",
        name: "Salmon Avocado Crunch Roll (8 pcs)",
        desc: "Fresh Atlantic salmon, ripe avocado, spicy mayo, topped with crispy tanuki flakes",
        price: 580,
        category: "Sushi Rolls",
        isVeg: false,
        isBestseller: true,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=600"
      },
      {
        id: "item-402",
        name: "Rich Tonkotsu Ramen",
        desc: "24-hr rich broth, springy ramen noodles, chashu slices, ajitsuke egg, nori & spring onions",
        price: 490,
        category: "Ramen Bowls",
        isVeg: false,
        isBestseller: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600"
      },
      {
        id: "item-403",
        name: "Edamame & Truffle Dim Sum (6 pcs)",
        desc: "Translucent steamed crystal dumplings stuffed with sweet edamame and black truffle oil",
        price: 390,
        category: "Dim Sums",
        isVeg: true,
        isBestseller: false,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600"
      }
    ]
  },
  {
    id: "rest-5",
    name: "Green Bowl & Salad Co.",
    tagline: "Organic Superfood Bowls, Wraps & Cold Pressed Juices",
    cuisine: "Healthy • Salads • Continental",
    rating: 4.6,
    reviewCount: 420,
    prepTime: "15–20 min",
    deliveryFee: 20,
    minOrder: 150,
    address: "22 Senapati Bapat Marg, Lower Parel, Mumbai",
    lat: 19.0006,
    lng: 72.8302,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800",
    offer: "FREE DETOX DRINK",
    isPureVeg: true,
    isOpen: true,
    categories: ["Warm Protein Bowls", "Fresh Salads", "Wraps", "Cold Pressed Juices"],
    items: [
      {
        id: "item-501",
        name: "Mediterranean Quinoa Falafel Bowl",
        desc: "Herb quinoa, golden baked falafels, beet hummus, kalamata olives, cucumber tahini dressing",
        price: 320,
        category: "Warm Protein Bowls",
        isVeg: true,
        isBestseller: true,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600"
      },
      {
        id: "item-502",
        name: "Avocado Burrata Crunch Salad",
        desc: "Fresh burrata cheese, Hass avocado, heirloom cherry tomatoes, baby rocket leaves, balsamic glaze",
        price: 380,
        category: "Fresh Salads",
        isVeg: true,
        isBestseller: true,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600"
      }
    ]
  }
];

export const INITIAL_DRIVERS = [
  {
    id: "driver-1",
    name: "Amit Sharma",
    phone: "+91 98201 44521",
    email: "amit.rider@foodie.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
    vehicleType: "Motorcycle (Hero Splendor)",
    vehicleNumber: "MH-02-EE-4921",
    rating: 4.9,
    totalDeliveries: 428,
    todayDeliveries: 12,
    todayEarnings: 1050,
    weekEarnings: 7420,
    monthEarnings: 28900,
    walletBalance: 3250,
    status: "ONLINE", // ONLINE, OFFLINE, BUSY, ON_DELIVERY
    lat: 19.0620,
    lng: 72.8350,
    currentOrderId: null,
    isVerified: true,
    joinedDate: "Jan 2024"
  },
  {
    id: "driver-2",
    name: "Rahul Verma",
    phone: "+91 98334 11209",
    email: "rahul.rider@foodie.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
    vehicleType: "Electric Scooter (Ather 450X)",
    vehicleNumber: "MH-01-CV-7814",
    rating: 4.8,
    totalDeliveries: 312,
    todayDeliveries: 8,
    todayEarnings: 720,
    weekEarnings: 5900,
    monthEarnings: 24100,
    walletBalance: 1890,
    status: "ONLINE",
    lat: 19.0680,
    lng: 72.8420,
    currentOrderId: null,
    isVerified: true,
    joinedDate: "Mar 2024"
  },
  {
    id: "driver-3",
    name: "Vikas Patil",
    phone: "+91 97654 99012",
    email: "vikas.rider@foodie.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
    vehicleType: "Scooter (Honda Activa 6G)",
    vehicleNumber: "MH-03-BW-3310",
    rating: 4.7,
    totalDeliveries: 185,
    todayDeliveries: 5,
    todayEarnings: 450,
    weekEarnings: 4200,
    monthEarnings: 18500,
    walletBalance: 980,
    status: "ONLINE",
    lat: 19.1100,
    lng: 72.8710,
    currentOrderId: null,
    isVerified: true,
    joinedDate: "Jun 2024"
  },
  {
    id: "driver-4",
    name: "Suresh Kamble",
    phone: "+91 99200 88712",
    email: "suresh.rider@foodie.com",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300",
    vehicleType: "Motorcycle (Bajaj Pulsar 150)",
    vehicleNumber: "MH-04-AX-9023",
    rating: 4.9,
    totalDeliveries: 560,
    todayDeliveries: 15,
    todayEarnings: 1320,
    weekEarnings: 9100,
    monthEarnings: 34500,
    walletBalance: 4600,
    status: "OFFLINE",
    lat: 19.1860,
    lng: 72.8485,
    currentOrderId: null,
    isVerified: true,
    joinedDate: "Nov 2023"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-9410",
    restaurantId: "rest-1",
    restaurantName: "Pizza Palace",
    restaurantAddress: "123 Linking Road, Bandra West, Mumbai",
    restaurantLat: 19.0596,
    restaurantLng: 72.8295,
    customerName: "Priya Nair",
    customerPhone: "+91 98192 33411",
    deliveryAddress: "Flat 402, Sea View Apartments, Carter Road, Bandra West, Mumbai",
    customerLat: 19.0689,
    customerLng: 72.8210,
    items: [
      { id: "item-101", name: "Margherita Supreme Pizza", quantity: 2, price: 349 },
      { id: "item-104", name: "Cheesy Garlic Dough Balls", quantity: 1, price: 199 }
    ],
    itemTotal: 897,
    taxes: 45,
    deliveryFee: 35,
    discount: 100,
    grandTotal: 877,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    pickupOTP: "4821",
    deliveryOTP: "7294",
    deliveryPartnerId: "driver-1",
    driverName: "Amit Sharma",
    driverPhone: "+91 98201 44521",
    driverEarnings: 85,
    distanceKm: 2.4,
    timeline: [
      { status: "PLACED", time: "3 hours ago", label: "Order Placed" },
      { status: "RESTAURANT_ACCEPTED", time: "2.8 hours ago", label: "Restaurant Accepted" },
      { status: "FOOD_PREPARING", time: "2.5 hours ago", label: "Food Being Prepared" },
      { status: "READY_FOR_PICKUP", time: "2.2 hours ago", label: "Food Ready" },
      { status: "PICKED_UP", time: "2.0 hours ago", label: "Picked Up by Amit" },
      { status: "DELIVERED", time: "1.7 hours ago", label: "Delivered Successfully" }
    ],
    rating: {
      restaurantStars: 5,
      driverStars: 5,
      feedback: "Arrived piping hot! Amit was very polite."
    }
  }
];

export const COUPONS = [
  { code: "WELCOME50", discountPercent: 50, maxDiscount: 100, minOrder: 199, desc: "50% OFF up to ₹100 for all food orders" },
  { code: "FREEDEL", discountFixed: 35, minOrder: 149, desc: "FREE Delivery on orders above ₹149" },
  { code: "PIZZA20", discountPercent: 20, maxDiscount: 150, minOrder: 399, desc: "20% OFF up to ₹150 on Pizza and Meals" },
  { code: "TASTY10", discountPercent: 10, maxDiscount: 50, minOrder: 99, desc: "10% OFF on all favorites" }
];

// Helper to compute distance (Haversine formula in Km)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.2;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

// Generate random 4-digit OTP
export function generate4DigitOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Sound synthesizer helper for alerts (chime when new order arrives or OTP verified)
export function playChime(type = "order") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "order") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "alert") {
      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(350, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // audio context might be blocked if user hasn't interacted yet
  }
}

// Load initial state from LocalStorage if available
const STORAGE_KEY = "onekart_food_delivery_state_v2";

const loadPersistedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load food delivery store:", e);
  }
  return null;
};

const persisted = loadPersistedState();

export const useFoodDeliveryStore = create((set, get) => ({
  // Core Data
  restaurants: persisted?.restaurants || INITIAL_RESTAURANTS,
  drivers: persisted?.drivers || INITIAL_DRIVERS,
  orders: persisted?.orders || INITIAL_ORDERS,
  activeRole: persisted?.activeRole || "CUSTOMER", // "CUSTOMER", "RESTAURANT", "DRIVER", "ADMIN"
  selectedRestaurantId: persisted?.selectedRestaurantId || "rest-1",
  selectedDriverId: persisted?.selectedDriverId || "driver-1",
  
  authenticatedRestaurantId: persisted?.authenticatedRestaurantId !== undefined ? persisted.authenticatedRestaurantId : "rest-1", // null when logged out

  // Customer Cart & Favorites
  foodCart: persisted?.foodCart || {
    restaurantId: null,
    restaurantName: "",
    items: [],
    appliedCoupon: null
  },
  isFoodCartDrawerOpen: false,
  favoriteRestaurantIds: persisted?.favoriteRestaurantIds || ["rest-1", "rest-2"],

  // Driver Request Queue for auto-dispatch simulation
  activeDriverRequests: persisted?.activeDriverRequests || {}, // { [orderId]: { driverId, expiresAt, candidateQueue: [] } }

  // Driver Simulated GPS Telemetry (live lat, lng, speed, heading for active orders)
  driverTelemetry: persisted?.driverTelemetry || {}, // { [orderId]: { lat, lng, progress: 0..100, step: 'TO_RESTAURANT' | 'TO_CUSTOMER' } }

  // Notifications Log
  notifications: persisted?.notifications || [
    {
      id: "notif-1",
      role: "CUSTOMER",
      title: "Welcome to Food Delivery!",
      message: "Order gourmet pizzas, burgers & biryanis with real-time live map tracking.",
      time: "Just now",
      read: false
    }
  ],

  // Withdrawal Requests
  withdrawals: persisted?.withdrawals || [
    {
      id: "WTH-101",
      driverId: "driver-1",
      driverName: "Amit Sharma",
      amount: 1500,
      upiId: "amit@okhdfcbank",
      status: "COMPLETED",
      date: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
    }
  ],

  // ================= ACTIONS =================

  saveState: () => {
    try {
      const state = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          restaurants: state.restaurants,
          drivers: state.drivers,
          orders: state.orders,
          activeRole: state.activeRole,
          selectedRestaurantId: state.selectedRestaurantId,
          authenticatedRestaurantId: state.authenticatedRestaurantId,
          selectedDriverId: state.selectedDriverId,
          foodCart: state.foodCart,
          favoriteRestaurantIds: state.favoriteRestaurantIds,
          activeDriverRequests: state.activeDriverRequests,
          driverTelemetry: state.driverTelemetry,
          notifications: state.notifications,
          withdrawals: state.withdrawals
        })
      );
    } catch (e) {
      console.error("Save state error:", e);
    }
  },

  setActiveRole: (role) => {
    set({ activeRole: role });
    get().saveState();
  },

  toggleFavoriteRestaurant: (restaurantId) => {
    const { favoriteRestaurantIds = [] } = get();
    const isFav = favoriteRestaurantIds.includes(restaurantId);
    const nextFavs = isFav
      ? favoriteRestaurantIds.filter((id) => id !== restaurantId)
      : [...favoriteRestaurantIds, restaurantId];
    
    set({ favoriteRestaurantIds: nextFavs });
    get().saveState();
    playChime("tap");
  },

  setSelectedRestaurant: (restId) => {
    set({ selectedRestaurantId: restId, authenticatedRestaurantId: restId });
    get().saveState();
  },

  restaurantLogin: (restId) => {
    set({ authenticatedRestaurantId: restId, selectedRestaurantId: restId, activeRole: "RESTAURANT" });
    get().saveState();
    playChime("success");
  },

  restaurantLogout: () => {
    set({ authenticatedRestaurantId: null });
    get().saveState();
  },

  setSelectedDriver: (driverId) => {
    set({ selectedDriverId: driverId });
    get().saveState();
  },

  openFoodCartDrawer: () => {
    set({ isFoodCartDrawerOpen: true });
  },

  closeFoodCartDrawer: () => {
    set({ isFoodCartDrawerOpen: false });
  },

  toggleFoodCartDrawer: () => {
    set((state) => ({ isFoodCartDrawerOpen: !state.isFoodCartDrawerOpen }));
  },

  // ----------------- CART ACTIONS -----------------
  addToFoodCart: (restaurant, item, qty = 1) => {
    const { foodCart } = get();
    // If different restaurant, start fresh cart for the new restaurant
    let currentItems = [...(foodCart?.items || [])];
    if (foodCart?.restaurantId && foodCart.restaurantId !== restaurant.id) {
      currentItems = [];
    }

    const itemCartKey = item.customizations
      ? `${item.id}-${item.customizations.size || "reg"}-${(item.customizations.addons || []).join("-")}`
      : item.id;

    const existingIndex = currentItems.findIndex((i) => i.id === itemCartKey || i.cartKey === itemCartKey);
    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += qty;
    } else {
      currentItems.push({
        id: itemCartKey,
        originalId: item.id,
        cartKey: itemCartKey,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: Boolean(item.isVeg),
        size: item.customizations?.size || item.size || null,
        addOns: item.customizations?.addons || item.addOns || null,
        notes: item.customizations?.notes || item.notes || null,
        quantity: qty
      });
    }

    set({
      foodCart: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        restaurantLat: restaurant.lat,
        restaurantLng: restaurant.lng,
        deliveryFee: restaurant.deliveryFee || 35,
        items: currentItems,
        appliedCoupon: foodCart?.appliedCoupon || null
      }
    });
    get().saveState();
    playChime("alert");
  },

  updateCartItemQty: (itemId, delta) => {
    const { foodCart } = get();
    let currentItems = (foodCart?.items || [])
      .map((item) => {
        if (item.id === itemId || item.cartKey === itemId || item.originalId === itemId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    set({
      foodCart: {
        ...foodCart,
        items: currentItems,
        ...(currentItems.length === 0 ? { restaurantId: null, restaurantName: "", appliedCoupon: null } : {})
      }
    });
    get().saveState();
  },

  applyCoupon: (couponCode) => {
    const coupon = COUPONS.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) return { success: false, message: "Invalid coupon code" };

    const { foodCart } = get();
    const itemTotal = foodCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (itemTotal < coupon.minOrder) {
      return { success: false, message: `Minimum order amount of ₹${coupon.minOrder} required for ${coupon.code}` };
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = Math.min(coupon.maxDiscount || Infinity, Math.round((itemTotal * coupon.discountPercent) / 100));
    } else if (coupon.discountFixed) {
      discount = coupon.discountFixed;
    }

    set({
      foodCart: {
        ...foodCart,
        appliedCoupon: { ...coupon, calculatedDiscount: discount }
      }
    });
    get().saveState();
    return { success: true, message: `Coupon ${coupon.code} applied! You saved ₹${discount}` };
  },

  removeCoupon: () => {
    const { foodCart } = get();
    set({ foodCart: { ...foodCart, appliedCoupon: null } });
    get().saveState();
  },

  clearFoodCart: () => {
    set({
      foodCart: {
        restaurantId: null,
        restaurantName: "",
        items: [],
        appliedCoupon: null
      }
    });
    get().saveState();
  },

  // ----------------- CUSTOMER ORDER PLACEMENT -----------------
  placeFoodOrder: (checkoutData) => {
    const { foodCart, restaurants, orders, notifications } = get();
    if (!foodCart.items.length) return null;

    const rest = restaurants.find((r) => r.id === foodCart.restaurantId);
    const itemTotal = foodCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = rest?.deliveryFee || 35;
    const taxes = Math.round(itemTotal * 0.05); // 5% GST
    const discount = foodCart.appliedCoupon ? foodCart.appliedCoupon.calculatedDiscount : 0;
    const driverTip = Number(checkoutData.driverTip) || 0;
    const grandTotal = Math.max(0, itemTotal + deliveryFee + taxes + driverTip - discount);

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const pickupOTP = generate4DigitOTP();
    const deliveryOTP = generate4DigitOTP();

    // Default customer location if not provided
    const customerLat = checkoutData.customerLat || 19.0689;
    const customerLng = checkoutData.customerLng || 72.8210;
    const distanceKm = calculateDistanceKm(rest.lat, rest.lng, customerLat, customerLng);
    const estimatedDriverEarnings = Math.round(35 + distanceKm * 15) + driverTip;

    const newOrder = {
      id: orderId,
      restaurantId: rest.id,
      restaurantName: rest.name,
      restaurantAddress: rest.address,
      restaurantLat: rest.lat,
      restaurantLng: rest.lng,
      customerName: checkoutData.customerName || "Rahul Sharma",
      customerPhone: checkoutData.customerPhone || "+91 98200 12345",
      deliveryAddress: checkoutData.deliveryAddress || "456 MG Road, Bandra West, Mumbai",
      customerLat,
      customerLng,
      items: foodCart.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        isVeg: i.isVeg,
        image: i.image,
        customizations: i.customizations || null,
        notes: i.notes || null
      })),
      itemTotal,
      taxes,
      deliveryFee,
      discount,
      driverTip,
      deliveryInstructions: checkoutData.deliveryInstructions || [],
      cookingInstructions: checkoutData.cookingInstructions || "",
      grandTotal,
      paymentMethod: checkoutData.paymentMethod || "UPI",
      paymentStatus: checkoutData.paymentMethod === "COD" ? "PENDING" : "PAID",
      orderStatus: "PLACED", // Initial state
      createdAt: new Date().toISOString(),
      prepTimeEst: rest.prepTime || "25 min",
      pickupOTP,
      deliveryOTP,
      deliveryPartnerId: null,
      driverName: null,
      driverPhone: null,
      driverAvatar: null,
      driverVehicle: null,
      driverVehicleNum: null,
      driverRating: null,
      driverEarnings: estimatedDriverEarnings,
      distanceKm,
      timeline: [
        { status: "PLACED", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), label: "Order Placed" }
      ],
      rating: null
    };

    const updatedOrders = [newOrder, ...orders];
    const newNotifications = [
      {
        id: `notif-${Date.now()}`,
        role: "RESTAURANT",
        orderId,
        title: `🔔 New Order #${orderId}`,
        message: `${newOrder.customerName} ordered ${newOrder.items.length} items (₹${grandTotal}).`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      orders: updatedOrders,
      notifications: newNotifications
    });

    get().clearFoodCart();
    get().saveState();
    playChime("order");

    return newOrder;
  },

  // ----------------- RESTAURANT WORKFLOW -----------------
  restaurantAcceptOrder: (orderId, prepTimeMinutes = 20) => {
    const { orders, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "RESTAURANT_ACCEPTED",
          prepTimeEst: `${prepTimeMinutes} mins`,
          timeline: [
            ...o.timeline,
            { status: "RESTAURANT_ACCEPTED", time: timeStr, label: `Accepted (Prep ~${prepTimeMinutes}m)` }
          ]
        };
      }
      return o;
    });

    const newNotifications = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "👨‍🍳 Restaurant Accepted Your Order",
        message: `${order.restaurantName} is preparing your delicious meal (~${prepTimeMinutes} mins).`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ orders: updatedOrders, notifications: newNotifications });
    get().saveState();
    playChime("success");
  },

  restaurantRejectOrder: (orderId, reason = "Kitchen overloaded") => {
    const { orders, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "RESTAURANT_REJECTED",
          rejectReason: reason,
          timeline: [...o.timeline, { status: "RESTAURANT_REJECTED", time: timeStr, label: `Rejected: ${reason}` }]
        };
      }
      return o;
    });

    const newNotifications = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "❌ Order Rejected by Restaurant",
        message: `${order.restaurantName} could not fulfill your order. Reason: ${reason}.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ orders: updatedOrders, notifications: newNotifications });
    get().saveState();
    playChime("alert");
  },

  restaurantStartPreparing: (orderId) => {
    const { orders, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "FOOD_PREPARING",
          timeline: [...o.timeline, { status: "FOOD_PREPARING", time: timeStr, label: "Food Being Prepared" }]
        };
      }
      return o;
    });

    const newNotifications = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "🍳 Food Cooking in Kitchen",
        message: `Your food is on the grill at ${order.restaurantName}!`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ orders: updatedOrders, notifications: newNotifications });
    get().saveState();
  },

  // When restaurant marks ready, it immediately triggers the driver assignment logic
  restaurantReadyForPickup: (orderId) => {
    const { orders, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "READY_FOR_PICKUP",
          timeline: [...o.timeline, { status: "READY_FOR_PICKUP", time: timeStr, label: "Food Ready for Pickup" }]
        };
      }
      return o;
    });

    const newNotifications = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "📦 Food is Packed & Ready!",
        message: "Searching for the closest delivery partner...",
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ orders: updatedOrders, notifications: newNotifications });
    get().saveState();
    playChime("order");

    // Automatically trigger proximity dispatch
    get().dispatchOrderToDrivers(orderId);
  },

  // ----------------- PROXIMITY DISPATCH & DRIVER REQUESTS -----------------
  dispatchOrderToDrivers: (orderId) => {
    const { orders, drivers, activeDriverRequests, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // 1. Find all ONLINE drivers who are not BUSY / ON_DELIVERY
    const availableDrivers = drivers.filter((d) => d.status === "ONLINE" && !d.currentOrderId);

    if (availableDrivers.length === 0) {
      // Notify Admin and Customer
      const notifs = [
        {
          id: `notif-${Date.now()}`,
          role: "ADMIN",
          orderId,
          title: "⚠️ High Demand / No Drivers Available",
          message: `Order #${orderId} needs manual assignment or driver wait.`,
          time: "Just now",
          read: false
        },
        ...notifications
      ];
      set({ notifications: notifs });
      get().saveState();
      return;
    }

    // 2. Sort available drivers by distance to the restaurant
    const sortedCandidates = availableDrivers
      .map((d) => ({
        driverId: d.id,
        driver: d,
        distToRest: calculateDistanceKm(d.lat, d.lng, order.restaurantLat, order.restaurantLng)
      }))
      .sort((a, b) => a.distToRest - b.distToRest);

    const firstCandidate = sortedCandidates[0];
    const candidateQueue = sortedCandidates.slice(1).map((c) => c.driverId);

    // 20 second countdown expiry
    const expiresAt = Date.now() + 20000;

    const updatedRequests = {
      ...activeDriverRequests,
      [orderId]: {
        orderId,
        driverId: firstCandidate.driverId,
        expiresAt,
        candidateQueue
      }
    };

    const newNotifications = [
      {
        id: `notif-${Date.now()}`,
        role: "DRIVER",
        driverId: firstCandidate.driverId,
        orderId,
        title: "🚀 New Delivery Request (₹" + order.driverEarnings + ")",
        message: `Pickup at ${order.restaurantName} • ${order.distanceKm} km trip. Accept within 20s.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      activeDriverRequests: updatedRequests,
      notifications: newNotifications
    });
    get().saveState();
    playChime("order");
  },

  // Driver Accept or Reject Request
  driverRespondRequest: (orderId, driverId, accepted) => {
    const { orders, drivers, activeDriverRequests, notifications } = get();
    const req = activeDriverRequests[orderId];
    const order = orders.find((o) => o.id === orderId);
    const driver = drivers.find((d) => d.id === driverId);

    if (!order || !driver) return;

    if (accepted) {
      // Clear request from queue
      const updatedRequests = { ...activeDriverRequests };
      delete updatedRequests[orderId];

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Mark driver as BUSY
      const updatedDrivers = drivers.map((d) => {
        if (d.id === driverId) {
          return { ...d, status: "BUSY", currentOrderId: orderId };
        }
        return d;
      });

      // Update Order
      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            orderStatus: "DELIVERY_PARTNER_ASSIGNED",
            deliveryPartnerId: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
            driverAvatar: driver.avatar,
            driverVehicle: driver.vehicleType,
            driverVehicleNum: driver.vehicleNumber,
            driverRating: driver.rating,
            timeline: [
              ...o.timeline,
              { status: "DELIVERY_PARTNER_ASSIGNED", time: timeStr, label: `Driver Assigned: ${driver.name}` }
            ]
          };
        }
        return o;
      });

      // Initialize simulated telemetry starting at driver location
      const updatedTelemetry = {
        ...get().driverTelemetry,
        [orderId]: {
          lat: driver.lat,
          lng: driver.lng,
          progress: 0,
          phase: "TO_RESTAURANT"
        }
      };

      const newNotifs = [
        {
          id: `notif-${Date.now()}`,
          role: "CUSTOMER",
          orderId,
          title: `🛵 Delivery Partner Assigned!`,
          message: `${driver.name} is on their way to pick up your order.`,
          time: "Just now",
          read: false
        },
        {
          id: `notif-${Date.now() + 1}`,
          role: "RESTAURANT",
          orderId,
          title: `🛵 Delivery Partner Assigned`,
          message: `${driver.name} (${driver.phone}) is arriving to pick up #${orderId}.`,
          time: "Just now",
          read: false
        },
        ...notifications
      ];

      set({
        activeDriverRequests: updatedRequests,
        drivers: updatedDrivers,
        orders: updatedOrders,
        driverTelemetry: updatedTelemetry,
        notifications: newNotifs
      });
      get().saveState();
      playChime("success");
    } else {
      // Driver Rejected or Expired -> Escalate to next candidate in queue
      if (req && req.candidateQueue && req.candidateQueue.length > 0) {
        const nextDriverId = req.candidateQueue[0];
        const nextQueue = req.candidateQueue.slice(1);

        const updatedRequests = {
          ...activeDriverRequests,
          [orderId]: {
            orderId,
            driverId: nextDriverId,
            expiresAt: Date.now() + 20000,
            candidateQueue: nextQueue
          }
        };

        const newNotifs = [
          {
            id: `notif-${Date.now()}`,
            role: "DRIVER",
            driverId: nextDriverId,
            orderId,
            title: `🚀 Delivery Request (₹${order.driverEarnings})`,
            message: `Pickup at ${order.restaurantName} • ${order.distanceKm} km trip. Accept within 20s.`,
            time: "Just now",
            read: false
          },
          ...notifications
        ];

        set({ activeDriverRequests: updatedRequests, notifications: newNotifs });
        get().saveState();
        playChime("order");
      } else {
        // No more candidates
        const updatedRequests = { ...activeDriverRequests };
        delete updatedRequests[orderId];

        const newNotifs = [
          {
            id: `notif-${Date.now()}`,
            role: "ADMIN",
            orderId,
            title: `⚠️ Driver Search Exhausted for #${orderId}`,
            message: "All nearby drivers declined or timed out. Please assign manually from Admin.",
            time: "Just now",
            read: false
          },
          ...notifications
        ];

        set({ activeDriverRequests: updatedRequests, notifications: newNotifs });
        get().saveState();
      }
    }
  },

  // ----------------- DRIVER TRANSIT & OTP VERIFICATION -----------------
  driverArrivedAtRestaurant: (orderId) => {
    const { orders, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "DRIVER_AT_RESTAURANT",
          timeline: [
            ...o.timeline,
            { status: "DRIVER_AT_RESTAURANT", time: timeStr, label: "Driver Arrived at Restaurant" }
          ]
        };
      }
      return o;
    });

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "RESTAURANT",
        orderId,
        title: `📍 Driver Arrived for #${orderId}`,
        message: `${order.driverName} is here. Provide Pickup OTP: ${order.pickupOTP}`,
        time: "Just now",
        read: false
      },
      {
        id: `notif-${Date.now() + 1}`,
        role: "CUSTOMER",
        orderId,
        title: `📍 Driver Reached Restaurant`,
        message: `${order.driverName} has reached ${order.restaurantName} to collect your food.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ orders: updatedOrders, notifications: newNotifs });
    get().saveState();
    playChime("alert");
  },

  // Verify Pickup OTP entered by driver
  verifyPickupOTP: (orderId, enteredOTP) => {
    const { orders, drivers, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.pickupOTP.trim() !== enteredOTP.trim()) {
      return { success: false, message: "Invalid pickup OTP! Please check with the restaurant." };
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "PICKED_UP",
          timeline: [
            ...o.timeline,
            { status: "PICKED_UP", time: timeStr, label: "Food Picked Up & Verified" }
          ]
        };
      }
      return o;
    });

    const updatedDrivers = drivers.map((d) => {
      if (d.id === order.deliveryPartnerId) {
        return { ...d, status: "ON_DELIVERY" };
      }
      return d;
    });

    const updatedTelemetry = {
      ...get().driverTelemetry,
      [orderId]: {
        lat: order.restaurantLat,
        lng: order.restaurantLng,
        progress: 0,
        phase: "TO_CUSTOMER"
      }
    };

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "🛵 Food Picked Up & On the Way!",
        message: `Your food has been picked up by ${order.driverName} and is en route.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      orders: updatedOrders,
      drivers: updatedDrivers,
      driverTelemetry: updatedTelemetry,
      notifications: newNotifs
    });
    get().saveState();
    playChime("success");
    return { success: true, message: "Pickup verified successfully! Drive safely to customer." };
  },

  driverArrivedAtCustomer: (orderId) => {
    const { orders, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "ARRIVED_AT_CUSTOMER",
          timeline: [
            ...o.timeline,
            { status: "ARRIVED_AT_CUSTOMER", time: timeStr, label: "Driver Arrived at Customer Doorstep" }
          ]
        };
      }
      return o;
    });

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "🔔 Your Delivery Partner Has Arrived!",
        message: `${order.driverName} is at your doorstep. Share Delivery OTP: ${order.deliveryOTP}`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ orders: updatedOrders, notifications: newNotifs });
    get().saveState();
    playChime("alert");
  },

  // Verify Delivery OTP entered by driver
  verifyDeliveryOTP: (orderId, enteredOTP) => {
    const { orders, drivers, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.deliveryOTP.trim() !== enteredOTP.trim()) {
      return { success: false, message: "Invalid delivery OTP! Please ask the customer for their 4-digit OTP." };
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const earningsCredited = order.driverEarnings || 85;

    // Update Order
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "DELIVERED",
          paymentStatus: "PAID",
          deliveredAt: new Date().toISOString(),
          timeline: [
            ...o.timeline,
            { status: "DELIVERED", time: timeStr, label: "Delivered & Verified Successfully" }
          ]
        };
      }
      return o;
    });

    // Update Driver balance & stats, set back to ONLINE
    const updatedDrivers = drivers.map((d) => {
      if (d.id === order.deliveryPartnerId) {
        return {
          ...d,
          status: "ONLINE",
          currentOrderId: null,
          todayDeliveries: (d.todayDeliveries || 0) + 1,
          totalDeliveries: (d.totalDeliveries || 0) + 1,
          todayEarnings: (d.todayEarnings || 0) + earningsCredited,
          weekEarnings: (d.weekEarnings || 0) + earningsCredited,
          monthEarnings: (d.monthEarnings || 0) + earningsCredited,
          walletBalance: (d.walletBalance || 0) + earningsCredited
        };
      }
      return d;
    });

    // Clean telemetry
    const updatedTelemetry = { ...get().driverTelemetry };
    delete updatedTelemetry[orderId];

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "🎉 Order Delivered Successfully!",
        message: "Enjoy your food! Please take a moment to rate your experience.",
        time: "Just now",
        read: false
      },
      {
        id: `notif-${Date.now() + 1}`,
        role: "DRIVER",
        driverId: order.deliveryPartnerId,
        orderId,
        title: `💰 ₹${earningsCredited} Credited to Wallet!`,
        message: `Trip #${orderId} completed. Great job!`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      orders: updatedOrders,
      drivers: updatedDrivers,
      driverTelemetry: updatedTelemetry,
      notifications: newNotifs
    });
    get().saveState();
    playChime("success");
    return { success: true, message: `Delivery completed! ₹${earningsCredited} added to your wallet.` };
  },

  // Customer submit rating
  submitOrderRating: (orderId, { restaurantStars, driverStars, feedback }) => {
    const { orders } = get();
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          rating: {
            restaurantStars: restaurantStars || 5,
            driverStars: driverStars || 5,
            feedback: feedback || "Delicious food and prompt delivery!"
          }
        };
      }
      return o;
    });
    set({ orders: updatedOrders });
    get().saveState();
  },

  // ----------------- DRIVER PROFILE & WALLET -----------------
  toggleDriverOnline: (driverId, isOnline) => {
    const { drivers } = get();
    const updatedDrivers = drivers.map((d) => {
      if (d.id === driverId) {
        return { ...d, status: isOnline ? "ONLINE" : "OFFLINE" };
      }
      return d;
    });
    set({ drivers: updatedDrivers });
    get().saveState();
  },

  requestDriverWithdrawal: (driverId, amount, upiId) => {
    const { drivers, withdrawals, notifications } = get();
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return { success: false, message: "Driver not found" };

    if (amount > driver.walletBalance) {
      return { success: false, message: "Withdrawal amount exceeds available wallet balance." };
    }
    if (amount < 200) {
      return { success: false, message: "Minimum withdrawal amount is ₹200." };
    }

    const withdrawalId = `WTH-${Math.floor(100 + Math.random() * 900)}`;
    const newWithdrawal = {
      id: withdrawalId,
      driverId: driver.id,
      driverName: driver.name,
      amount: Number(amount),
      upiId: upiId || "driver@upi",
      status: "PENDING",
      date: new Date().toLocaleDateString()
    };

    // Deduct from wallet balance
    const updatedDrivers = drivers.map((d) => {
      if (d.id === driverId) {
        return { ...d, walletBalance: d.walletBalance - Number(amount) };
      }
      return d;
    });

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "ADMIN",
        title: `💳 New Withdrawal Request (₹${amount})`,
        message: `${driver.name} requested payout to ${upiId}.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      drivers: updatedDrivers,
      withdrawals: [newWithdrawal, ...withdrawals],
      notifications: newNotifs
    });
    get().saveState();
    return { success: true, message: `Withdrawal request for ₹${amount} submitted for admin approval.` };
  },

  // ----------------- ADMIN CONTROLS -----------------
  adminApproveWithdrawal: (withdrawalId) => {
    const { withdrawals, notifications } = get();
    const w = withdrawals.find((item) => item.id === withdrawalId);
    if (!w) return;

    const updated = withdrawals.map((item) => {
      if (item.id === withdrawalId) {
        return { ...item, status: "COMPLETED" };
      }
      return item;
    });

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "DRIVER",
        driverId: w.driverId,
        title: "✅ Payout Approved & Sent",
        message: `Your withdrawal of ₹${w.amount} has been processed to ${w.upiId}.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({ withdrawals: updated, notifications: newNotifs });
    get().saveState();
    playChime("success");
  },

  adminManualAssignDriver: (orderId, driverId) => {
    const { orders, drivers, notifications, activeDriverRequests } = get();
    const order = orders.find((o) => o.id === orderId);
    const driver = drivers.find((d) => d.id === driverId);
    if (!order || !driver) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Clear any pending automated requests
    const updatedRequests = { ...activeDriverRequests };
    delete updatedRequests[orderId];

    // Mark driver as BUSY
    const updatedDrivers = drivers.map((d) => {
      if (d.id === driverId) {
        return { ...d, status: "BUSY", currentOrderId: orderId };
      }
      return d;
    });

    // Update order
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "DELIVERY_PARTNER_ASSIGNED",
          deliveryPartnerId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          driverAvatar: driver.avatar,
          driverVehicle: driver.vehicleType,
          driverVehicleNum: driver.vehicleNumber,
          driverRating: driver.rating,
          timeline: [
            ...o.timeline,
            { status: "DELIVERY_PARTNER_ASSIGNED", time: timeStr, label: `Admin Assigned: ${driver.name}` }
          ]
        };
      }
      return o;
    });

    const updatedTelemetry = {
      ...get().driverTelemetry,
      [orderId]: {
        lat: driver.lat,
        lng: driver.lng,
        progress: 0,
        phase: "TO_RESTAURANT"
      }
    };

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "DRIVER",
        driverId: driver.id,
        orderId,
        title: `🚨 Admin Assigned Trip #${orderId}`,
        message: `Collect from ${order.restaurantName} • ₹${order.driverEarnings} earnings.`,
        time: "Just now",
        read: false
      },
      {
        id: `notif-${Date.now() + 1}`,
        role: "CUSTOMER",
        orderId,
        title: `🛵 Delivery Partner Assigned!`,
        message: `${driver.name} is on the way to pick up your food.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      orders: updatedOrders,
      drivers: updatedDrivers,
      activeDriverRequests: updatedRequests,
      driverTelemetry: updatedTelemetry,
      notifications: newNotifs
    });
    get().saveState();
    playChime("success");
  },

  adminCancelOrder: (orderId, reason = "Cancelled by Admin") => {
    const { orders, drivers, notifications } = get();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Release driver if assigned
    const updatedDrivers = drivers.map((d) => {
      if (d.currentOrderId === orderId) {
        return { ...d, status: "ONLINE", currentOrderId: null };
      }
      return d;
    });

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: "ADMIN_CANCELLED",
          rejectReason: reason,
          timeline: [...o.timeline, { status: "ADMIN_CANCELLED", time: timeStr, label: `Cancelled: ${reason}` }]
        };
      }
      return o;
    });

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "CUSTOMER",
        orderId,
        title: "⚠️ Order Cancelled by Admin",
        message: `Order #${orderId} was cancelled. Refund has been initiated.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      orders: updatedOrders,
      drivers: updatedDrivers,
      notifications: newNotifs
    });
    get().saveState();
  },

  // Toggle restaurant item availability
  toggleRestaurantItemStock: (restaurantId, itemId) => {
    const { restaurants } = get();
    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        const newItems = r.items.map((it) => {
          if (it.id === itemId) {
            return { ...it, isOutOfStock: !it.isOutOfStock };
          }
          return it;
        });
        return { ...r, items: newItems };
      }
      return r;
    });
    set({ restaurants: updated });
    get().saveState();
  },

  // Update live driver simulated coordinates
  updateDriverTelemetryProgress: (orderId, progressDelta = 5) => {
    const { driverTelemetry, orders } = get();
    const tel = driverTelemetry[orderId];
    const order = orders.find((o) => o.id === orderId);
    if (!tel || !order) return;

    const newProgress = Math.min(100, (tel.progress || 0) + progressDelta);
    let startLat, startLng, endLat, endLng;

    if (tel.phase === "TO_RESTAURANT") {
      startLat = 19.0620; // default start
      startLng = 72.8350;
      endLat = order.restaurantLat;
      endLng = order.restaurantLng;
    } else {
      startLat = order.restaurantLat;
      startLng = order.restaurantLng;
      endLat = order.customerLat;
      endLng = order.customerLng;
    }

    const currentLat = startLat + (endLat - startLat) * (newProgress / 100);
    const currentLng = startLng + (endLng - startLng) * (newProgress / 100);

    set({
      driverTelemetry: {
        ...driverTelemetry,
        [orderId]: {
          ...tel,
          lat: currentLat,
          lng: currentLng,
          progress: newProgress
        }
      }
    });
  },

  // ----------------- ADD & MANAGE FOOD ITEMS -----------------
  addNewFoodItem: (restaurantId, itemData) => {
    const { restaurants } = get();
    const newItem = {
      id: `item-${Date.now()}`,
      name: itemData.name,
      desc: itemData.desc || "Delicious freshly prepared specialty dish.",
      price: Number(itemData.price) || 299,
      originalPrice: itemData.originalPrice ? Number(itemData.originalPrice) : null,
      category: itemData.category || "Main Course",
      isVeg: Boolean(itemData.isVeg),
      isBestseller: Boolean(itemData.isBestseller),
      rating: 4.8,
      image: itemData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600",
      customizations: itemData.customizations || []
    };

    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        // Also ensure category exists in categories array
        const categories = r.categories.includes(newItem.category)
          ? r.categories
          : [...r.categories, newItem.category];
        return {
          ...r,
          categories,
          items: [newItem, ...r.items]
        };
      }
      return r;
    });

    set({ restaurants: updated });
    get().saveState();
    playChime("success");
    return { success: true, item: newItem };
  },

  updateFoodItem: (restaurantId, itemId, updatedData) => {
    const { restaurants } = get();
    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        const items = r.items.map((it) => (it.id === itemId ? { ...it, ...updatedData } : it));
        return { ...r, items };
      }
      return r;
    });
    set({ restaurants: updated });
    get().saveState();
  },

  deleteFoodItem: (restaurantId, itemId) => {
    const { restaurants } = get();
    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        const items = r.items.filter((it) => it.id !== itemId);
        return { ...r, items };
      }
      return r;
    });
    set({ restaurants: updated });
    get().saveState();
  },

  addNewCategory: (restaurantId, categoryName) => {
    if (!categoryName?.trim()) return;
    const { restaurants } = get();
    const updated = restaurants.map((r) => {
      if (r.id === restaurantId && !r.categories.includes(categoryName.trim())) {
        return { ...r, categories: [...r.categories, categoryName.trim()] };
      }
      return r;
    });
    set({ restaurants: updated });
    get().saveState();
  },

  // ----------------- PARTNER ONBOARDING & REGISTRATION -----------------
  registerNewDriver: (driverData) => {
    const { drivers, notifications } = get();
    const newDriverId = `driver-${Date.now()}`;
    const newDriver = {
      id: newDriverId,
      name: driverData.name || "Delivery Partner",
      phone: driverData.phone || "+91 98000 00000",
      email: driverData.email || "driver@foodie.com",
      avatar: driverData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
      vehicleType: driverData.vehicleType || "Motorcycle",
      vehicleNumber: driverData.vehicleNumber || "MH-02-AB-1234",
      rating: 5.0,
      totalDeliveries: 0,
      todayDeliveries: 0,
      todayEarnings: 0,
      weekEarnings: 0,
      monthEarnings: 0,
      walletBalance: 500, // Joining bonus
      status: "ONLINE",
      lat: 19.0620,
      lng: 72.8350,
      currentOrderId: null,
      isVerified: true,
      joinedDate: "Today"
    };

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "ADMIN",
        title: "🎉 New Delivery Partner Onboarded",
        message: `${newDriver.name} registered (${newDriver.vehicleType} - ${newDriver.vehicleNumber}).`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      drivers: [newDriver, ...drivers],
      selectedDriverId: newDriverId,
      notifications: newNotifs
    });
    get().saveState();
    playChime("success");
    return newDriver;
  },

  registerNewRestaurant: (restData) => {
    const { restaurants, notifications } = get();
    const newRestId = `rest-${Date.now()}`;
    const newRest = {
      id: newRestId,
      name: restData.name || "Gourmet Kitchen",
      tagline: restData.tagline || "Fresh & Delicious Meals",
      cuisine: restData.cuisine || "Multi-Cuisine • Fast Food",
      rating: 4.9,
      reviewCount: 1,
      prepTime: restData.prepTime || "20–25 min",
      deliveryFee: Number(restData.deliveryFee) || 30,
      minOrder: 150,
      address: restData.address || "Andheri West, Mumbai",
      lat: 19.1136,
      lng: 72.8697,
      image: restData.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800",
      offer: restData.offer || "50% OFF FIRST ORDER",
      isPureVeg: Boolean(restData.isPureVeg),
      isOpen: true,
      categories: ["Main Course", "Starters", "Beverages"],
      items: [
        {
          id: `item-${Date.now()}-1`,
          name: "Signature Chef Special",
          desc: "Chef's award-winning recipe with premium ingredients & special spices",
          price: 349,
          category: "Main Course",
          isVeg: true,
          isBestseller: true,
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600"
        }
      ]
    };

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "ADMIN",
        title: "🏪 New Restaurant Outlet Registered",
        message: `${newRest.name} is now live and accepting orders.`,
        time: "Just now",
        read: false
      },
      ...notifications
    ];

    set({
      restaurants: [newRest, ...restaurants],
      selectedRestaurantId: newRestId,
      notifications: newNotifs
    });
    get().saveState();
    playChime("success");
    return newRest;
  },

  deleteRestaurant: (restaurantId) => {
    const { restaurants = [], foodCart, authenticatedRestaurantId, selectedRestaurantId, notifications = [] } = get();
    const restToDelete = (restaurants || []).find((r) => r.id === restaurantId);
    if (!restToDelete) return false;

    const remainingRestaurants = (restaurants || []).filter((r) => r.id !== restaurantId);
    const newAuthRestId = authenticatedRestaurantId === restaurantId ? null : authenticatedRestaurantId;
    const newSelectedRestId =
      selectedRestaurantId === restaurantId
        ? remainingRestaurants[0]?.id || null
        : selectedRestaurantId;

    let nextFoodCart = foodCart || {
      restaurantId: null,
      restaurantName: "",
      items: [],
      appliedCoupon: null
    };

    if (nextFoodCart?.restaurantId === restaurantId) {
      nextFoodCart = {
        restaurantId: null,
        restaurantName: "",
        items: [],
        appliedCoupon: null
      };
    }

    const newNotifs = [
      {
        id: `notif-${Date.now()}`,
        role: "ADMIN",
        title: "🗑️ Restaurant Outlet Delisted",
        message: `${restToDelete.name} has been permanently removed from the platform.`,
        time: "Just now",
        read: false
      },
      ...(notifications || [])
    ];

    set({
      restaurants: remainingRestaurants,
      authenticatedRestaurantId: newAuthRestId,
      selectedRestaurantId: newSelectedRestId,
      foodCart: nextFoodCart,
      notifications: newNotifs
    });

    get().saveState();
    playChime("alert");
    return true;
  },

  // In-App Customer & Driver Live Chat
  orderChats: persisted?.orderChats || {}, // { [orderId]: [{ id, sender: 'CUSTOMER' | 'DRIVER', text, time }] }

  sendOrderChatMessage: (orderId, sender, text) => {
    const { orderChats } = get();
    const existing = orderChats[orderId] || [];
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender, // 'CUSTOMER' | 'DRIVER'
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    set({
      orderChats: {
        ...orderChats,
        [orderId]: [...existing, newMsg]
      }
    });
    get().saveState();
    playChime("alert");
  },

  // ----------------- CUSTOMER PERSONAS & PROFILE -----------------
  customerPersonas: [
    {
      id: "cust-1",
      name: "Rahul Sharma",
      phone: "+91 98200 12345",
      address: "Flat 402, Sea View Apts, Carter Road, Bandra West, Mumbai",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      tier: "OneKart Gold Member",
      savedAddresses: [
        { label: "Home", address: "Flat 402, Sea View Apts, Carter Road, Bandra West, Mumbai - 400050" },
        { label: "Work", address: "One International Center, Tower 2, Lower Parel, Mumbai" }
      ]
    },
    {
      id: "cust-2",
      name: "Sneha Kapoor",
      phone: "+91 98334 56789",
      address: "12 Palm Beach Road, Juhu Tara Road, Mumbai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      tier: "OneKart Super Saver",
      savedAddresses: [
        { label: "Home", address: "12 Palm Beach Road, Juhu Tara Road, Mumbai - 400049" }
      ]
    },
    {
      id: "cust-3",
      name: "Ananya Roy",
      phone: "+91 98112 33445",
      address: "Building 8B, Central Avenue, Powai, Mumbai",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200",
      tier: "OneKart Member",
      savedAddresses: [
        { label: "Home", address: "Building 8B, Central Avenue, Powai, Mumbai - 400076" }
      ]
    }
  ],
  selectedCustomerId: "cust-1",
  setSelectedCustomer: (customerId) => {
    set({ selectedCustomerId: customerId });
  },

  // ----------------- 1-CLICK END-TO-END DEMO SIMULATOR -----------------
  simulateFullOrderLifecycle: (targetOrderId, onStepChange) => {
    const state = get();
    let orderId = targetOrderId;

    // If no orderId given, pick an active one or create a sample one
    if (!orderId) {
      const existing = state.orders.find((o) => o.orderStatus === "PLACED" || o.orderStatus === "RESTAURANT_ACCEPTED");
      if (existing) {
        orderId = existing.id;
      } else {
        // Create demo order from Pizza Palace
        const sampleRest = state.restaurants[0];
        const sampleItem = sampleRest.items[0];
        state.addToFoodCart(sampleRest, sampleItem);
        const created = state.placeFoodOrder({
          customerName: "Rahul Sharma",
          customerPhone: "+91 98200 12345",
          deliveryAddress: "Flat 402, Sea View Apartments, Bandra West, Mumbai",
          paymentMethod: "UPI"
        });
        orderId = created.id;
      }
    }

    if (onStepChange) onStepChange("STEP 1: Order Placed! Moving to Restaurant...", orderId);

    // Step 1: Restaurant Accepts (after 2s)
    setTimeout(() => {
      get().restaurantAcceptOrder(orderId, 20);
      if (onStepChange) onStepChange("STEP 2: Restaurant Accepted! Cooking starts...", orderId);

      // Step 2: Start Preparing (after 4s)
      setTimeout(() => {
        get().restaurantStartPreparing(orderId);
        if (onStepChange) onStepChange("STEP 3: Kitchen is cooking meal...", orderId);

        // Step 3: Food Ready & Auto-Assign Driver (after 6s)
        setTimeout(() => {
          get().restaurantReadyForPickup(orderId);
          if (onStepChange) onStepChange("STEP 4: Food Ready! Dispatching nearest driver...", orderId);

          // Step 4: Driver Accepts (after 8s)
          setTimeout(() => {
            const currentReq = get().activeDriverRequests[orderId];
            const driverToAssign = currentReq ? currentReq.driverId : get().drivers[0].id;
            get().driverRespondRequest(orderId, driverToAssign, true);
            if (onStepChange) onStepChange(`STEP 5: Driver assigned! Heading to restaurant...`, orderId);

            // Step 5: Driver Reaches Restaurant (after 10s)
            setTimeout(() => {
              get().driverArrivedAtRestaurant(orderId);
              if (onStepChange) onStepChange(`STEP 6: Driver reached! Verifying Pickup OTP 4821...`, orderId);

              // Step 6: Verify Pickup OTP (after 12s)
              setTimeout(() => {
                const currentOrder = get().orders.find((o) => o.id === orderId);
                const pOtp = currentOrder?.pickupOTP || "4821";
                get().verifyPickupOTP(orderId, pOtp);
                if (onStepChange) onStepChange(`STEP 7: Picked up! Driver in transit on live map...`, orderId);

                // Step 7: Driver arrives at customer (after 15s)
                setTimeout(() => {
                  get().driverArrivedAtCustomer(orderId);
                  if (onStepChange) onStepChange(`STEP 8: Driver at customer doorstep! Verifying Delivery OTP...`, orderId);

                  // Step 8: Verify Delivery OTP & Complete (after 17s)
                  setTimeout(() => {
                    const finalOrder = get().orders.find((o) => o.id === orderId);
                    const dOtp = finalOrder?.deliveryOTP || "7294";
                    get().verifyDeliveryOTP(orderId, dOtp);
                    if (onStepChange) onStepChange(`🎉 ORDER COMPLETED! Driver earnings credited & customer rating unlocked!`, orderId);
                  }, 2000);
                }, 3000);
              }, 2000);
            }, 2000);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);

    return orderId;
  }
}));

export default useFoodDeliveryStore;

