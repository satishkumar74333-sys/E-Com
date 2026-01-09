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
      // Add finalPrice and imageUrl for consistency
      const updatedCartItems = cartItems.map(item => ({
        ...item,
        finalPrice: item.price - Math.round((item.price * (parseFloat(item.discount) || 0)) / 100),
        imageUrl: item.image?.[0]?.secure_url || item.image?.secure_url || ""
      }));
      setCart(updatedCartItems);
      const initialQuantities = {};
      updatedCartItems.forEach((product) => {
        initialQuantities[product.product] = product.quantity || 1;
      });
      setQuantities(initialQuantities);
      await calculateUpsellSavings(updatedCartItems);
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCart(guestCart);
      const initialQuantities = {};
      guestCart.forEach((product) => {
        initialQuantities[product.product] = product.quantity || 1;
      });
      setQuantities(initialQuantities);
      await calculateUpsellSavings(guestCart);
    }
    setIsLoading(false);
  };

  const calculateUpsellSavings = async (cartItems) => {
    if (!isLoggedIn || cartItems.length === 0) {
      setUpsellSavings(0);
      return;
    }

    try {
      const cartItemsForApi = cartItems.map(item => ({
        product: item.product,
        variantId: item.variantId || null,
        colorId: item.colorId || null,
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
      await dispatch(updateQuantity({ productId, sku, quantity: newQty }));
    }
  };

  const SetQuantity = async (productId, sku) => {
    const currentQty = quantities[productId] || 1;
    const newQty = currentQty + 1;
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));
    await dispatch(updateQuantity({ productId, sku, quantity: newQty }));
  };

  const ProductRemoveCard = async (productId, sku) => {
    setLoadingStates((prev) => ({ ...prev, [productId]: true }));
    await dispatch(removeFromCart({ productId, sku }));

    if (isLoggedIn) {
      // Cart will be updated via auth slice
      const res = await dispatch(LoadAccount());
      setCart(res?.payload?.data?.walletAddProducts || []);
    } else {
      // Cart updated via Redux
      setCart(prevCart => prevCart.filter(p => p.product !== productId));
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
        const productTotal = Number(
          basePrice + (basePrice * (product?.gst || 0)) / 100
        ) * (quantities[product.product] || 1);
        return total + productTotal;
      }, 0)
      .toFixed(2);
  };
  console.log(cart)
  return (
    <Layout>
      <div className="min-h-[50vh] p-6 bg-gray-100 dark:bg-[#111827]">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cart?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-screen text-center">
                <FiShoppingCart size={80} className="text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600">
                  Your Cart is Empty
                </h2>
                <p className="text-gray-500 mt-2">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  onClick={() => {
                    navigate("/Product");
                  }}
                  className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white border dark:bg-[#111827] border-gray-200 shadow-xl rounded-lg">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-[#111827]">
                        <th className="p-4 text-left">Image</th>
                        <th className="p-4 text-left">Product</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Price</th>
                        <th className="p-4 text-left">Quantity</th>
                        <th className="p-4 text-left">Total</th>
                        <th className="p-4 text-left">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart?.map((product) => (
                        <tr
                          key={product?.product}
                          className="border-t border-gray-200 justify-center items-center"
                        >
                          <td className="p-4">
                            <img
                              src={product?.imageUrl || product?.image[0]?.secure_url}
                              alt={product?.name}
                              className="max-w-20"
                            />
                          </td>
                          <td className="p-4 ">
                            <h2 className="text-black dark:text-white font-medium line-clamp-1">
                              {product?.name}
                            </h2>
                          </td>
                          <td className="p-4 capitalize text-gray-700 dark:text-gray-300">
                            {product?.productType || "N/A"}
                          </td>
                          <td className="p-4  ">
                            {formatPrice(
                              (product?.finalPrice || product?.price || 0) +
                                ((product?.finalPrice || product?.price || 0) * (product?.gst || 0)) / 100
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => minQuantity(product?.product, product?.sku)}
                                className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
                              >
                                &minus;
                              </button>
                              <input
                                type="text"
                                className="w-12 dark:bg-[#111827] text-center bg-white border rounded"
                                value={quantities[product.product] || 1}
                                readOnly
                              />
                              <button
                                onClick={() => SetQuantity(product.product, product?.sku)}
                                className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-4 ">
                            {formatPrice(
                              ((product?.finalPrice || product?.price || 0) +
                                ((product?.finalPrice || product?.price || 0) * (product?.gst || 0)) / 100) *
                                (quantities[product.product] || 1)
                            )}
                          </td>
                          <td className="p-4">
                            <LoadingButton
                              textSize={"py-2"}
                              message={"Removing..."}
                              width={"w-[150px]"}
                              name={"Remove"}
                              loading={loadingStates[product.product]}
                              onClick={() => ProductRemoveCard(product.product, product?.sku)}
                              color={"bg-red-500"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between flex-wrap max-sm:justify-center gap-10   mt-4 w-full items-start">
                  <button
                    onClick={() => {
                      navigate("/Product");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-400 text-white font-medium text-sm rounded-lg shadow-md hover:from-transparent hover:to-transparent hover:text-green-500 hover:border hover:border-green-400 transition-all duration-300"
                  >
                    Continue Shopping...
                  </button>

                  <div className="flex flex-col gap-4 p-4 bg-white dark:bg-[#1f2937] shadow-md rounded-lg">
                    {/* Header Section */}
                    <header className="text-gray-800 dark:text-gray-100 font-semibold text-2xl text-center">
                      Cart Total
                      <hr className="h-1 mt-2 bg-green-500 rounded-md" />
                    </header>

                    {/* Subtotal */}
                    <div className="grid grid-cols-2 items-center text-gray-700 dark:text-gray-300 font-medium text-lg">
                      <p>Subtotal:</p>
                      <p className="text-lg flex items-center">
                        {formatPrice(calculateTotalAmount())}
                      </p>
                    </div>

                    {/* Upsell Savings */}
                    {upsellSavings > 0 && (
                      <div className="grid grid-cols-2 items-center text-green-600 dark:text-green-400 font-medium text-lg">
                        <p>Upsell Savings:</p>
                        <p className="text-lg flex items-center">
                          -{formatPrice(upsellSavings)}
                        </p>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="grid grid-cols-2 items-center text-gray-700 dark:text-gray-300 font-medium text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                      <p>Total Amount:</p>
                      <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center">
                        {formatPrice(Math.max(0, calculateTotalAmount() - upsellSavings))}
                      </h1>
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          toast.error("Please login to place order");
                          return;
                        }
                        navigate("/Product/New/Order-place", {
                          state: { ...quantities },
                        });
                      }}
                      className="w-full py-3 text-lg font-medium text-white bg-gradient-to-r from-green-500 to-green-400 rounded-lg hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 transition-all duration-300"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
