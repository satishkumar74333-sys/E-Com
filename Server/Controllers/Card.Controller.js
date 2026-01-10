import Product from "../module/Product.module.js";
import User from "../module/user.module.js";
import Upsell from "../module/Upsell.module.js";
import { calculateUpsellDiscount } from "./Upsell.Controller.js";
import AppError from "../utils/AppError.js";

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

// Helper function to calculate cart totals with upsell discounts
const calculateCartTotals = async (cartItems) => {
  console.log(cartItems)
  let subtotal = 0;
  let totalDiscount = 0;
  let upsellDiscount = 0;

  // Get all upsell rules
  const upsells = await Upsell.find({ active: true }).populate({
    path: "upsellProducts.product",
    select: "name price images sku productType simpleProduct variants bundleProducts",
  });

  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    let price = item.finalPrice || 0;
    let stockStatus = item.stock || "Out of stock";

    // Check stock before applying discount
    if (stockStatus === "In stock") {
      subtotal += price * item.quantity;
    }
  }

  // Calculate upsell discounts after subtotal
  for (const upsell of upsells) {
    upsellDiscount += calculateUpsellDiscount(cartItems, upsell);
  }

  totalDiscount = upsellDiscount;
  const total = subtotal - totalDiscount;

  return {
    subtotal,
    totalDiscount,
    upsellDiscount,
    total,
    items: cartItems,
  };
};

// Get cart with totals and discounts
export const getCart = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
     console.log(user)
    const cartTotals = await calculateCartTotals(user.walletAddProducts);

    res.status(200).json({
      success: true,
      data: cartTotals,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const AddCardProduct = async (req, res, next) => {
  const { productId, sku, quantity = 1, price: customPrice, gst: customGst, discount: customDiscount } = req.body;
  const { id } = req.user;

  if (!id || !productId || !sku) {
    return next(new AppError("All fields are required.", 400));
  }

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1.", 400));
  }

  try {
    const FindProduct = await Product.findById(productId);
    if (!FindProduct) {
      return next(new AppError("Product not found.", 404));
    }

    const userFind = await User.findById(id);
    if (!userFind) {
      return next(new AppError("User not found.", 404));
    }

    let price = 0;
    let discount = 0;
    let stock = "In stock";
    let productImage = { public_id: null, secure_url: null };
    let gst = FindProduct.gst || 0;

    if (customPrice !== undefined) {
      price = customPrice;
      gst = customGst !== undefined ? customGst : gst;
      discount = customDiscount !== undefined ? customDiscount : discount;
      // For custom, assume stock is ok, and image from product
      if (FindProduct.productType === "simple") {
        stock = FindProduct.simpleProduct?.stockStatus || "In stock";
        productImage = FindProduct.simpleProduct?.images?.[0] || { public_id: null, secure_url: null };
      } else if (FindProduct.productType === "variant") {
        const color = FindProduct.variants?.flatMap(v => v.colors).find(c => c.sku === sku);
        if (color) {
          price = color.price || 0;
          discount = color.discount || 0;
          stock = color.stockStatus || "In stock";
          productImage = color.images?.[0] || { public_id: null, secure_url: null };
          sku = color.sku;
         
        } else {
          return next(new AppError("Product variant not found.", 404));
        }
      } else if (FindProduct.productType === "bundle") {
        stock = "In stock";
        productImage = FindProduct.bundleProducts?.images?.[0] || { public_id: null, secure_url: null };
      }
    } else {
      if (FindProduct.productType === "simple") {
        price = FindProduct.simpleProduct?.price || 0;
        discount = FindProduct.simpleProduct?.discount || 0;
        stock = FindProduct.simpleProduct?.stockStatus || "In stock";
        productImage = FindProduct.simpleProduct?.images?.[0] || { public_id: null, secure_url: null };
      } else if (FindProduct.productType === "variant") {
        const color = FindProduct.variants?.flatMap(v => v.colors).find(c => c.sku === sku);
        if (color) {
          price = color.price || 0;
          discount = color.discount || 0;
          stock = color.stockStatus || "In stock";
          productImage = color.images?.[0] || { public_id: null, secure_url: null };
        } else {
          return next(new AppError("Product variant not found.", 404));
        }
      } else if (FindProduct.productType === "bundle") {
        price = await calculateBundlePrice(FindProduct.bundleProducts, gst);
        discount = FindProduct.bundleProducts?.discount || 0;
        stock = "In stock"; // Virtual stock
        productImage = FindProduct.bundleProducts?.images?.[0] || { public_id: null, secure_url: null };
      }
    }

    // Calculate final price with GST
    let gstAmount = (price * gst) / 100;
    let priceWithGst = price + gstAmount;
    if (FindProduct.productType === "bundle") {
      // GST already included in bundle price calculation
      gstAmount = 0;
      priceWithGst = price;
    }
    const finalPrice = priceWithGst - Math.round((priceWithGst * discount) / 100);

    // Check stock
    if (stock !== "In stock") {
      return next(new AppError("Product is out of stock.", 400));
    }

    // Check if product with same SKU already exists
    const existingItemIndex = userFind.walletAddProducts.findIndex(
      (item) => item.product && item.product.toString() === productId && item.sku === sku
    );

    if (existingItemIndex !== -1) {
      // Increase quantity
      userFind.walletAddProducts[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      userFind.walletAddProducts.push({
        product: FindProduct._id,
        sku: sku,
        name: FindProduct.name,
        gst: gst,
        stock: stock,
        discount: discount,
        price: price,
        finalPrice: finalPrice,
        description: FindProduct.description,
        productType: FindProduct.productType,
        quantity: quantity,
      
        image: {
          public_id: productImage.public_id,
          secure_url: productImage.secure_url,
        },
      });
    }

    await userFind.save();

    const cartTotals = await calculateCartTotals(userFind.walletAddProducts);

    res.status(200).json({
      success: true,
      user: userFind,
       data: cartTotals,
      message: "Product successfully added to cart.",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const removeCardProduct = async (req, res, next) => {
  const { productId, sku } = req.body;
  const { id } = req.user;
  if (!id || !productId || !sku) {
    return next(new AppError("all fields are required..", 400));
  }
  try {
    const userFind = await User.findOneAndUpdate(
      { _id: id },
      { $pull: { walletAddProducts: { product: productId, sku: sku } } },
      { new: true }
    );

    if (!userFind) {
      return next(new AppError("user is not Found..", 400));
    }

    await userFind.save();

    const cartTotals = await calculateCartTotals(userFind.walletAddProducts);

    res.status(200).json({
      success: true,
      userFind,
      cartTotals,
      message: "successfully remove product in wallet..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const updateCardProductQuantity = async (req, res, next) => {
  const { productId, sku, quantity } = req.body;
  const { id } = req.user;

  if (!id || !productId || !sku || quantity === undefined) {
    return next(new AppError("All fields are required.", 400));
  }

  if (quantity < 0) {
    return next(new AppError("Quantity cannot be negative.", 400));
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    const itemIndex = user.walletAddProducts.findIndex(
      (item) => item.product.toString() === productId && item.sku === sku
    );

    if (itemIndex === -1) {
      return next(new AppError("Product not found in cart.", 404));
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      user.walletAddProducts.splice(itemIndex, 1);
    } else {
      user.walletAddProducts[itemIndex].quantity = quantity;
    }

    await user.save();

    const cartTotals = await calculateCartTotals(user.walletAddProducts);

    res.status(200).json({
      success: true,
      user,
      cartTotals,
      message: "Quantity updated successfully.",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const AllRemoveCardProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("all filed is required..", 400));
  }
  try {
    const userFind = await User.findOneAndUpdate(
      { _id: id },
      { $set: { walletAddProducts: [] } },
      { new: true }
    );

    if (!userFind) {
      return next(new AppError("user is not Found..", 400));
    }

    await userFind.save();

    const cartTotals = await calculateCartTotals(userFind.walletAddProducts);

    res.status(200).json({
      success: true,
      userFind,
      cartTotals,
      message: "successfully All product remove in wallet..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
