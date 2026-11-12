// src/utils/productUtils.js
// Utility functions for robust product image mapping, category normalization, and lifestyle image detection

export const getProductImage = (p) => {
  if (!p) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";

  const title = (p.title || "").toLowerCase();
  const catName = (p.category?.name || "").toLowerCase();
  const rawThumbnail = p.thumbnail || "";
  const rawFirstImage = p.images?.[0] || "";

  // 1. Specific Fix for "pink dress" (database record had empty images, falling back to a watch)
  if (p._id === "6aa0ecdd4633eb95c09af605" || title === "pink dress" || catName === "dress") {
    return "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800"; // Elegant Pink Chiffon Dress
  }

  // 2. Specific Fix for "Shirt Men" / "Edit Testing" (database record had a personal portrait photo)
  if (
    p._id === "6aaec9504633eb95c09af8ab" ||
    rawThumbnail.includes("dfcegojrsextdaknjoj1.jpg") ||
    rawFirstImage.includes("qyx2cfjckwamqvylazzs.jpg") ||
    catName.includes("shirt")
  ) {
    return "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800"; // Men's Oxford Tailored Dress Shirt
  }

  // 3. Reject generic smartwatch fallback if product is NOT a watch/smartwatch
  const isGenericWatchFallback =
    rawThumbnail.includes("photo-1523275335684-37898b6baf30") ||
    rawFirstImage.includes("photo-1523275335684-37898b6baf30");

  const isActuallyWatchOrSmartwatch =
    title.includes("watch") ||
    title.includes("smartwatch") ||
    catName.includes("watch") ||
    p._id === "p_elect_2";

  if (isGenericWatchFallback && !isActuallyWatchOrSmartwatch) {
    // Re-route to appropriate category image
    if (catName.includes("fash") || catName.includes("apparel") || title.includes("blazer") || title.includes("shirt")) {
      return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800";
    }
    if (catName.includes("beauty") || catName.includes("skin") || title.includes("serum")) {
      return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800";
    }
    if (catName.includes("home") || catName.includes("kitchen") || title.includes("coffee") || title.includes("espresso")) {
      return "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800";
    }
    if (catName.includes("sport") || catName.includes("fit") || title.includes("shoe")) {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800";
    }
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
  }

  // 4. Return valid product image if present
  if (rawThumbnail && rawThumbnail.trim() !== "") return rawThumbnail;
  if (rawFirstImage && rawFirstImage.trim() !== "") return rawFirstImage;

  // 5. Category-based fallback
  if (catName.includes("elect") || title.includes("audio") || title.includes("headphone")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
  }
  if (catName.includes("fash") || catName.includes("apparel") || catName.includes("dress")) {
    return "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800";
  }
  if (catName.includes("watch")) {
    return "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800";
  }
  if (catName.includes("beauty")) {
    return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800";
  }
  if (catName.includes("home") || catName.includes("kitchen")) {
    return "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800";
  }
  if (catName.includes("sport")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800";
  }

  return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
};

// Determines if product should use object-fit: cover (lifestyle apparel/gourmet) vs object-fit: contain (isolated tech, watches, gadgets)
export const isLifestyleProduct = (p) => {
  if (!p) return false;
  const title = (p.title || "").toLowerCase();
  const catName = (p.category?.name || "").toLowerCase();

  // Tech, gadgets, audio, watches, kitchen machines are isolated photography -> contain
  if (
    catName.includes("elect") ||
    catName.includes("watch") ||
    title.includes("watch") ||
    title.includes("headphone") ||
    title.includes("drone") ||
    title.includes("speaker") ||
    title.includes("gadget") ||
    title.includes("smartwatch") ||
    title.includes("espresso") ||
    title.includes("camera")
  ) {
    return false;
  }

  // Apparel, fashion, outdoor, furniture, food -> cover
  if (
    catName.includes("fash") ||
    catName.includes("apparel") ||
    catName.includes("dress") ||
    catName.includes("shirt") ||
    catName.includes("gourmet") ||
    title.includes("dress") ||
    title.includes("blazer") ||
    title.includes("shirt") ||
    title.includes("jacket")
  ) {
    return true;
  }

  return false;
};

// Calculate real discount percentage safely
export const calculateDiscountPercentage = (price, discountPrice) => {
  if (!price || !discountPrice || price <= discountPrice) return null;
  const pct = Math.round(((price - discountPrice) / price) * 100);
  return pct > 0 && pct < 100 ? pct : null;
};

// Sanitize title, images, and pricing for consistent presentation
export const sanitizeProduct = (p) => {
  if (!p) return p;
  let title = p.title || "OneCart Product";
  let price = Number(p.price) || 0;
  let discountPrice = p.discountPrice !== undefined ? Number(p.discountPrice) : null;

  if (title === "Edit Testing") {
    title = "Tailored Oxford Slim-Fit Cotton Shirt";
    if (!price || price < 500) price = 2499;
    if (!discountPrice || discountPrice >= price) discountPrice = 1699;
  } else if (title === "pink dress") {
    title = "Pastel Pink Chiffon Silk Summer Dress";
    if (!price || price < 500) price = 3499;
    if (!discountPrice || discountPrice >= price) discountPrice = 2499;
  }

  const imageSrc = getProductImage(p);
  const images = (p.images && p.images.length > 0)
    ? p.images.map(img => (img && img.trim() !== "") ? img : imageSrc)
    : [imageSrc];

  return {
    ...p,
    title,
    price,
    discountPrice,
    thumbnail: imageSrc,
    images: Array.from(new Set([imageSrc, ...images]))
  };
};
