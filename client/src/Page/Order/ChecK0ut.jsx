import React, { useEffect, useState } from "react";
import Layout from "../../layout/layout";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoadAccount } from "../../Redux/Slice/authSlice";
import { FaArrowLeft, FaS } from "react-icons/fa6";
import { MdCurrencyRupee } from "react-icons/md";
import toast from "react-hot-toast";
import LoadingButton from "../../constants/LoadingBtn";
import { isEmail, isPhoneNumber } from "../../helper/regexMatch";
import { PlaceOrder } from "../../Redux/Slice/OrderSlice";
import {
  AllRemoveCardProduct,
  checkInStock,
  getProduct,
  orderCountUpdate,
  updateProduct,
} from "../../Redux/Slice/ProductSlice";
import { checkPayment, paymentCreate } from "../../Redux/Slice/paymentSlice";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useTheme } from "../../Components/ThemeContext";
import FeedbackForm from "../../Components/feedbackfrom";
import FeedbackList from "../../Components/feedbackList";
import { formatPrice } from "../Product/format";
import axiosInstance from "../../helper/axiosInstance";

function CheckoutPage() {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [upsellSavings, setUpsellSavings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [UserId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const { email: Email } = useSelector((state) => state.ShopInfo);
  const ProductDetails = useLocation().state;
  const [shippingInfo, setShippingInfo] = useState({
    name: name || "",
    email: email || "",
    phoneNumber: phone || "",
    address: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showLoading, setShowLoading] = useState(true);

  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const { darkMode } = useTheme();

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const loadProfile = async () => {
    try {
      const res = await dispatch(LoadAccount());
      setUserId(res?.payload?.data?._id);

      setEmail(res?.payload?.data?.email);
      setPhone(res?.payload?.data?.phoneNumber);
      setName(res?.payload?.data?.fullName);
      if (!ProductDetails.ProductId) {
        const updatedCart = res?.payload?.data?.walletAddProducts?.map(
          (product) => {
            const productQuantity = ProductDetails[product.product] || 1;
            return { ...product, quantity: productQuantity };
          }
        );
        setCart(updatedCart || []);
        await calculateUpsellSavings(updatedCart || []);
        setShowLoading(false);
      } else {
        const res = await dispatch(getProduct(ProductDetails.ProductId));
        const product = res?.payload?.data; 

        let price = 0;
        let discount = 0;
        let sku = null;
        let variantId = null;
        let colorId = null;

        if (product.productType === "simple") {
          price = product.simpleProduct?.price || 0;
          discount = product.simpleProduct?.discount || 0;
          sku = product.simpleProduct?.sku;
        } else if (product.productType === "variant") {
          const variant = ProductDetails.variant;
          if (variant) {
            price = variant.price || 0;
            discount = variant.discount || 0;
            sku = variant.sku;
            colorId = variant._id;

            variantId = variant._id;
          } else {
            // Default to first variant
            const firstVariant = product.variants?.[0];
            if (firstVariant) {
              const firstColor = firstVariant.colors?.[0];
              if (firstColor) {
                price = firstColor.price || 0;
                discount = firstColor.discount || 0;
                sku = firstColor.sku;
                colorId = firstColor._id;
                variantId = firstColor._id;
              }
            }
          }
        } else if (product.productType === "bundle") {
      
         
          price = product.bundleProducts?.price || 0;
          discount = product.bundleProducts?.discount || 0;
          sku = product.bundleProducts?.sku;
        }

        const data = {
          addedAt: new Date().toISOString(),
          description: product?.description || "No description available",
          image: product.images || [],
          name: product?.name || "Unknown Product",
          price,
          gst: product?.gst || 0,
          discount,
          sku,
          variantId,
          colorId,
          product: product?._id || "",
          quantity: ProductDetails?.quantity || 1,
          _id: product?._id || "",
          productType: product.productType,
        };
        setCart([data]);
        await calculateUpsellSavings([data]);
        setShowLoading(false);
      }
    } catch (error) {
      console.error("Error in loadProfile:", error);
      setShowLoading(false);
    }
  };

  const calculateUpsellSavings = async (cartItems) => {
    if (cartItems.length === 0) {
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

  const calculateTotalAmount = () => {
    return cart
      .reduce((total, product) => {
        const productTotal = Number(product.price) * product.quantity;
        return total + productTotal;
      }, 0)
      .toFixed(2);
  };
  const handelUserInput = (e) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
  };

  const handelPlaceOrder = async () => {
    setError(false);
    setLoading(true);
    if (
      !shippingInfo.name ||
      !shippingInfo.phoneNumber ||
      !shippingInfo.address ||
      !shippingInfo.email ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.country ||
      !shippingInfo.postalCode
    ) {
      setError(true);
      setLoading(false);
      setMessage("All  Field  is mandatory To Order ....");
      return;
    }

    if (!isPhoneNumber(shippingInfo.phoneNumber)) {
      setLoading(false);
      setMessage(" Invalid Phone Number....");
      return;
    }

    if (!isEmail(shippingInfo.email)) {
      setLoading(false);
      setMessage("Invalid email....");

      return;
    }

    if (!UserId) {
      setLoading(false);
      setMessage("Something want Wrong try again..");
      return;
    }

    for (const product of cart) {
      const res = await dispatch(checkInStock({ productId: product.product, sku: product.sku }));
      if (!res?.payload?.success) {
        setError(true);
        setLoading(false);
        setMessage(res?.payload?.message);
        return;
      }
    }

    if (paymentMethod === "razorpay") {
      setLoading(false);

      try {
        setLoading(true);
        const orderResponse = await dispatch(paymentCreate(totalPrice));
        if (!orderResponse?.payload?.success) {
          setError(true);
          setMessage("Something went wrong");
          return;
        }
        const { orderId, currency, amount } = orderResponse?.payload;
        const options = {
          key: "rzp_live_5kArCGfhMWUBe7",
          amount,
          currency,
          name: "Kgs Doors",
          description: "Order Description",
          order_id: orderId,
          handler: async function (response) {
            const res = await dispatch(checkPayment(response));

            if (res?.payload?.success) {
              setError(false), OrderPlaceNew("Completed");
            } else {
              setError(true),
                setLoading(false),
                setMessage("Payment is Fail, please try again..");
            }
          },
          prefill: {
            name: shippingInfo.name,
            email: shippingInfo.email,
            contact: shippingInfo.phoneNumber,
          },
          theme: {
            color: ` ${darkMode ? `#111827` : `#F37254`}`,
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        setError(true);
        setMessage("Error processing payment");
      } finally {
        setLoading(false);
      }
    } else {
      OrderPlaceNew("Pending");
    }

    async function OrderPlaceNew(paymentStatus) {
      setShowLoading(true);
      const orderData = {
        userId: UserId,
        products: cart,
        shippingAddress: shippingInfo,
        paymentStatus: paymentStatus,
        PaymentMethod: paymentMethod,
        totalAmount: totalPrice,
        email: Email || "kgsdoors123@gmail.com",
      };

      const res = await dispatch(PlaceOrder(orderData));
      setLoading(false);
      setError(false);
      if (res?.payload?.success) {
        await dispatch(AllRemoveCardProduct(UserId));
        for (const product of cart) {
          await dispatch(
            orderCountUpdate({
              id: product.product,
              data: {
                orderCount: product.quantity,
              },
            })
          );
        }
        loadProfile();
        setShowLoading(false);
        navigate("/ThankYou", {
          state: { data: res?.payload?.data },
          replace: true,
        });
      }
    }
  };
  const calculateProductDetails = (product) => {
    const gstPercent = Number(product.gst) || 0;
    const basePrice = product.price * product.quantity;
    const gst = (basePrice * gstPercent) / 100;
    const totalPriceWithGst = basePrice + gst;

    const discountPercent = Number(product.discount) || 0;
    const discount = (totalPriceWithGst * discountPercent) / 100;

    const finalPrice = totalPriceWithGst - discount;

    return {
      gst,
      basePrice: totalPriceWithGst,
      discount,
      finalPrice,
      totalPrice: finalPrice,
    };
  };
  const calculateCartTotal = (cart) =>
    cart.reduce((acc, product) => {
      const { totalPrice } = calculateProductDetails(product);
      const TotalPrice = acc + totalPrice;
      return TotalPrice;
    }, 0);
  useEffect(() => {
    calculateUpsellSavings(cart);
  }, [cart]);

  useEffect(() => {
    if (calculateTotalAmount) {
      const subtotal = calculateCartTotal(cart);
      setTotalPrice(Math.max(0, subtotal - upsellSavings).toFixed(2));
    }
  }, [cart, upsellSavings]);

  useEffect(() => {
    loadProfile();
    if (!ProductDetails) {
      navigate(-1);
    }
  }, [ProductDetails]);
  useEffect(() => {
    setShippingInfo({
      ...shippingInfo,
      name: name,
      email: email,
      phoneNumber: phone,
    });
  }, [name, email, phone]);
  return (
    <Layout>
      {showLoading && (
        <div
          className="flex flex-col items-center justify-center min-h-screen bg-gray-100  dark:bg-gray-900 
          fixed inset-0  bg-opacity-30 z-10
          "
        >
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          <p>
            {" "}
            {loading
              ? "Please wait, your order is being placed..."
              : "Loading..."}
          </p>
        </div>
      )}
      <div className="pb-10 ">
        {error && (
          <div className="flex  z-20  items-center gap-10 fixed bg-red-200   w-full mx-2 border-2 border-red-500 text-red-500 font-medium p-3">
            <p>{message}</p>
            <IoCloseCircleOutline
              size={20}
              className=" cursor-pointer"
              onClick={() => setError(false)}
            />
          </div>
        )}
        <h1
          onClick={() => navigate("/Cart")}
          className="flex items-center text-xl cursor-pointer hover:text-blue-500"
        >
          <FaArrowLeft className="ml-5 p-2  m-2" size={36} /> <span>Edit</span>
        </h1>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-1/2 px-4 mb-5 md:mb-0">
              <h2 className="text-2xl mb-3 font-bold dark:text-white text-black">
                Billing Details
              </h2>
              <div className="p-5 border dark:bg-[#111827]  bg-white">
                {/* Country Selection */}
                <div className="mb-4">
                  <label
                    htmlFor="country"
                    className="block dark:text-white text-black"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={handelUserInput}
                    value={shippingInfo.country}
                    name="country"
                    id="country"
                    autoComplete="country"
                    className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                  />
                </div>

                <div className="flex flex-wrap mb-4">
                  <div className="w-full pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="name"
                      className="block dark:text-white text-black"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      onChange={handelUserInput}
                      value={shippingInfo.name}
                      name="name"
                      id="name"
                      autoComplete="name"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block dark:text-white text-black"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={handelUserInput}
                    value={shippingInfo.address}
                    id="address"
                    name="address"
                    autoComplete="address-line1"
                    placeholder="Street address"
                    className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    name="address2"
                    onChange={handelUserInput}
                    value={shippingInfo.address2}
                    autoComplete="address-line2"
                    placeholder="Apartment, suite, unit etc. (optional)"
                    className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                  />
                </div>

                <div className="flex flex-wrap mb-4">
                  <div className="w-full md:w-1/2 pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="city"
                      className="block dark:text-white text-black"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.city}
                      name="city"
                      type="text"
                      id="city"
                      autoComplete="address-level2"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="state"
                      className="block dark:text-white text-black"
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.state}
                      name="state"
                      type="text"
                      id="state"
                      autoComplete="address-level1"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pl-2">
                    <label
                      htmlFor="postalCode"
                      className="block dark:text-white text-black"
                    >
                      Postal / Zip <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      onChange={handelUserInput}
                      value={shippingInfo.postalCode}
                      name="postalCode"
                      id="postalCode"
                      autoComplete="postal-code"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-5">
                  <div className="w-full md:w-1/2 pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="email"
                      className="block dark:text-white text-black"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.email}
                      name="email"
                      type="email"
                      id="email"
                      autoComplete="email"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pl-2">
                    <label
                      htmlFor="phoneNumber"
                      className="block dark:text-white text-black"
                    >
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.phoneNumber}
                      name="phoneNumber"
                      type="tel"
                      id="phoneNumber"
                      autoComplete="tel"
                      placeholder="Phone Number"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white border p-2 rounded"
                    />
                  </div>
                </div>

                {/* Create Account Checkbox */}
              </div>
            </div>

            <div className="w-full md:w-1/2 px-4">
              <div className="mb-5 sm:sticky top-6">
                <h2 className="text-2xl mb-3 font-bold dark:text-white text-black">
                  Your Order
                </h2>
                <div className="p-5 border bg-white dark:bg-[#111827] rounded-lg shadow-md overflow-x-auto">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                    Order Summary
                  </h2>
                  <table className="table-auto w-full mb-5 border-collapse border border-gray-300 rounded-lg">
                    <thead className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="p-4 text-center border border-gray-300">
                          Product
                        </th>
                        <th className="p-4 text-center border border-gray-300">
                          Type
                        </th>
                        <th className="p-4 text-center border border-gray-300">
                          Price
                        </th>
                        <th className="p-4 text-center border border-gray-300">
                          Discount
                        </th>
                        <th className="p-4 text-center border border-gray-300">
                          Final Price
                        </th>
                        <th className="p-4 text-center border border-gray-300">
                          Quantity
                        </th>
                        <th className="p-4 text-center border border-gray-300">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300">
                      {cart.map((product) => {
                        const {
                          gst,
                          basePrice,
                          discount,
                          finalPrice,
                          totalPrice,
                        } = calculateProductDetails(product);

                        return (
                          <tr
                            key={product.product}
                            className="border-t border-gray-300"
                          >
                            <td className="text-center line-clamp-1 ">
                              {product.name}
                            </td>
                            <td className="text-center capitalize">
                              {product.productType || "N/A"}
                            </td>
                            <td className="text-center">
                              {formatPrice(basePrice)}
                            </td>
                            <td className="text-center">
                              {product?.discount > 0
                                ? formatPrice(discount)
                                : "-"}
                            </td>
                            <td className="text-center">
                              {formatPrice(finalPrice)}
                            </td>
                            <td className="text-center">{product.quantity}</td>
                            <td className="text-center">
                              {formatPrice(totalPrice)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="mb-5">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Payment Method:
                    </h3>
                    <div className="flex items-center mb-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "razorpay"}
                        value="razorpay"
                        id="razorpay"
                        onChange={handlePaymentMethodChange}
                        className="h-4 w-4 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="razorpay"
                        className="text-sm font-medium pl-2 text-gray-700 dark:text-gray-300"
                      >
                        PhonePay, Paytm, Google Pay, and Other...
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "cash on Delivery"}
                        value="cash on Delivery"
                        id="cash_on_Delivery"
                        onChange={handlePaymentMethodChange}
                        className="h-4 w-4 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="cash_on_Delivery"
                        className="text-sm font-medium pl-2 text-gray-700 dark:text-gray-300"
                      >
                        Cash on Delivery
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-lg w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {formatPrice(calculateCartTotal(cart).toFixed(2))}
                      </span>
                    </div>

                    {upsellSavings > 0 && (
                      <div className="text-lg w-full flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-green-700 dark:text-green-300">Upsell Savings:</span>
                        <span className="text-green-600 dark:text-green-400">
                          -{formatPrice(upsellSavings)}
                        </span>
                      </div>
                    )}

                    <div className="text-xl w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-semibold">
                      <span className="text-gray-800 dark:text-gray-200">Total Price:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {formatPrice(Math.max(0, calculateCartTotal(cart) - upsellSavings).toFixed(2))}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <LoadingButton
                      textSize={"py-2"}
                      onClick={() => handelPlaceOrder()}
                      color={"bg-green-500 hover:bg-green-600"}
                      message={"wait!..."}
                      loading={loading}
                      name={"Place Order"}
                      disabled={!paymentMethod || cart.length === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* feedback section */}
        <div className="w-full  ">
          <hr className="h-1 bg-slate-200" />
          <h1 className="text-2xl font-bold mb-4 ml-10 text-start dark:text-white text-black">
            feedback Section
          </h1>
          <FeedbackForm />
          <FeedbackList />
        </div>
      </div>
    </Layout>
  );
}

export default CheckoutPage;
