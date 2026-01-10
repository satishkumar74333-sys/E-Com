import mongoose, { Schema, model } from "mongoose";

/* ================================
   IMAGE SCHEMA
================================ */
const ImageSchema = new Schema(
  {
    public_id: { type: String, required: true },
    secure_url: { type: String, required: true },
  },
  { _id: false }
);

/* ================================
   COLOR SCHEMA (VARIANT)
================================ */
const ColorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    hex: {
      type: String,
      match: /^#([0-9A-F]{3}){1,2}$/i,
    },

    price: { type: Number, required: true, min: 0 },

    discount: {
      type: Number,
      min: 0,
      max: 90,
      default: 0,
    },

    finalPrice: Number,

    stockQuantity: { type: Number, default: 0, min: 0 },

    stockStatus: {
      type: String,
      enum: ["In stock", "Out of stock"],
    },

    sku: { type: String, required: true },

    images: {
      type: [ImageSchema],
      validate: [(v) => v.length >= 2, "Minimum 2 images required"],
    },
  },
  { _id: false }
);

/* ================================
   VARIANT SCHEMA (SIZE)
================================ */
const VariantSchema = new Schema(
  {
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE"],
      required: true,
    },

    colors: {
      type: [ColorSchema],
      validate: [
        (v) => v.length > 0,
        "At least one color is required per size",
      ],
    },
  },
  { _id: false }
);

/* ================================
   SIMPLE PRODUCT SCHEMA
================================ */
const SimpleProductSchema = new Schema(
  {
    price: { type: Number, required: true, min: 0 },

    discount: { type: Number, min: 0, max: 90, default: 0 },

    finalPrice: Number,

    sku: { type: String, required: true, },

    stockQuantity: { type: Number, default: 0 },

    stockStatus: String,

    images: {
      type: [ImageSchema],
      validate: [(v) => v.length >= 2, "Minimum 2 images required"],
    },
  },
  { _id: false }
);

/* ================================
   BUNDLE ITEM SCHEMA
================================ */
const BundleItemSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    sku: { type: String }, // For variant products

    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

/* ================================
   BUNDLE PRODUCT SCHEMA
================================ */
const BundleSchema = new Schema(
  {
    sku: { type: String, required: true },
      images: {
      type: [ImageSchema],
      validate: [(v) => v.length >= 1, "Minimum 1 images required"],
    },
    discount: {
      type: Number,
      min: 0,
      max: 90,
      default: 0,
    },

    price: { type: Number, required: true, min: 0 },

    finalPrice: Number,

    products: {
      type: [BundleItemSchema],
      validate: [
        (v) => v.length > 0,
        "Bundle must contain at least one product",
      ],
    },
  },
  { _id: false }
);

/* ================================
   MAIN PRODUCT SCHEMA
================================ */
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    productType: {
      type: String,
      enum: ["simple", "variant", "bundle"],
      required: true,
    },

    gst: {
      type: Number,
      default: 18,
      min: 0,
      max: 28,
    },

    /* ---------- PRODUCT TYPES ---------- */
    simpleProduct: SimpleProductSchema,

    variants: [VariantSchema],

    bundleProducts: BundleSchema,

    /* ---------- STATS ---------- */
    totalStock: { type: Number, default: 0 },

    likeCount: { type: Number, default: 0 },

    orderCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/* ================================
   PRODUCT TYPE VALIDATION
================================ */
ProductSchema.pre("validate", function (next) {
  if (this.productType === "simple" && !this.simpleProduct) {
    return next(new Error("Simple product data required"));
  }

  if (this.productType === "variant" && this.variants.length === 0) {
    return next(new Error("At least one variant required"));
  }

  if (this.productType === "bundle" && !this.bundleProducts) {
    return next(new Error("Bundle product data required"));
  }

  next();
});

/* ================================
   AUTO CALCULATIONS
================================ */
ProductSchema.pre("save", function (next) {
  let totalStock = 0;

  /* SIMPLE */
  if (this.productType === "simple") {
    const base = this.simpleProduct.price;
    const gstAmount = (base * this.gst) / 100;
    const priceWithGst = base + gstAmount;
    const discountAmount = (priceWithGst * this.simpleProduct.discount) / 100;
    this.simpleProduct.finalPrice = priceWithGst - discountAmount;
    this.simpleProduct.stockStatus =
      this.simpleProduct.stockQuantity > 0 ? "In stock" : "Out of stock";

    totalStock = this.simpleProduct.stockQuantity;
  }

  /* VARIANT */
  if (this.productType === "variant") {
    this.variants.forEach((v) => {
      v.colors.forEach((c) => {
        const base = c.price;
        const gstAmount = (base * this.gst) / 100;
        const priceWithGst = base + gstAmount;
        const discountAmount = (priceWithGst * c.discount) / 100;
        c.finalPrice = priceWithGst - discountAmount;
        c.stockStatus = c.stockQuantity > 0 ? "In stock" : "Out of stock";
        totalStock += c.stockQuantity;
      });
    });
  }

  /* BUNDLE */
  if (this.productType === "bundle") {
    const base = this.bundleProducts.price;
    const gstAmount = (base * this.gst) / 100;
    const priceWithGst = base + gstAmount;
    const discountAmount = (priceWithGst * this.bundleProducts.discount) / 100;
    this.bundleProducts.finalPrice = priceWithGst - discountAmount;
    totalStock = 9999; // virtual stock
  }

  this.totalStock = totalStock;
  next();
});

const Product = model("Product", ProductSchema);
export default Product;
