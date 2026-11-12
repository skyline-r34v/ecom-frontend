import * as XLSX from "xlsx";
import JSZip from "jszip";

/**
 * Normalizes an object key to lowercase alphanumeric for robust column matching
 */
const cleanKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Sanitizes and normalizes image URLs from Excel cells
 * Handles Google Drive sharing links, Dropbox, trailing quotes, and comma lists
 */
export const cleanImageUrl = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  let url = raw.trim().replace(/^["'([{]+|[")\]}]+$/g, "");

  // If multiple URLs separated by comma, newline or semicolon, take the first one
  if (url.includes(",") || url.includes(";") || url.includes("\n")) {
    url = url.split(/[,;\n]/)[0].trim();
  }

  // Convert Google Drive share link to direct download/view link
  const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }

  // Convert Dropbox share links to raw image downloads
  if (url.includes("dropbox.com")) {
    return url.replace("dl=0", "raw=1");
  }

  return url;
};

/**
 * Converts a base64 / data:image string to a browser File object
 */
export const dataUriToFile = (dataUri, filename = "image.png") => {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:image")) return null;
  try {
    const parts = dataUri.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    const binaryStr = atob(parts[1] || parts[0]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mimeType });
  } catch (e) {
    console.error("Failed to convert data URI to file:", e);
    return null;
  }
};

/**
 * Extracts embedded images directly from an .xlsx workbook archive (xl/media/*)
 * This handles Excel files where images were inserted directly into cells or the sheet
 * @param {File} file
 * @returns {Promise<Array<{ path: string, filename: string, file: File, blobUrl: string }>>}
 */
export const extractEmbeddedImagesFromExcel = async (file) => {
  if (!file) return [];
  try {
    const zip = await JSZip.loadAsync(file);
    const mediaFiles = [];

    const fileEntries = Object.entries(zip.files).filter(([path, entry]) => {
      return (
        !entry.dir &&
        (path.startsWith("xl/media/") || path.match(/\.(png|jpe?g|webp|gif|bmp|svg)$/i))
      );
    });

    for (const [relativePath, zipEntry] of fileEntries) {
      const ext = relativePath.split(".").pop().toLowerCase();
      const mimeType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
          ? "image/webp"
          : ext === "gif"
          ? "image/gif"
          : ext === "svg"
          ? "image/svg+xml"
          : "image/jpeg";

      const blob = await zipEntry.async("blob");
      const filename = relativePath.split("/").pop() || "embedded_image.png";
      const imageFile = new File([blob], filename, { type: mimeType });
      mediaFiles.push({
        path: relativePath,
        filename,
        file: imageFile,
        blobUrl: URL.createObjectURL(blob),
      });
    }

    // Sort naturally by filename (image1, image2, image3, etc.)
    mediaFiles.sort((a, b) =>
      a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: "base" })
    );

    return mediaFiles;
  } catch (err) {
    // If not a zip/.xlsx or cannot read media, silently fall back
    return [];
  }
};

/**
 * Parses an Excel or CSV file into an array of normalized JSON objects,
 * and extracts any embedded image files
 * @param {File} file
 * @returns {Promise<{ sheetName: string, rows: Array, headers: Array, totalRows: number, embeddedImages: Array }>}
 */
export const parseExcelFile = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Extract embedded images and parse workbook in parallel
  const [embeddedImages, sheetData] = await Promise.all([
    extractEmbeddedImagesFromExcel(file),
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            return reject(new Error("The Excel workbook contains no sheets"));
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (!rawJson || rawJson.length === 0) {
            return reject(new Error("The uploaded sheet contains no data rows"));
          }

          // Sanitize all cell strings in parsed rows to prevent 32,767 char overflow
          const sanitizedRows = rawJson.map((r) => {
            const cleanRow = {};
            for (const [k, v] of Object.entries(r)) {
              if (typeof v === "string" && v.length > 32000) {
                cleanRow[k] = v.substring(0, 32000);
              } else {
                cleanRow[k] = v;
              }
            }
            return cleanRow;
          });

          const headers = Object.keys(sanitizedRows[0] || {});

          resolve({
            sheetName: firstSheetName,
            rows: sanitizedRows,
            headers,
            totalRows: sanitizedRows.length,
          });
        } catch (err) {
          console.error("Excel parse error:", err);
          reject(new Error("Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls or .csv file."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file from disk"));
      };

      reader.readAsArrayBuffer(file);
    }),
  ]);

  return {
    ...sheetData,
    embeddedImages,
  };
};

/**
 * Normalizes raw Excel product rows into standard ecommerce product structures.
 * Accepts both IMAGE FILES and IMAGE LINKS:
 * 1. Embedded images in the Excel file
 * 2. Direct HTTP/HTTPS links (Unsplash, Cloudinary, AWS, Google Drive, etc.)
 * 3. Base64 data:image strings
 * 4. Local image filenames (e.g. shoe.jpg) for batch file attachment
 */
export const normalizeProductRow = (row, index, embeddedImages = []) => {
  const map = {};
  Object.keys(row).forEach((k) => {
    map[cleanKey(k)] = row[k];
  });

  const title =
    map.title ||
    map.productname ||
    map.name ||
    map.producttitle ||
    map.itemname ||
    map.itemtitle ||
    `Product #${index + 1}`;

  const price = parseFloat(map.price || map.mrp || map.regularprice || map.cost || map.amount || 0) || 0;
  const discountPrice =
    parseFloat(map.discountprice || map.saleprice || map.offerprice || map.dealprice || 0) || price;

  const stock = parseInt(map.stock || map.quantity || map.qty || map.inventory || 10, 10) || 10;
  const brand = String(map.brand || map.brandname || map.manufacturer || "").trim();
  const category = String(map.category || map.categoryname || map.department || "").trim();
  const description = String(
    map.description || map.desc || map.details || map.about || "High-quality verified product."
  ).trim();

  const warranty = String(map.warranty || map.guarantee || "1 Year Standard Warranty").trim();
  const returnPolicy = String(map.returnpolicy || map.return || map.replacement || "7 Days Replacement").trim();

  const street = String(map.street || map.address || map.pickupstreet || map.pickupaddress || "Main Street Logistics Hub").trim();
  const city = String(map.city || map.pickupcity || "New Delhi").trim();
  const state = String(map.state || map.pickupstate || "Delhi").trim();
  const country = String(map.country || map.pickupcountry || "India").trim();
  const postalCode = String(map.postalcode || map.zip || map.pincode || map.postcode || "110001").trim();

  // 1. Check all possible column header aliases for image links / files
  let rawThumbnail =
    map.imagelink ||
    map.imageurl ||
    map.thumbnailurl ||
    map.image ||
    map.images ||
    map.thumbnail ||
    map.thumb ||
    map.img ||
    map.imgurl ||
    map.imglink ||
    map.photo ||
    map.photourl ||
    map.picture ||
    map.pictureurl ||
    map.productimage ||
    map.productimageurl ||
    map.productimagelink ||
    map.imagefile ||
    map.filename ||
    map.link ||
    map.url ||
    map.pic ||
    "";

  // 2. Deep scan: If no image header matched, scan ALL cell values in the row
  if (!rawThumbnail) {
    for (const [, val] of Object.entries(row)) {
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (
          trimmed.startsWith("http://") ||
          trimmed.startsWith("https://") ||
          trimmed.startsWith("data:image/") ||
          trimmed.startsWith("//") ||
          trimmed.match(/\.(jpeg|jpg|png|gif|webp|svg|bmp)$/i)
        ) {
          rawThumbnail = trimmed;
          break;
        }
      }
    }
  }

  let thumbnailUrl = "";
  let imageFilename = "";
  let imageFile = null;
  let imageSourceType = "none"; // "link" | "file" | "embedded" | "pending_file" | "none"

  if (rawThumbnail) {
    if (rawThumbnail.startsWith("data:image")) {
      imageFile = dataUriToFile(rawThumbnail, `${title.slice(0, 10)}_image.png`);
      thumbnailUrl = rawThumbnail;
      imageSourceType = "file";
    } else if (rawThumbnail.startsWith("http://") || rawThumbnail.startsWith("https://") || rawThumbnail.startsWith("//")) {
      thumbnailUrl = cleanImageUrl(rawThumbnail);
      imageSourceType = "link";
    } else {
      imageFilename = rawThumbnail.trim();
      imageSourceType = "pending_file";
    }
  }

  // 3. If no image URL or file was specified in the cell, check if an embedded image exists for this row index
  if (!imageFile && !thumbnailUrl && embeddedImages && embeddedImages[index]) {
    imageFile = embeddedImages[index].file;
    imageFilename = embeddedImages[index].filename;
    imageSourceType = "embedded";
  }

  const isValid = Boolean(title && price > 0);

  return {
    _rowId: `excel-prod-${index}-${Date.now()}`,
    originalIndex: index + 1,
    title,
    brand,
    category,
    price,
    discountPrice: discountPrice > 0 ? discountPrice : price,
    stock,
    description,
    warranty,
    returnPolicy,
    pickUpaddresses: {
      street: street || "Sector 18 Hub",
      city,
      state,
      country,
      postalCode,
    },
    thumbnailUrl,
    imageFilename,
    imageFile, // Local File if attached or embedded
    imagePreviewUrl: (imageFile ? URL.createObjectURL(imageFile) : "") || thumbnailUrl,
    hasImageLink: imageSourceType === "link",
    hasImageFile: imageSourceType === "file" || imageSourceType === "embedded",
    hasImage: Boolean(thumbnailUrl || imageFile),
    imageSourceType,
    isValid,
    validationError: !title ? "Missing Title" : price <= 0 ? "Invalid Price" : null,
  };
};

/**
 * Matches a list of local image Files (e.g. dropped in batch or selected from computer) to rows
 * Supports both Products and Categories
 */
export const matchImageFilesToRows = (rows, files, isCategory = false) => {
  if (!files || files.length === 0) return { updatedRows: rows, matchedCount: 0 };

  const fileList = Array.from(files).filter(
    (f) => f.type.startsWith("image/") || f.name.match(/\.(jpe?g|png|webp|gif|svg|bmp)$/i)
  );
  let matchedCount = 0;
  const usedFileNames = new Set();

  const updatedRows = rows.map((row, idx) => {
    // 1. Match by row.imageFilename (e.g., "shoe.jpg" or "shoe")
    let matchedFile = null;
    if (row.imageFilename) {
      const target = row.imageFilename.toLowerCase().trim();
      const targetNoExt = target.replace(/\.[^/.]+$/, "");
      matchedFile = fileList.find(
        (f) =>
          f.name.toLowerCase() === target ||
          f.name.toLowerCase().replace(/\.[^/.]+$/, "") === targetNoExt
      );
    }

    // 2. Match by item title or name / slug
    const nameToCheck = isCategory ? (row.name || row.slug) : row.title;
    if (!matchedFile && nameToCheck) {
      const cleanTarget = nameToCheck.toLowerCase().replace(/[^a-z0-9]/g, "");
      matchedFile = fileList.find((f) => {
        const cleanName = f.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName);
      });
    }

    // 3. Fallback: match by row position if file exists and not yet used
    if (!matchedFile && fileList[idx] && !usedFileNames.has(fileList[idx].name)) {
      matchedFile = fileList[idx];
    }

    if (matchedFile) {
      usedFileNames.add(matchedFile.name);
      matchedCount++;
      return {
        ...row,
        imageFile: matchedFile,
        imageFilename: matchedFile.name,
        imagePreviewUrl: URL.createObjectURL(matchedFile),
        hasImageFile: true,
        hasImage: true,
        imageSourceType: "file",
      };
    }

    return row;
  });

  return { updatedRows, matchedCount };
};

/**
 * Normalizes raw Excel category rows into standard ecommerce category structures.
 * Accepts both IMAGE FILES and IMAGE LINKS:
 * 1. Embedded images in the Excel file
 * 2. Direct HTTP/HTTPS links
 * 3. Base64 data:image strings
 * 4. Local image filenames (e.g. fashion.png) for batch file attachment
 */
export const normalizeCategoryRow = (row, index, embeddedImages = []) => {
  const map = {};
  Object.keys(row).forEach((k) => {
    map[cleanKey(k)] = row[k];
  });

  const name =
    map.name ||
    map.categoryname ||
    map.title ||
    map.category ||
    `Category #${index + 1}`;

  const slug =
    map.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const description = String(map.description || map.desc || "").trim();
  const parentCategory = String(map.parentcategory || map.parent || "").trim();

  // Check all image aliases for category
  let rawImage =
    map.imagelink ||
    map.imageurl ||
    map.image ||
    map.images ||
    map.thumbnail ||
    map.banner ||
    map.bannerurl ||
    map.photo ||
    map.icon ||
    map.pic ||
    map.imagefile ||
    map.filename ||
    map.link ||
    map.url ||
    "";

  // Deep scan: check all cells for URLs or image formats
  if (!rawImage) {
    for (const [, val] of Object.entries(row)) {
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (
          trimmed.startsWith("http://") ||
          trimmed.startsWith("https://") ||
          trimmed.startsWith("data:image/") ||
          trimmed.startsWith("//") ||
          trimmed.match(/\.(jpeg|jpg|png|gif|webp|svg|bmp)$/i)
        ) {
          rawImage = trimmed;
          break;
        }
      }
    }
  }

  let imageUrl = "";
  let imageFilename = "";
  let imageFile = null;
  let imageSourceType = "none"; // "link" | "file" | "embedded" | "pending_file" | "none"

  if (rawImage) {
    if (rawImage.startsWith("data:image")) {
      imageFile = dataUriToFile(rawImage, `${slug}_image.png`);
      imageUrl = rawImage;
      imageSourceType = "file";
    } else if (rawImage.startsWith("http://") || rawImage.startsWith("https://") || rawImage.startsWith("//")) {
      imageUrl = cleanImageUrl(rawImage);
      imageSourceType = "link";
    } else {
      imageFilename = rawImage.trim();
      imageSourceType = "pending_file";
    }
  }

  // Check embedded images
  if (!imageFile && !imageUrl && embeddedImages && embeddedImages[index]) {
    imageFile = embeddedImages[index].file;
    imageFilename = embeddedImages[index].filename;
    imageSourceType = "embedded";
  }

  const isFeaturedVal = String(map.isfeatured || map.featured || "").toLowerCase();
  const isFeatured = isFeaturedVal === "true" || isFeaturedVal === "yes" || isFeaturedVal === "1";

  const isActiveVal = String(map.isactive || map.active || "true").toLowerCase();
  const isActive = isActiveVal !== "false" && isActiveVal !== "no" && isActiveVal !== "0";

  const sortOrder = parseInt(map.sortorder || map.order || index + 1, 10) || 0;

  const isValid = Boolean(name && slug);

  return {
    _rowId: `excel-cat-${index}-${Date.now()}`,
    originalIndex: index + 1,
    name,
    slug,
    description,
    parentCategory,
    imageUrl,
    imageFilename,
    imageFile,
    imagePreviewUrl: (imageFile ? URL.createObjectURL(imageFile) : "") || imageUrl,
    hasImageLink: imageSourceType === "link",
    hasImageFile: imageSourceType === "file" || imageSourceType === "embedded",
    hasImage: Boolean(imageUrl || imageFile),
    imageSourceType,
    isFeatured,
    sortOrder,
    isActive,
    isValid,
    validationError: !name ? "Missing Name" : !slug ? "Missing Slug" : null,
  };
};

/**
 * Fetches an image link and converts it into a browser File object for Multer multipart uploads
 */
export const urlToFile = async (url, filename = "product_image.jpg") => {
  if (!url || typeof url !== "string") return null;
  const clean = cleanImageUrl(url);
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) return null;

  // 1. Direct fetch with CORS mode
  try {
    const res = await fetch(clean, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      const mime = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
      return new File([blob], filename, { type: mime });
    }
  } catch (e) {
    // CORS restriction on direct fetch, fallback to Image/Canvas
  }

  // 2. Image element -> Canvas blob conversion
  try {
    const blob = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(img.naturalWidth || 600, 1200);
          canvas.height = Math.min(img.naturalHeight || 600, 1200);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (b) => {
              if (b && b.size > 0) resolve(b);
              else reject(new Error("Canvas blob conversion failed"));
            },
            "image/jpeg",
            0.85
          );
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };
      img.onerror = () => reject(new Error("Image element load failed"));
      img.src = clean;
    });

    return new File([blob], filename, { type: "image/jpeg" });
  } catch (err) {
    // Both direct fetch and canvas failed
  }

  return null;
};

/**
 * Creates and downloads a sample Excel template for Products with Image File names
 */
export const downloadProductsExcelTemplate = () => {
  const sampleProducts = [
    {
      "Product Title": "Sony WH-1000XM5 Wireless Headphones",
      "Brand": "Sony",
      "Category": "Electronics",
      "Price": 29990,
      "Discount Price": 26990,
      "Stock": 25,
      "Description": "Industry-leading noise cancelling with Auto NC Optimizer and 30-hour battery life.",
      "Warranty": "1 Year Manufacturer Warranty",
      "Return Policy": "7 Days Replacement",
      "Pickup Street": "Tech Park Road, Phase 2",
      "Pickup City": "Bengaluru",
      "Pickup State": "Karnataka",
      "Pickup Country": "India",
      "Pickup Postal Code": "560100",
      "Image Link": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "Image File": "sony_headphones.jpg"
    },
    {
      "Product Title": "Apple Watch Series 9 GPS 45mm",
      "Brand": "Apple",
      "Category": "Wearables",
      "Price": 44900,
      "Discount Price": 41900,
      "Stock": 40,
      "Description": "Powerful S9 SiP, brighter display, and magic new Double Tap gesture.",
      "Warranty": "1 Year Apple Warranty",
      "Return Policy": "10 Days Return",
      "Pickup Street": "Cyber Hub Building 10",
      "Pickup City": "Gurugram",
      "Pickup State": "Haryana",
      "Pickup Country": "India",
      "Pickup Postal Code": "122002",
      "Image Link": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800",
      "Image File": "apple_watch.jpg"
    },
    {
      "Product Title": "Stanley Classic Vacuum Insulated Bottle 1L",
      "Brand": "Stanley",
      "Category": "Home & Kitchen",
      "Price": 3899,
      "Discount Price": 3199,
      "Stock": 60,
      "Description": "Double-wall vacuum insulation keeps liquids hot or cold for 24 hours.",
      "Warranty": "Lifetime Warranty",
      "Return Policy": "10 Days Return",
      "Pickup Street": "Indiranagar 100ft Road",
      "Pickup City": "Bengaluru",
      "Pickup State": "Karnataka",
      "Pickup Country": "India",
      "Pickup Postal Code": "560038",
      "Image Link": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
      "Image File": "stanley_bottle.jpg"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleProducts);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products_Template");
  XLSX.writeFile(wb, "OneCart_Products_Sample_Template.xlsx");
};

/**
 * Creates and downloads a sample Excel template for Categories with Image File names
 */
export const downloadCategoriesExcelTemplate = () => {
  const sampleCategories = [
    {
      "Category Name": "Electronics & Gadgets",
      "Slug": "electronics-gadgets",
      "Description": "Smartphones, laptops, smart audio gear, and personal tech accessories.",
      "Parent Category": "",
      "Image Link": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
      "Image File": "electronics.jpg",
      "Is Featured": "true",
      "Sort Order": 1,
      "Is Active": "true"
    },
    {
      "Category Name": "Fashion & Lifestyle",
      "Slug": "fashion-lifestyle",
      "Description": "Premium apparel, designer footwear, watches, and personal care.",
      "Parent Category": "",
      "Image Link": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
      "Image File": "fashion_banner.jpg",
      "Is Featured": "true",
      "Sort Order": 2,
      "Is Active": "true"
    },
    {
      "Category Name": "Home & Living",
      "Slug": "home-living",
      "Description": "Modern furniture, kitchenware, bedding, and ambient lighting.",
      "Parent Category": "",
      "Image Link": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800",
      "Image File": "home_living.jpg",
      "Is Featured": "false",
      "Sort Order": 3,
      "Is Active": "true"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleCategories);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Categories_Template");
  XLSX.writeFile(wb, "OneCart_Categories_Sample_Template.xlsx");
};

/**
 * Creates a fallback valid image File object if the row has no real file
 */
export const createDefaultThumbnailFile = (name = "product_thumb.png") => {
  const binaryString = atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  );
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new File([bytes], name, { type: "image/png" });
};

/**
 * Converts a browser File or Blob into a base64 Data URI string
 */
export const fileToDataUri = (file) => {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

/**
 * Safely trims strings so no Excel cell ever exceeds Excel's 32,767 character ceiling.
 * Also excludes raw base64 data URIs from cells (which easily reach 100,000+ characters).
 */
export const safeExcelText = (val, maxLen = 32000) => {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  // Never write raw base64 data URIs into Excel cells
  if (str.startsWith("data:image/") || str.startsWith("data:application/")) {
    return "";
  }
  return str.length > maxLen ? str.substring(0, maxLen) : str;
};

/**
 * Builds the exact structured Excel workbook buffer expected by backend POST /api/products/bulk-upload
 * Maps all user Excel columns/aliases into the backend schema:
 * - title, slug, price, discountPrice, stock, description
 * - street, city, state, country, postalCode
 * - thumbnail, images
 * - brand, category, warranty, returnPolicy
 */
export const buildBackendProductImportWorkbook = async (rows) => {
  const structuredRows = await Promise.all(
    rows.map(async (row, index) => {
      const title = String(row.title || `Product #${index + 1}`).trim();
      const slug =
        row.slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        `product-${Date.now()}-${index}`;

      const price = parseFloat(row.price || 0) || 0;
      const discountPrice = parseFloat(row.discountPrice || row.price || 0) || price;
      const stock = parseInt(row.stock || 10, 10) || 10;
      const description = String(row.description || "High-quality verified product.").trim();

      const street = String(row.pickUpaddresses?.street || "Sector 18 Hub").trim();
      const city = String(row.pickUpaddresses?.city || "New Delhi").trim();
      const state = String(row.pickUpaddresses?.state || "Delhi").trim();
      const country = String(row.pickUpaddresses?.country || "India").trim();
      const postalCode = String(row.pickUpaddresses?.postalCode || "110001").trim();

      // Only pass valid HTTP/HTTPS URLs or filenames — NEVER raw base64 data URIs
      let imgData = "";
      if (typeof row.thumbnailUrl === "string" && !row.thumbnailUrl.startsWith("data:")) {
        imgData = safeExcelText(row.thumbnailUrl, 2048);
      } else if (row.imageFilename) {
        imgData = safeExcelText(row.imageFilename, 255);
      }

      return {
        title: safeExcelText(title, 255),
        slug: safeExcelText(slug, 255),
        price,
        discountPrice,
        stock,
        description: safeExcelText(description, 10000),
        street: safeExcelText(street, 255),
        city: safeExcelText(city, 100),
        state: safeExcelText(state, 100),
        country: safeExcelText(country, 100),
        postalCode: safeExcelText(postalCode, 50),
        thumbnail: imgData,
        images: imgData,
        brand: safeExcelText(row.brandName || row.brand || "", 150),
        category: safeExcelText(row.categoryName || row.category || "", 150),
        warranty: safeExcelText(row.warranty || "1 Year Standard Warranty", 255),
        returnPolicy: safeExcelText(row.returnPolicy || "7 Days Replacement", 255),
      };
    })
  );

  const ws = XLSX.utils.json_to_sheet(structuredRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  return new File([buffer], "products_import.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

/**
 * Builds the exact structured Excel workbook buffer expected by backend POST /api/categories/bulk-upload
 * Maps all user Excel columns/aliases into the backend schema:
 * - name, slug, description, image, parentCategory, isFeatured, sortOrder, isActive
 */
export const buildBackendCategoryImportWorkbook = async (rows) => {
  const structuredRows = await Promise.all(
    rows.map(async (row, index) => {
      const name = String(row.name || `Category #${index + 1}`).trim();
      const slug =
        row.slug ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        `category-${Date.now()}-${index}`;

      const description = String(row.description || `${name} category collection.`).trim();

      // Only pass valid HTTP/HTTPS URLs or filenames — NEVER raw base64 data URIs
      let imgData = "";
      if (typeof row.imageUrl === "string" && !row.imageUrl.startsWith("data:")) {
        imgData = safeExcelText(row.imageUrl, 2048);
      } else if (row.imageFilename) {
        imgData = safeExcelText(row.imageFilename, 255);
      }

      return {
        name: safeExcelText(name, 255),
        slug: safeExcelText(slug, 255),
        description: safeExcelText(description, 10000),
        image: imgData,
        parentCategory: safeExcelText(row.parentCategory || "", 255),
        isFeatured: Boolean(row.isFeatured),
        sortOrder: parseInt(row.sortOrder || index + 1, 10) || 1,
        isActive: row.isActive !== false,
      };
    })
  );

  const ws = XLSX.utils.json_to_sheet(structuredRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  return new File([buffer], "categories_import.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
