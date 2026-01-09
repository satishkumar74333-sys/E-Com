import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoadAccount } from "../Redux/Slice/authSlice";
import axiosInstance from "../helper/axiosInstance";
import { formatPrice } from "../Page/Product/format";
import toast from "react-hot-toast";
import LoadingButton from "../constants/LoadingBtn";
import { addToCart } from "../Redux/Slice/CartSlice";

const UpsellComponent = ({ productId, sku, productData }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((s) => s.auth);
  const [upsellData, setUpsellData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Helper to ensure finalPrice is calculated
  const ensureFinalPrice = (product) => {
    if (product.productType === 'simple' && !product.simpleProduct.finalPrice) {
      const base = product.simpleProduct.price;
      const gst = product.gst || 18;
      const gstAmount = (base * gst) / 100;
      const priceWithGst = base + gstAmount;
      const discount = product.simpleProduct.discount || 0;
      const discountAmount = (priceWithGst * discount) / 100;
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
            const discountAmount = (priceWithGst * discount) / 100;
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
      const discountAmount = (priceWithGst * discount) / 100;
      product.bundleProducts.finalPrice = priceWithGst - discountAmount;
    }
  };

  useEffect(() => {
    fetchUpsellData();
  }, [productId]);

  const fetchUpsellData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/Upsell/${productId}`);
      if (response.data.success && response.data.data) {
        // Ensure finalPrice is calculated for all products
        response.data.data.upsellProducts.forEach(item => {
          ensureFinalPrice(item.product);
        });
        setUpsellData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching upsell data:", error);
      toast.error("Failed to load upsell data");
    } finally {
      setLoading(false);
    }
  };

  const getProductSKU = (product) => {
    if (product.productType === "simple") {
      return product?.simpleProduct?.sku;
    } else if (product.productType === "bundle") {
      return product?.bundleProducts?.sku;
    } else if (product.productType === "variant") {
      return product?.variants?.[0]?.colors?.[0]?.sku;
    }
    return null;
  };

  const handleAddAllToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to add products to cart");
      return;
    }

    setAdding(true);
    try {
      // Add trigger product
      await dispatch(addToCart({ productId, sku: getProductSKU(productData) }));
      // Add upsell products
      for (const item of upsellData.upsellProducts) {
        // Use item.sku if available (for selected variants), otherwise calculate it
        const productSku = item.sku || getProductSKU(item.product);
        await dispatch(addToCart({ productId: item.product._id, sku: productSku }));
      }

      await dispatch(LoadAccount());
      toast.success(`Added ${upsellData.upsellProducts.length + 1} products to cart with savings!`);
    } catch (error) {
      console.error("Error adding products to cart:", error);
      toast.error("Failed to add products to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleAddIndividualToCart = async (productIdToAdd) => {
    if (!isLoggedIn) {
      toast.error("Please login to add products to cart");
      return;
    }

    try {
      // Get the product to determine SKU
      const product = upsellData.upsellProducts.find(item => item.product._id === productIdToAdd)?.product;
      const productSku = product ? getProductSKU(product) : null;

      if (productSku) {
        await dispatch(addToCart({ productId: productIdToAdd, sku: productSku }));
        await dispatch(LoadAccount());
        toast.success("Product added to cart!");
      } else {
        toast.error("Unable to add product - SKU not found");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product to cart");
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading upsell offers...</span>
        </div>
      </div>
    );
  }

  if (!upsellData || !upsellData.upsellProducts.length) {
    return null;
  }

  // Calculate total savings
  const totalSavings = upsellData.upsellProducts.reduce((sum, item) => {
    const product = item.product;
    let originalPrice = 0;

    if (product.productType === 'simple') {
      originalPrice = product.simpleProduct?.finalPrice ?? 0;
    } else if (product.productType === 'variant') {
      originalPrice = product.variants?.[0]?.colors?.[0]?.finalPrice ?? 0;
    } else if (product.productType === 'bundle') {
      originalPrice = product.bundleProducts?.finalPrice ?? 0;
    }

    let discount = 0;
    if (item.discountType === 'percentage') {
      discount = (originalPrice * item.discountValue / 100);
    } else {
      discount = item.discountValue;
    }

    return sum + Math.max(0, discount);
  }, 0);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Frequently Bought Together
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked readOnly className="w-4 h-4" />
          <span>This item:</span>
          <span className="font-medium">{productData?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {upsellData.upsellProducts.map((item, index) => {
          const product = item.product;
          let image = '';
          let name = product.name;
          let originalPrice = 0;
          let discountedPrice = 0;

          if (product.productType === 'simple') {
            image = product.simpleProduct?.images?.[0]?.secure_url;
            originalPrice = product.simpleProduct?.finalPrice ?? 0;
          } else if (product.productType === 'variant') {
            image = product.variants?.[0]?.colors?.[0]?.images?.[0]?.secure_url;
            originalPrice = product.variants?.[0]?.colors?.[0]?.finalPrice ?? 0;
          } else if (product.productType === 'bundle') {
            image = product.bundleProducts?.images?.[0]?.secure_url;
            originalPrice = product.bundleProducts?.finalPrice ?? 0;
          }

          if (item.discountType === 'percentage') {
            discountedPrice = originalPrice - (originalPrice * item.discountValue / 100);
          } else {
            discountedPrice = originalPrice - item.discountValue;
          }

          discountedPrice = Math.max(0, discountedPrice);

          return (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
              <input type="checkbox" checked readOnly className="w-4 h-4 mt-1" />
              <img
                src={image || "/placeholder-product.png"}
                alt={name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight mb-1">{name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatPrice(discountedPrice)}</span>
                  {originalPrice > discountedPrice && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Total save: <span className="text-green-600 dark:text-green-400">{formatPrice(totalSavings)}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ({upsellData.upsellProducts.length + 1} items)
            </p>
          </div>
          <LoadingButton
            loading={adding}
            onClick={handleAddAllToCart}
            name={`  Add all ${upsellData.upsellProducts.length + 1} to Cart`}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-colors"
          >
          
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default UpsellComponent;