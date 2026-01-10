import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../helper/axiosInstance";
import { formatPrice } from "../Page/Product/format";
import toast from "react-hot-toast";
import LoadingButton from "../constants/LoadingBtn";
import { addToCart } from "../Redux/Slice/CartSlice";
import { LoadAccount } from "../Redux/Slice/authSlice";

const CartUpsellSuggestions = ({ cartItems, onCartUpdate }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState({});

  // Helper to ensure finalPrice is calculated
  const ensureFinalPrice = (product) => {
    if (product.productType === 'simple' && !product.simpleProduct.finalPrice) {
      const base = product.simpleProduct.price;
      const gst = product.gst || 18;
      const gstAmount = (base * gst) / 100;
      const priceWithGst = base + gstAmount;
      const discount = product.simpleProduct.discount || 0;
      const discountAmount = Math.round((priceWithGst * discount) / 100);
      product.simpleProduct.finalPrice = priceWithGst - discountAmount;
    } else if (product.productType === 'variant' && product.variants?.length > 0) {
      product.variants.forEach(v => {
        v.colors.forEach(c => {
          if (!c.finalPrice) {
            const base = c.price;
            const gst = product.gst || 18;
            const gstAmount = (base * gst) / 100;
            const priceWithGst = base + gstAmount;
            const discount = c.discount || 0;
            const discountAmount = Math.round((priceWithGst * discount) / 100);
            c.finalPrice = priceWithGst - discountAmount;
          }
        });
      });
    } else if (product.productType === 'bundle' && !product.bundleProducts.finalPrice) {
      const base = product.bundleProducts.price;
      const gst = product.gst || 18;
      const gstAmount = (base * gst) / 100;
      const priceWithGst = base + gstAmount;
      const discount = product.bundleProducts.discount || 0;
      const discountAmount = Math.round((priceWithGst * discount) / 100);
      product.bundleProducts.finalPrice = priceWithGst - discountAmount;
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchSuggestions();
    }
  }, [cartItems]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const cartItemsForApi = cartItems.map(item => ({
        product: item.product,
        variantId: item.variantId || null,
        colorId: item.colorId || null,
        quantity: item.quantity || 1,
      }));

      const response = await axiosInstance.post('/Upsell/cart-suggestions', {
        cartItems: cartItemsForApi
      });

      if (response.data.success) {
        // Ensure finalPrice is calculated for all products
        const processedSuggestions = response.data.data.map(suggestion => ({
          ...suggestion,
          missingProducts: suggestion.missingProducts.map(item => {
            ensureFinalPrice(item.product);
            return item;
          })
        }));
        setSuggestions(processedSuggestions);
      }
    } catch (error) {
      console.error('Error fetching upsell suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductSKU = (product, itemSku) => {
    if (product.productType === "simple") {
      return product?.simpleProduct?.sku;
    } else if (product.productType === "bundle") {
      return product?.bundleProducts?.sku;
    } else if (product.productType === "variant") {
      // Use the sku from upsell item if provided, otherwise use first available in stock
      if (itemSku) {
        return itemSku;
      }
      // Find first in-stock variant
      for (const variant of product?.variants || []) {
        for (const color of variant.colors || []) {
          if (color.stockStatus === "In stock") {
            return color.sku;
          }
        }
      }
      // Fallback to first variant if none in stock
      return product?.variants?.[0]?.colors?.[0]?.sku;
    }
    return null;
  };

  const handleAddToCart = async (productId, product, itemSku) => {
    if (!isLoggedIn) {
      toast.error("Please login to add products to cart");
      return;
    }

    setAdding(prev => ({ ...prev, [productId]: true }));
    try {
      const sku = getProductSKU(product, itemSku);
      if (sku) {
        await dispatch(addToCart({ productId, sku }));
        await dispatch(LoadAccount());
        if (onCartUpdate) await onCartUpdate();
        toast.success("Product added to cart!");
      } else {
        toast.error("Unable to add product - SKU not found");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setAdding(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddAllToCart = async (suggestion) => {
    if (!isLoggedIn) {
      toast.error("Please login to add products to cart");
      return;
    }

    setAdding(prev => ({ ...prev, all: true }));
    try {
      for (const item of suggestion.missingProducts) {
        const sku = getProductSKU(item.product, item.sku);
        if (sku) {
          await dispatch(addToCart({ productId: item.product._id, sku }));
        }
      }
      await dispatch(LoadAccount());
      if (onCartUpdate) await onCartUpdate();
      toast.success(`Added ${suggestion.missingProducts.length} products to cart with potential savings!`);
    } catch (error) {
      console.error("Error adding products:", error);
      toast.error("Failed to add products to cart");
    } finally {
      setAdding(prev => ({ ...prev, all: false }));
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 mb-6">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading suggestions...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Complete Your Bundle & Save More!
      </h3>

      {suggestions.map((suggestion, index) => (
        <div key={index} className="mb-6 last:mb-0">
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Since you have <span className="font-medium text-gray-900 dark:text-gray-100">
                {suggestion.triggerProduct.name}
              </span> in your cart, add these items to save more:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {suggestion.missingProducts.map((item, idx) => {
              const product = item.product;
              let image = '';
              let name = product.name;
              let originalPrice = 0;
              let discountedPrice = 0;
              let inStock=true;
              if (product.productType === 'simple') {
                image = product.simpleProduct?.images?.[0]?.secure_url;
                originalPrice = Number(product.simpleProduct?.finalPrice) || 0;
              } else if (product.productType === 'variant') {
                if ( item.sku) {
                  const color = product.variants?.flatMap(v => v.colors).find(c => c.sku ===item.sku);
                  if (color) {
                    image = color.images?.[0]?.secure_url;
                    originalPrice = Number(color.finalPrice) || Number(color.price) || 0;
                    inStock=color.stockStatus.includes("Out of stock") ? false :true
                    console.log(color)
                  } else {
                    // Fallback if sku not found
                    originalPrice = 0;
                  }
                } else {
                  // If no specific sku, show the lowest price variant
                  let minPrice = Infinity;
                  let minImage = "";
                  product.variants?.forEach(v => {
                    v.colors?.forEach(c => {
                      const cPrice = Number(c.finalPrice) || Number(c.price) || 0;
                      if (cPrice > 0 && cPrice < minPrice) {
                        minPrice = cPrice;
                        minImage = c.images?.[0]?.secure_url || "";
                      }
                    });
                  });
                  if (minPrice !== Infinity && minPrice > 0) {
                    originalPrice = minPrice;
                    image = minImage;
                  } else {
                    // Fallback to first variant
                    const firstColor = product.variants?.[0]?.colors?.[0];
                    image = firstColor?.images?.[0]?.secure_url;
                    originalPrice = Number(firstColor?.finalPrice) || Number(firstColor?.price) || 0;
                  }
                }
              } else if (product.productType === 'bundle') {
                image = product.bundleProducts?.images?.[0]?.secure_url;
                originalPrice = Number(product.bundleProducts?.finalPrice) || 0;
              }

              // Ensure originalPrice is a valid number
              if (isNaN(originalPrice) || originalPrice < 0) {
                originalPrice = 0;
              }

              if (item.discountType === 'percentage') {
                discountedPrice = originalPrice - (originalPrice * item.discountValue / 100);
              } else {
                discountedPrice = originalPrice - item.discountValue;
              }

              discountedPrice = Math.max(0, discountedPrice);

              return (
                <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
                  <img
                    src={image || "/placeholder-product.png"}
                    alt={name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight mb-1 truncate">
                      {name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(discountedPrice)}
                      </span>
                      {originalPrice > discountedPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
               
                  <LoadingButton
                  
                  width={"5"}
              disabled={!inStock}
                    loading={adding[product._id]}
                    onClick={() => handleAddToCart(product._id, product, item.sku)}
                    name="+"
                    color={`px-2 py-1 ${!inStock ? "bg-gray-500": "bg-blue-500 hover:bg-blue-600"}  `}
                    className="text-white text-xs rounded"
                  />
                  {!inStock &&<p className="text-sm">Out of stock</p>
                           }               </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Add all {suggestion.missingProducts.length} items
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Save up to {formatPrice(suggestion.potentialSavings)}
              </p>
            </div>
            <LoadingButton
              loading={adding.all}
              onClick={() => handleAddAllToCart(suggestion)}
              name="Add All"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded font-medium"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartUpsellSuggestions;