import mongoose from "mongoose";
import Upsell from "../module/Upsell.module.js";
import Product from "../module/Product.module.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

// Helper function to calculate bundle price
const calculateBundlePrice = async (bundleProducts, gst) => {
  let totalPrice = 0;
  for (const item of bundleProducts.products) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    let price = 0;
    if (product.productType === "simple") {
      price = product.simpleProduct?.price || 0;
      const discount = product.simpleProduct?.discount || 0;
      const gstAmount = (price * gst) / 100;
      const priceWithGst = price + gstAmount;
      totalPrice += priceWithGst - Math.round((priceWithGst * discount) / 100);
    } else if (product.productType === "variant") {
      const firstColor = product.variants?.[0]?.colors?.[0];
      if (firstColor) {
        price = firstColor.price || 0;
        const discount = firstColor.discount || 0;
        const gstAmount = (price * gst) / 100;
        const priceWithGst = price + gstAmount;
        totalPrice += priceWithGst - Math.round((priceWithGst * discount) / 100);
      }
    }
  }
  return totalPrice;
};

// Get all upsells (for admin)
export const getAllUpsells = catchAsync(async (req, res, next) => {
  const upsells = await Upsell.find({})
    .populate({
      path: "triggerProduct",
      select: "name sku productType simpleProduct variants bundleProducts",
    })
    .populate({
      path: "upsellProducts.product",
      select: "name sku productType simpleProduct variants bundleProducts",
    });

  res.status(200).json({
    success: true,
    data: upsells,
  });
});

// Get upsell for a trigger product
export const getUpsellByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError("Invalid product ID", 400));
  }

  const upsell = await Upsell.findOne({
    triggerProduct: productId,
    active: true
  }).populate({
    path: "upsellProducts.product",
    select: "name price images sku productType simpleProduct variants bundleProducts",
  });

  if (!upsell) {
    return res.status(200).json({
      success: true,
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    data: upsell,
  });
});

// Create or update upsell for a trigger product
export const createOrUpdateUpsell = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { upsellProducts, minQty, active } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError("Invalid product ID", 400));
  }

  // Validate that trigger product exists
  const triggerProduct = await Product.findById(productId);
  if (!triggerProduct) {
    return next(new AppError("Trigger product not found", 404));
  }

  // Validate upsell products exist and discount values
  for (const item of upsellProducts) {
    if (!item.product || !item.discountType || item.discountValue === undefined) {
      return next(new AppError("Invalid upsell product data", 400));
    }
    if (!['percentage', 'flat'].includes(item.discountType)) {
      return next(new AppError("Invalid discount type", 400));
    }
    if (item.discountValue < 0) {
      return next(new AppError("Discount value must be non-negative", 400));
    }
    if (item.discountType === 'percentage' && item.discountValue > 100) {
      return next(new AppError("Percentage discount cannot exceed 100%", 400));
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Upsell product ${item.product} not found`, 404));
    }

    // For variant products, if sku is provided, validate it exists
    if (product.productType === 'variant' && item.sku) {
      const colorExists = product.variants?.flatMap(v => v.colors).some(c => c.sku === item.sku);
      if (!colorExists) {
        return next(new AppError(`Invalid SKU ${item.sku} for variant product ${product.name}`, 400));
      }
    }

    // Get product price (original price with GST)
    let price = 0;
    if (product.productType === 'simple') {
      price = product.simpleProduct?.price || 0;
      const gstAmount = (price * product.gst) / 100;
      price += gstAmount;
    } else if (product.productType === 'variant') {
      const gst = product.gst || 18; // Fallback GST
      if (item.sku) {
        const color = product.variants?.flatMap(v => v.colors).find(c => c.sku === item.sku);
        if (color) {
          price = Number(color.price) || 0;
          if (price > 0) {
            const gstAmount = (price * gst) / 100;
            price += gstAmount;
          }
        }
      } else {
        // If no specific sku, use the lowest price variant for discount calculation
        let minPrice = Infinity;
        product.variants?.forEach(v => {
          v.colors?.forEach(c => {
            const cPrice = Number(c.price) || 0;
            if (cPrice > 0 && cPrice < minPrice) minPrice = cPrice;
          });
        });
        if (minPrice !== Infinity && minPrice > 0) {
          price = minPrice;
          const gstAmount = (price * gst) / 100;
          price += gstAmount;
        }
      }
    } else if (product.productType === 'bundle') {
      price = product.bundleProducts?.price || 0;
      const gstAmount = (price * product.gst) / 100;
      price += gstAmount;
    }

    // Ensure discount doesn't make price negative or zero
    let discountedPrice = price;
    if (item.discountType === 'percentage') {
      discountedPrice = price - (price * item.discountValue / 100);
    } else {
      discountedPrice = price - item.discountValue;
    }

    if (discountedPrice <= 0) {
      return next(new AppError(`Discount too high for product ${product.name}`, 400));
    }
  }

  const upsell = await Upsell.findOneAndUpdate(
    { triggerProduct: productId },
    { upsellProducts, minQty, active },
    { new: true, upsert: true, runValidators: true }
  ).populate({
    path: "upsellProducts.product",
    select: "name price images sku productType simpleProduct variants bundleProducts",
  });

  res.status(200).json({
    success: true,
    message: "Upsell updated successfully",
    data: upsell,
  });
});

// Delete upsell for a trigger product
export const deleteUpsell = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError("Invalid product ID", 400));
  }

  const upsell = await Upsell.findOneAndDelete({ triggerProduct: productId });

  if (!upsell) {
    return next(new AppError("No upsell found for this product", 404));
  }

  res.status(200).json({
    success: true,
    message: "Upsell deleted successfully",
  });
});

// Admin: Create new upsell
export const createUpsellAdmin = catchAsync(async (req, res, next) => {
  const { triggerProduct, upsellProducts, minQty, active } = req.body;

  // Validate trigger product ID
  if (!mongoose.Types.ObjectId.isValid(triggerProduct)) {
    return next(new AppError("Invalid trigger product ID", 400));
  }

  // Validate that trigger product exists
  const triggerProductDoc = await Product.findById(triggerProduct);
  if (!triggerProductDoc) {
    return next(new AppError("Trigger product not found", 404));
  }

  // Check if upsell already exists for this trigger product
  const existingUpsell = await Upsell.findOne({ triggerProduct });
  if (existingUpsell) {
    return next(new AppError("Upsell already exists for this trigger product", 400));
  }

  // Validate upsell products exist
  for (const item of upsellProducts) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      return next(new AppError(`Invalid upsell product ID ${item.product}`, 400));
    }
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Upsell product ${item.product} not found`, 404));
    }
  }

  const upsell = await Upsell.create({
    triggerProduct,
    upsellProducts,
    minQty: minQty || 1,
    active: active !== undefined ? active : true,
  });

  const populatedUpsell = await Upsell.findById(upsell._id)
    .populate({
      path: "triggerProduct",
      select: "name sku productType simpleProduct variants bundleProducts",
    })
    .populate({
      path: "upsellProducts.product",
      select: "name sku productType simpleProduct variants bundleProducts",
    });

  res.status(201).json({
    success: true,
    message: "Upsell created successfully",
    data: populatedUpsell,
  });
});

// Admin: Update existing upsell
export const updateUpsellAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { triggerProduct, upsellProducts, minQty, active } = req.body;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid upsell ID", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(triggerProduct)) {
    return next(new AppError("Invalid trigger product ID", 400));
  }

  // Validate that trigger product exists
  const triggerProductDoc = await Product.findById(triggerProduct);
  if (!triggerProductDoc) {
    return next(new AppError("Trigger product not found", 404));
  }

  // Check if another upsell exists for this trigger product (excluding current)
  const existingUpsell = await Upsell.findOne({
    triggerProduct,
    _id: { $ne: id }
  });
  if (existingUpsell) {
    return next(new AppError("Another upsell already exists for this trigger product", 400));
  }

  // Validate upsell products exist
  for (const item of upsellProducts) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      return next(new AppError(`Invalid upsell product ID ${item.product}`, 400));
    }
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Upsell product ${item.product} not found`, 404));
    }

    // For variant products, if sku is provided, validate it exists
    if (product.productType === 'variant' && item.sku) {
      const colorExists = product.variants?.flatMap(v => v.colors).some(c => c.sku === item.sku);
      if (!colorExists) {
        return next(new AppError(`Invalid SKU ${item.sku} for variant product ${product.name}`, 400));
      }
    }
  }

  const upsell = await Upsell.findByIdAndUpdate(
    id,
    {
      triggerProduct,
      upsellProducts,
      minQty: minQty || 1,
      active: active !== undefined ? active : true,
    },
    { new: true, runValidators: true }
  );

  if (!upsell) {
    return next(new AppError("Upsell not found", 404));
  }

  const populatedUpsell = await Upsell.findById(upsell._id)
    .populate({
      path: "triggerProduct",
      select: "name sku productType simpleProduct variants bundleProducts",
    })
    .populate({
      path: "upsellProducts.product",
      select: "name sku productType simpleProduct variants bundleProducts",
    });

  res.status(200).json({
    success: true,
    message: "Upsell updated successfully",
    data: populatedUpsell,
  });
});

// Admin: Delete upsell by ID
export const deleteUpsellAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid upsell ID", 400));
  }

  const upsell = await Upsell.findByIdAndDelete(id);

  if (!upsell) {
    return next(new AppError("Upsell not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Upsell deleted successfully",
    data: upsell,
  });
});

// Calculate discount for upsell products
export const calculateUpsellDiscount = async (cartItems, upsell) => {
  let totalDiscount = 0;
  const triggerCartItem = cartItems.find(item => item.product.toString() === upsell.triggerProduct.toString());
  if (!triggerCartItem || triggerCartItem.quantity < upsell.minQty) return 0;


  for (const upsellItem of upsell.upsellProducts) {
    const matchingCartItems = cartItems.filter(item => item.product.toString() === upsellItem.product._id.toString());
    for (const cartItem of matchingCartItems) {
      // Check stock
      let stock = 0;
      const product = upsellItem.product;
      if (product.productType === 'simple') {
        stock = product.simpleProduct.stockStatus !== "Out of stock" ? 999 : 0;
      } else if (product.productType === 'variant') {
        const color = product.variants.flatMap(v => v.colors).find(c => c.sku === cartItem.sku);
        if (color) {
          stock = color.stockStatus !== "Out of stock" ? 999 : 0;
        }
      } else if (product.productType === 'bundle') {
        stock = Infinity; // Virtual stock for bundles
      }

      if (stock >= cartItem.quantity) {
        // Get price (original price with GST)
        let price = 0;

        if (product.productType === 'simple') {
          price = product.simpleProduct.price;
          const gstAmount = (price * product.gst) / 100;
          price += gstAmount;
        } else if (product.productType === 'variant') {
          // Use the sku from upsellProducts for pricing, but check stock with cartItem.sku
          const upsellSku = upsellItem.sku || cartItem.sku; // Fallback for backward compatibility
          const color = product.variants.flatMap(v => v.colors).find(c => c.sku === upsellSku);
          if (color) {
            price = color.price;
            const gstAmount = (price * product.gst) / 100;
            price += gstAmount;
          }
        } else if (product.productType === 'bundle') {
          price = product.bundleProducts.price;
          const gstAmount = (price * product.gst) / 100;
          price += gstAmount;
        }
        // Calculate discount
        if (upsellItem.discountType === 'percentage') {
          totalDiscount += (price * upsellItem.discountValue / 100) * cartItem.quantity;
        } else if (upsellItem.discountType === 'flat') {
          totalDiscount += upsellItem.discountValue * cartItem.quantity;
        }
      }
    }
  }
console.log(totalDiscount)
  return totalDiscount;
};

// Calculate total upsell savings for the cart
export const calculateCartUpsellSavings = catchAsync(async (req, res, next) => {
  const { cartItems } = req.body; // array of { product, variantId, colorId, quantity }
  // Find all active upsells where trigger product is in cart
  const triggerProductIds = cartItems.map(item => item.product);
  const upsells = await Upsell.find({
    triggerProduct: { $in: triggerProductIds },
    active: true
  }).populate('upsellProducts.product');

  let totalSavings = 0;

  for (const upsell of upsells) {
    const discount = await calculateUpsellDiscount(cartItems, upsell);
    totalSavings += discount;
  }

  res.status(200).json({
    success: true,
    data: { totalSavings }
  });
});

// Get upsell suggestions for cart (products not in cart but can be added for discounts)
export const getCartUpsellSuggestions = catchAsync(async (req, res, next) => {
  const { cartItems } = req.body; // array of { product, variantId, colorId, quantity }

  // Populate cart items with product details
  const populatedCartItems = await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item.product);
      return { ...item, product };
    })
  );

  const cartProductIds = populatedCartItems.map(item => item.product._id.toString());

  // Find all active upsells where trigger product is in cart
  const triggerProductIds = populatedCartItems.map(item => item.product._id);
  const upsells = await Upsell.find({
    triggerProduct: { $in: triggerProductIds },
    active: true
  }).populate({
    path: 'upsellProducts.product',
    select: 'name images sku productType simpleProduct variants bundleProducts gst'
  }).populate({
    path: 'triggerProduct',
    select: 'name'
  });

  const suggestions = [];

  for (const upsell of upsells) {
    const triggerInCart = populatedCartItems.find(item =>
      item.product._id.toString() === upsell.triggerProduct._id.toString()
    );

    if (!triggerInCart || triggerInCart.quantity < upsell.minQty) continue;

    // Check which upsell products are missing from cart
    const missingUpsellProducts = upsell.upsellProducts.filter(upsellItem => {
      return !cartProductIds.includes(upsellItem.product._id.toString());
    });

    if (missingUpsellProducts.length > 0) {
      // Calculate potential savings if all missing products are added
      let potentialSavings = 0;
      const allUpsellProducts = [...upsell.upsellProducts];

      for (const upsellItem of allUpsellProducts) {
        // Get price for calculation (original price with GST)
        let price = 0;
        const product = upsellItem.product;

        if (product.productType === 'simple') {
          price = product.simpleProduct?.price || 0;
          const gstAmount = (price * product.gst) / 100;
          price += gstAmount;
        } else if (product.productType === 'variant') {
          const gst = product.gst || 18; // Fallback GST
          if (upsellItem.sku) {
            const color = product.variants?.flatMap(v => v.colors).find(c => c.sku === upsellItem.sku);
            if (color) {
              price = Number(color.price) || 0;
              if (price > 0) {
                const gstAmount = (price * gst) / 100;
                price += gstAmount;
              }
            }
          } else {
            // If no specific sku, use the lowest price variant for potential savings calculation
            let minPrice = Infinity;
            product.variants?.forEach(v => {
              v.colors?.forEach(c => {
                const cPrice = Number(c.price) || 0;
                if (cPrice > 0 && cPrice < minPrice) minPrice = cPrice;
              });
            });
            if (minPrice !== Infinity && minPrice > 0) {
              price = minPrice;
              const gstAmount = (price * gst) / 100;
              price += gstAmount;
            }
          }
        } else if (product.productType === 'bundle') {
          price = product.bundleProducts?.price || 0;
          const gstAmount = (price * product.gst) / 100;
          price += gstAmount;
        }

        // Calculate discount
        if (upsellItem.discountType === 'percentage') {
          potentialSavings += price * upsellItem.discountValue / 100;
        } else if (upsellItem.discountType === 'flat') {
          potentialSavings += upsellItem.discountValue;
        }
      }

      suggestions.push({
        triggerProduct: {
          _id: upsell.triggerProduct._id,
          name: upsell.triggerProduct.name
        },
        missingProducts: missingUpsellProducts.map(item => ({
          product: item.product,
          sku: item.sku,
          discountType: item.discountType,
          discountValue: item.discountValue
        })),
        potentialSavings,
        minQty: upsell.minQty
      });
    }
  }

  res.status(200).json({
    success: true,
    data: suggestions
  });
});