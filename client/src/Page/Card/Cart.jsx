import React, { useEffect, useState } from "react";
import Layout from "../../layout/layout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadAccount } from "../../Redux/Slice/authSlice";
import { getProduct } from "../../Redux/Slice/ProductSlice";
import { removeFromCart, updateQuantity, loadCart } from "../../Redux/Slice/CartSlice";
import LoadingButton from "../../constants/LoadingBtn";
import { MdCurrencyRupee } from "react-icons/md";
import { formatPrice } from "../Product/format";
import { FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../../helper/axiosInstance";
import CartUpsellSuggestions from "../../Components/CartUpsellSuggestions";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [quantities, setQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [upsellSavings, setUpsellSavings] = useState(0);
  const [cartTotals, setCartTotals] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const loadProfile = async () => {
    setIsLoading(true);
    if (isLoggedIn) {
      const res = await dispatch(LoadAccount());
    
      const cartItems = res?.payload?.data?.walletAddProducts || [];
      // Use stored finalPrice if available, else calculate
      const updatedCartItems = cartItems.map(item => {
        let finalPrice = item.finalPrice;
        let priceWithGst = item.price;
        let discountAmount = 0;
        if (item.productType === "bundle") {
          // For bundle, price is already the sum with GST included
          priceWithGst = item.price;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
          finalPrice = finalPrice || (priceWithGst - discountAmount);
        } else {
          const gstAmount = (item.price * (item.gst || 0)) / 100;
          priceWithGst = item.price + gstAmount;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
          finalPrice = finalPrice || (priceWithGst - discountAmount);
        }
        return {
          ...item,
          finalPrice,
          priceWithGst,
          discountAmount,
          imageUrl: item.image?.[0]?.secure_url || item.image?.secure_url || ""
        };
      });
      setCart(updatedCartItems);
      const initialQuantities = {};
      updatedCartItems.forEach((product) => {
        initialQuantities[product.product] = product.quantity || 1;
      });
      setQuantities(initialQuantities);
      await calculateUpsellSavings(updatedCartItems);
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const updatedGuestCart = guestCart.map(item => {
        let priceWithGst = item.price;
        let discountAmount = 0;
        if (item.productType === "bundle") {
          priceWithGst = item.price;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
        } else {
          const gstAmount = (item.price * (item.gst || 0)) / 100;
          priceWithGst = item.price + gstAmount;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
        }
        return {
          ...item,
          priceWithGst,
          discountAmount,
        };
      });
      setCart(updatedGuestCart);
      const initialQuantities = {};
      updatedGuestCart.forEach((product) => {
        initialQuantities[product.product] = product.quantity || 1;
      });
      setQuantities(initialQuantities);
      await calculateUpsellSavings(updatedGuestCart);
    }
    setIsLoading(false);
  };

  const calculateUpsellSavings = async (cartItems) => {
    if (cartItems.length === 0) {
      setUpsellSavings(0);
      return;
    }

    try {
      const cartItemsForApi = cartItems.map(item => ({
        product: item.product,
        sku: item.sku || null,
        
        quantity: item.quantity || 1,
      }));

      const response = await axiosInstance.post('/Upsell/calculate-cart-upsell', {
        cartItems: cartItemsForApi
      });

      if (response.data.success) {
        setUpsellSavings(response.data.data.totalSavings);
      }
    } catch (error) {
      console.error('Error calculating upsell savings:', error);
      setUpsellSavings(0);
    }
  };

  const minQuantity = async (productId, sku) => {
    const currentQty = quantities[productId] || 1;
    if (currentQty > 1) {
      const newQty = currentQty - 1;
      setQuantities((prev) => ({ ...prev, [productId]: newQty }));
      const res = await dispatch(updateQuantity({ productId, sku, quantity: newQty }));
      if (isLoggedIn) {
        // Reload cart for logged-in users
        const loadRes = await dispatch(LoadAccount());
        const rawCart = loadRes?.payload?.data?.walletAddProducts || [];
        const updatedCart = rawCart.map(item => {
          let finalPrice = item.finalPrice;
          let priceWithGst = item.price;
          let discountAmount = 0;
          if (item.productType === "bundle") {
            priceWithGst = item.price;
            discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
            finalPrice = finalPrice || (priceWithGst - discountAmount);
          } else {
            const gstAmount = (item.price * (item.gst || 0)) / 100;
            priceWithGst = item.price + gstAmount;
            discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
            finalPrice = finalPrice || (priceWithGst - discountAmount);
          }
          return {
            ...item,
            finalPrice,
            priceWithGst,
            discountAmount,
            imageUrl: item.image?.[0]?.secure_url || item.image?.secure_url || ""
          };
        });
        setCart(updatedCart);
        await calculateUpsellSavings(updatedCart);
      } else {
        setCart(res.payload.items);
        await calculateUpsellSavings(res.payload.items);
      }
    }
  };

  const SetQuantity = async (productId, sku) => {
    const currentQty = quantities[productId] || 1;
    const newQty = currentQty + 1;
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));
    const res = await dispatch(updateQuantity({ productId, sku, quantity: newQty }));
    if (isLoggedIn) {
      // Reload cart for logged-in users
      const loadRes = await dispatch(LoadAccount());
      const rawCart = loadRes?.payload?.data?.walletAddProducts || [];
      const updatedCart = rawCart.map(item => {
        let finalPrice = item.finalPrice;
        let priceWithGst = item.price;
        let discountAmount = 0;
        if (item.productType === "bundle") {
          priceWithGst = item.price;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
          finalPrice = finalPrice || (priceWithGst - discountAmount);
        } else {
          const gstAmount = (item.price * (item.gst || 0)) / 100;
          priceWithGst = item.price + gstAmount;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
          finalPrice = finalPrice || (priceWithGst - discountAmount);
        }
        return {
          ...item,
          finalPrice,
          priceWithGst,
          discountAmount,
          imageUrl: item.image?.[0]?.secure_url || item.image?.secure_url || ""
        };
      });
      setCart(updatedCart);
      await calculateUpsellSavings(updatedCart);
    } else {
      setCart(res.payload.items);
      await calculateUpsellSavings(res.payload.items);
    }
  };

  const ProductRemoveCard = async (productId, sku) => {
    setLoadingStates((prev) => ({ ...prev, [productId]: true }));
    await dispatch(removeFromCart({ productId, sku }));

    if (isLoggedIn) {
      // Cart will be updated via auth slice
      const res = await dispatch(LoadAccount());
      const rawCart = res?.payload?.data?.walletAddProducts || [];
      const updatedCart = rawCart.map(item => {
        let finalPrice = item.finalPrice;
        let priceWithGst = item.price;
        let discountAmount = 0;
        if (item.productType === "bundle") {
          priceWithGst = item.price;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
          finalPrice = finalPrice || (priceWithGst - discountAmount);
        } else {
          const gstAmount = (item.price * (item.gst || 0)) / 100;
          priceWithGst = item.price + gstAmount;
          discountAmount = Math.round((priceWithGst * (parseFloat(item.discount) || 0)) / 100);
          finalPrice = finalPrice || (priceWithGst - discountAmount);
        }
        return {
          ...item,
          finalPrice,
          priceWithGst,
          discountAmount,
          imageUrl: item.image?.[0]?.secure_url || item.image?.secure_url || ""
        };
      });
      setCart(updatedCart);
      await calculateUpsellSavings(updatedCart);
    } else {
      // Cart updated via Redux
      const updatedCart = cart.filter(p => p.product !== productId);
      setCart(updatedCart);
      await calculateUpsellSavings(updatedCart);
    }

    setLoadingStates((prev) => ({ ...prev, [productId]: false }));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    calculateUpsellSavings(cart);
  }, [cart]);
  const calculateTotalAmount = () => {
    return cart
      .reduce((total, product) => {
        const basePrice = product?.finalPrice || product?.price || 0;
        const productTotal = Number(basePrice) * (quantities[product.product] || 1);
        return total + productTotal;
      }, 0)
      .toFixed(2);
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Shopping Cart
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {cart?.length > 0 ? `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading your cart...</p>
            </div>
          </div>
        ) : cart?.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
              </p>
              <button
                onClick={() => navigate("/Product")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Cart Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart?.map((product, index) => (
                  <div key={product?.product} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product?.imageUrl || product?.image[0]?.secure_url}
                          alt={product?.name}
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => navigate(`/product/${product.product}`)}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => navigate(`/product/${product.product}`)}>
                          {product?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                          Type: {product?.productType || "N/A"}
                        </p>

                        {/* Price Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Price: {formatPrice(product?.priceWithGst || product?.finalPrice || 0)}
                          </div>
                          {product?.discount > 0 && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Save: {formatPrice(product?.discountAmount)}
                            </div>
                          )}
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(product?.finalPrice || product?.price || 0)}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => minQuantity(product?.product, product?.sku)}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-medium">{quantities[product.product] || 1}</span>
                            <button
                              onClick={() => SetQuantity(product.product, product?.sku)}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice((product?.finalPrice || product?.price || 0) * (quantities[product.product] || 1))}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <LoadingButton
                          textSize="py-2 px-4"
                          message="Removing..."
                          name="Remove"
                          loading={loadingStates[product.product]}
                          onClick={() => ProductRemoveCard(product.product, product?.sku)}
                          color="bg-red-500 hover:bg-red-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                      <span>{formatPrice(calculateTotalAmount())}</span>
                    </div>

                    {upsellSavings > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Upsell Savings</span>
                        <span>-{formatPrice(upsellSavings)}</span>
                      </div>
                    )}

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{formatPrice(Math.max(0, calculateTotalAmount() - upsellSavings))}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          toast.error("Please login to place order");
                          return;
                        }
                        navigate("/Product/New/Order-place", { state: { ...quantities } });
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      onClick={() => navigate("/Product")}
                      className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>

                {/* Upsell Suggestions */}
                <div className="mt-6">
                  <CartUpsellSuggestions cartItems={cart} onCartUpdate={loadProfile} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
