import { useEffect, useState } from "react";
import {
  AllOrder,
  CancelOrder,
  getOrder,
  UpdateOrder,
} from "../Redux/Slice/OrderSlice";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit } from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { MdCurrencyRupee } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import ProfessionalShippingLabel from "./Lable";
import LoadingButton from "../constants/LoadingBtn";
import { isEmail, isPhoneNumber } from "../helper/regexMatch";

export const OrderCart = ({ order }) => {
  const dispatch = useDispatch();
  const [OrderId, setOrderId] = useState();
  const [OrderData, setOrderData] = useState([]);
  const [orderStats, setOrderStatus] = useState([]);
  const [PaymentStatus, setPaymentStatus] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [showPrint, setShowPrint] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [OrderPrintData, setOrderPrintData] = useState();
  const [show, setShow] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });
  const [newDate, setNewDate] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const { role: Role, data } = useSelector((state) => state.auth);

  const [PaymentData, setPaymentData] = useState({
    name: "",
    amount: 0,
    paymentStatus: null,
    PaymentDate: null,
  });
  const [orderStatus, setORDERStatus] = useState(null);

  const handelEditInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPaymentData({
      ...PaymentData,
      [name]: value,
    });

    if (name == "paymentStatus") return;
    document.getElementById(name).style.borderColor = "";
  };

  async function loadOrders() {
    setLoadingData(true);

    const res = await dispatch(getOrder(data._id));
    if (res?.payload?.success) setOrderData(res?.payload?.data);
    setLoadingData(false);
  }
  const handelOrderCancel = async (id) => {
    if (orderStats[OrderId] === "Delivered") {
      toast.error("You cannot cancel a delivered order.");
      return;
    }

    if (!id) {
      setLoading(false);
      toast.error("Something went wrong. Try again.");
      return;
    }

    const res = await dispatch(CancelOrder(id));
    setLoading(false);
    setShow(false);
    if (res?.payload?.success) {
      loadOrders();
    }
  };
  const trackingOrder = () => {
    const statusMap = OrderData?.reduce((acc, Order) => {
      acc[Order._id] = Order.orderStats;
      return acc;
    }, {});
    setOrderStatus(statusMap);
  };
  const trackingDeliveryDate = () => {
    const statusMap = OrderData?.reduce((acc, Order) => {
      acc[Order._id] = Order.deliveryDate;
      return acc;
    }, {});
    setSelectedDate(statusMap);
  };
  const trackingPayments = () => {
    const statusMap = OrderData?.reduce((acc, Order) => {
      acc[Order._id] = Order.paymentStatus;
      return acc;
    }, {});
    setPaymentStatus(statusMap);
  };

  const handelUserInput = (e) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
  };

  const handelPlaceOrder = async () => {
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
      toast.error("All  Field  is mandatory To Order ....");
      setLoading(false);
      return;
    }

    if (!isPhoneNumber(shippingInfo.phoneNumber)) {
      setLoading(false);
      toast.error(" Invalid Phone Number....");
      return;
    }

    if (!isEmail(shippingInfo.email)) {
      setLoading(false);
      toast.error("Invalid email....");

      return;
    }

    if (!data._id) {
      setLoading(false);
      toast.error("Something want Wrong try again..");
      return;
    }
    const orderData = {
      shippingAddress: shippingInfo,
    };
    const res = await dispatch(UpdateOrder({ id: OrderId, data: orderData }));
    setLoading(false);
    setShow(false);
    setShippingInfo({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      address2: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    });
    if (res?.payload?.success) {
      loadOrders();
    }
  };

  const handleOrderUpdate = async (id) => {
    if (orderStatus == "Delivered" && PaymentStatus[id] !== "Completed") {
      toast.error("Payment must be completed before updating the order.");
      setORDERStatus(null);
      return;
    }

    if (!id) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    if (newDate !== null) {
      setUpdating(true);
      const res = await dispatch(
        UpdateOrder({ id, data: { deliveryDate: newDate } })
      );
      setUpdating(false);
      setNewDate(null);
      if (res?.payload?.success) {
        toast.success("deliveryDate updated successfully!");
        setOrderData((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, ...res?.payload?.data } : order
          )
        );
        trackingDeliveryDate();
        return;
      }
    }
    if (PaymentData.paymentStatus !== null) {
      if (PaymentData.paymentStatus == "Completed") {
        setPaymentData({
          ...PaymentData,
          PaymentDate: Date.now(),
        });
        if (!PaymentData.name) {
          document.getElementById("name").style.borderColor = "red";
          return;
        }
        if (!PaymentData.PaymentDate) {
          setPaymentData({
            ...PaymentData,
            PaymentDate: Date.now(),
          });
        }
        if (PaymentData.amount == 0) {
          document.getElementById("amount").style.borderColor = "red";
          return;
        }
        setUpdating(true);
        const res = await dispatch(UpdateOrder({ id, data: PaymentData }));
        setUpdating(false);
        setPaymentData({
          name: "",
          amount: 0,
          paymentStatus: "",
          PaymentDate: null,
        });
        if (res?.payload?.success) {
          toast.success("Payment Status updated successfully!");
          setOrderData((prevOrders) =>
            prevOrders.map((order) =>
              order._id === id ? { ...order, ...res?.payload?.data } : order
            )
          );
          trackingPayments();
        } else {
          toast.error(
            res?.payload?.message || "Failed to update payment status."
          );
        }
      } else {
        setUpdating(true);
        const res = await dispatch(UpdateOrder({ id, data: PaymentData }));
        setUpdating(false);
        setPaymentData({
          name: "",
          amount: 0,
          paymentStatus: "",
          PaymentDate: null,
        });
        if (res?.payload?.success) {
          toast.success("Payment Status updated successfully!");
          setOrderData((prevOrders) =>
            prevOrders.map((order) =>
              order._id === id ? { ...order, ...res?.payload?.data } : order
            )
          );
          trackingPayments();
        } else {
          toast.error(
            res?.payload?.message || "Failed to update payment status."
          );
        }
      }
    }

    if (orderStatus !== null) {
      if (orderStatus == "Delivered") {
        setUpdating(true);
        const res = await dispatch(
          UpdateOrder({
            id,
            data: { orderStatus: orderStatus, deliveryDate: Date.now() },
          })
        );
        setUpdating(false);
        if (res?.payload?.success) {
          toast.success("Order Status updated successfully!");
          setOrderData((prevOrders) =>
            prevOrders.map((order) =>
              order._id === id ? { ...order, ...res?.payload?.data } : order
            )
          );
          trackingOrder();
        } else {
          toast.error(
            res?.payload?.message || "Failed to update order status."
          );
        }
      }
      setUpdating(true);
      const res = await dispatch(
        UpdateOrder({ id, data: { orderStatus: orderStatus } })
      );
      setUpdating(false);
      if (res?.payload?.success) {
        toast.success("Order Status updated successfully!");
        setOrderData((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, ...res?.payload?.data } : order
          )
        );
        trackingOrder();
      } else {
        toast.error(res?.payload?.message || "Failed to update order status.");
      }
    }
  };
  const renderOrderProgress = (status) => {
    const progressWidth = {
      Processing: "40%",
      Shipping: "70%",
      Delivered: "100%",
      Canceled: "100%",
    };
    return progressWidth[status] || "10%";
  };

  useEffect(() => {
    if (order) {
      if (["ADMIN", "AUTHOR"].includes(Role)) {
        setOrderData(order);
        setLoadingData(false);
        return;
      }
    }
    loadOrders();
  }, [data._id]);
  useEffect(() => {
    trackingOrder();
    trackingDeliveryDate();
    trackingPayments();
  }, [OrderData]);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const handleFilterChange = (e) => {
    setSelectedStatus(e.target.value);
  };
  // Filter the order statuses based on the selected value
  const filteredOrders =
    selectedStatus === "All"
      ? OrderData
      : OrderData.filter((order) => orderStats[order._id] === selectedStatus);
  if (loadingData) {
    return (
      <div className="flex flex-col w-full justify-center items-center mt-10">
        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
        <p className="mt-4 text-gray-700 dark:text-white">
          Loading data, please wait...
        </p>
      </div>
    );
  }
  return (
    <div className=" flex  flex-col justify-center">
      <select
        onChange={handleFilterChange}
        value={selectedStatus}
        className="text-center my-10 max-w-xs:my-2 w-44 mx-auto bg-white dark:bg-gray-900  border"
      >
        <option value="All">All</option>
        <option value="Processing">Processing</option>
        <option value="Shipping">Shipping</option>
        <option value="Delivered">Delivered</option>
        <option value="Canceled">Canceled</option>
      </select>{" "}
      <div className="flex flex-wrap gap-1">
        {filteredOrders?.length == 0 ? (
          <div className="flex justify-center w-full items-center gap-10 mt-2 flex-col mb-10">
            <h1 className="text-center dark:text-white"> NO order....</h1>
            {!["ADMIN", "AUTHOR"].includes(Role) && (
              <button
                onClick={() => {
                  navigate("/AllProduct");
                }}
                className="px-3 dark:text-white font-medium py-2 bg-green-400 w-1/2 rounded-sm hover:bg-transparent hover:border-2 border-green-400"
              >
                Continue Shopping...
              </button>
            )}
          </div>
        ) : (
          filteredOrders?.map((order, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#111827] sm:w-[45%] dark:text-white shadow-[0_0_2px_black] mt-2 rounded-lg p-6 max-w-2xl mx-auto mb-4 flex flex-col"
            >
              <h2 className="text-lg flex justify-between dark:text-white font-semibold mb-4 max-sm:text-sm gap-2">
                Order ID: {order._id}
                {orderStats[order._id] === "Canceled" ? (
                  <p className="text-red-500 text-sm cursor-pointer hover:underline">
                    Canceled
                  </p>
                ) : Role == "ADMIN" || Role == "AUTHOR" ? (
                  <div className="flex gap-1">
                    <FiEdit
                      onClick={() => {
                        setOrderId(order._id);
                        setEditShow(true);
                      }}
                      size={26}
                      className="cursor-pointer text-red-400 hover:text-red-300"
                    />
                    <AiOutlinePrinter
                      onClick={() => (
                        setShowPrint(true), setOrderPrintData(order)
                      )}
                      size={26}
                      className="text-blue-500 cursor-pointer"
                    />
                  </div>
                ) : (
                  <p
                    className="text-red-500 text-sm cursor-pointer hover:underline"
                    onClick={() => handelOrderCancel(order._id)}
                  >
                    Cancel
                  </p>
                )}
              </h2>
              {/* Products Section */}
              {order.products.map((product, productIndex) => (
                <div key={productIndex} className="flex space-x-4 mb-4">
                  <img
                    title="product"
                    onClick={() =>
                      window.open(`/product/${product.product}`, "_blank")
                    }
                    src={product?.productDetails?.image?.secure_url}
                    alt={product.productDetails.name}
                    className="w-24 h-24 object-contain rounded cursor-pointer"
                  />
                  <div>
                    <h2 className="text-lg font-semibold dark:text-white">
                      {product.productDetails.name}
                    </h2>
                    <p className="text-gray-500 dark:text-white flex items-center">
                      <MdCurrencyRupee />
                      {product.productDetails.price.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-sm dark:text-white">
                      Quantity: {product.quantity}
                    </p>
                    <p className="mt-2 text-gray-700 dark:text-white w-[100px] line-clamp-1">
                      {product.productDetails.description}
                    </p>
                  </div>
                </div>
              ))}
              {/* Delivery and Order Details */}
              <div className="mt-6 sm:grid grid-cols-2 gap-4 dark:text-white">
                <div>
                  <h3 className="text-sm font-bold mb-2 dark:text-white">
                    Delivery Address
                  </h3>
                  <div className="text-gray-700 max-sm:py-3 dark:text-white">
                    <p className="text-sm">{order.shippingAddress?.name}</p>
                    <p className="text-sm">
                      {order.shippingAddress?.address},{" "}
                      {order.shippingAddress?.city}
                    </p>
                    <p className="text-sm">
                      {order.shippingAddress?.state},{" "}
                      {order.shippingAddress?.postalCode}
                    </p>
                    <a
                      className="text-sm"
                      href={`tel:+${order.shippingAddress?.phoneNumber}`}
                    >
                      {order.shippingAddress?.phoneNumber}
                    </a>
                    <br />
                    <a
                      className=" text-[11px]"
                      href={`mailto:${order.shippingAddress?.email}`}
                    >
                      {order.shippingAddress?.email}
                    </a>

                    {Role === "USER" && (
                      <p
                        onClick={() => {
                          setOrderId(order._id);
                          setShow(true);
                        }}
                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                      >
                        Edit
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-2 dark:text-white">
                    Order Details
                  </h3>
                  <p className="text-gray-700 dark:text-white">
                    Payment Method: {order.PaymentMethod}
                  </p>
                  <p className="text-gray-700 dark:text-white flex items-center">
                    Total Amount: <MdCurrencyRupee />
                    {order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-gray-700 dark:text-white">
                    Status: {order.orderStats}
                  </p>
                  <p className="text-gray-700 dark:text-white">
                    Payment Status: {order.paymentStatus}
                  </p>
                </div>
              </div>
              {/* Order Progress */}
              <div className="mt-6">
                <div className="flex justify-between">
                  <h3 className="text-sm text-gray-600 mb-2 dark:text-white">
                    Order placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </h3>
                  <h3 className="text-sm text-gray-600 mb-2 dark:text-white">
                    Order Delivery on{" "}
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </h3>
                </div>
                {orderStats[order._id] === "Canceled" ? (
                  <p className="text-red-500 text-sm font-semibold text-center">
                    This order has been canceled.
                  </p>
                ) : (
                  <div>
                    <div className="w-full bg-gray-200 dark:bg-black h-1 rounded-full">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{
                          width: renderOrderProgress(orderStats[order._id]),
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2 dark:text-white">
                      <span className="text-blue-600 font-medium">
                        Order placed
                      </span>
                      <span
                        className={`${
                          orderStats[order._id] === "Processing" ||
                          orderStats[order._id] === "Shipping" ||
                          orderStats[order._id] === "Delivered"
                            ? "text-blue-600"
                            : "text-black dark:text-white"
                        } font-medium`}
                      >
                        Processing
                      </span>
                      <span
                        className={`${
                          orderStats[order._id] === "Shipping" ||
                          orderStats[order._id] === "Delivered"
                            ? "text-blue-600"
                            : "text-black dark:text-white"
                        } font-medium`}
                      >
                        Shipped
                      </span>
                      <span
                        className={`${
                          orderStats[order._id] === "Delivered"
                            ? "text-blue-600"
                            : "text-black dark:text-white"
                        } font-medium mb-5`}
                      >
                        Delivered
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {editShow && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 dark:bg-opacity-80 z-50">
            <div className="bg-white dark:bg-[#1f2937] dark:text-white w-[90%] max-w-lg p-6 rounded-lg shadow-lg">
              {/* Close Button */}
              <div className="flex justify-start">
                <button
                  onClick={() => setEditShow(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-red-500 focus:ring-2 focus:ring-red-300 p-2 rounded-lg"
                  aria-label="Close"
                >
                  <FaArrowLeft size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="mt-4 space-y-6">
                {orderStats[OrderId] === "Delivered" && (
                  <p className="text-center text-red-400">
                    The order has been delivered. No further updates are
                    allowed.
                  </p>
                )}

                {/* If Order is Canceled */}
                {orderStats[OrderId] === "Canceled" ? (
                  <p className="text-red-500 text-lg font-semibold text-center">
                    This order has been canceled.
                  </p>
                ) : Role === "AUTHOR" || Role === "ADMIN" ? (
                  // Author or Admin Controls
                  <div className="space-y-6">
                    {/* Change Order Status */}
                    <div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Change Order Status
                      </p>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={orderStatus || orderStats[OrderId]}
                        onChange={(e) => setORDERStatus(e.target.value)}
                        disabled={
                          orderStats[OrderId] === "Canceled" ||
                          orderStats[OrderId] === "Delivered"
                        }
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipping">Shipping</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Change Delivery Date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={
                          newDate ||
                          (selectedDate[OrderId] &&
                          !isNaN(new Date(selectedDate[OrderId]))
                            ? new Date(selectedDate[OrderId])
                                .toISOString()
                                .split("T")[0]
                            : "")
                        }
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                    {/* Change Payment Status */}
                    <div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Change Payment Status
                      </p>

                      {/* Payment Status Dropdown */}
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={
                          PaymentData.paymentStatus || PaymentStatus[OrderId]
                        }
                        name="paymentStatus"
                        onChange={handelEditInput}
                        disabled={
                          PaymentStatus[OrderId] === "Completed" ||
                          PaymentStatus[OrderId] === "Failed"
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                      </select>

                      {/* Input for Payment Name */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiver Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                          placeholder="Enter payment name"
                          value={PaymentData.name}
                          onChange={handelEditInput}
                        />
                      </div>

                      {/* Input for Payment Amount */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receive Payment
                        </label>
                        <input
                          id="amount"
                          name="amount"
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                          placeholder="Enter payment amount"
                          value={PaymentData.amount}
                          onChange={handelEditInput}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => handelOrderCancel(OrderId)}
                    className="text-red-500 text-lg font-semibold text-center cursor-pointer hover:underline"
                  >
                    Cancel Order
                  </p>
                )}
              </div>
              <div className="mt-6">
                <button
                  disabled={updating}
                  onClick={() => handleOrderUpdate(OrderId)}
                  className="w-full bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-300"
                >
                  {updating ? "Updating.." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showPrint && (
          <ProfessionalShippingLabel
            Order={OrderPrintData}
            setShowPrint={setShowPrint}
          />
        )}
        {show && (
          <div className="fixed inset-0 flex  overflow-y-auto  justify-center dark:bg-[#111827]   items-center bg-gray-800 bg-opacity-50 z-50">
            <div className=" px-4 mb-5 md:mb-0 sm:my-10  max-sm:h-[90%]  ">
              <h2 className="text-2xl mb-3 font-bold text-black dark:text-white">
                Billing Details
              </h2>

              <div className="p-5 border bg-white dark:bg-[#111827] ">
                <button
                  onClick={() => setShow(false)}
                  className=" text-black  dark:text-white px-2  flex text-2xl rounded-lg"
                >
                  <FaArrowLeft size={20} />
                </button>
                {/* Country Selection */}
                <div className="mb-4">
                  <label
                    htmlFor="country"
                    className="block text-black dark:text-white"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={handelUserInput}
                    value={shippingInfo.country}
                    name="country"
                    id="country"
                    className="form-control mt-1 w-full dark:bg-[#111827] bg-white   border p-2 rounded"
                  />
                </div>

                <div className="flex flex-wrap mb-4">
                  <div className="w-full  pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="name"
                      className="block text-black dark:text-white"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      onChange={handelUserInput}
                      value={shippingInfo.name}
                      name="name"
                      id="name"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white  border p-2 rounded"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label
                    htmlFor="c_address"
                    className="block text-black dark:text-white"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={handelUserInput}
                    value={shippingInfo.address}
                    id="address"
                    name="address"
                    placeholder="Street address"
                    className="form-control mt-1 w-full dark:bg-[#111827] bg-white  border p-2 rounded"
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    name="address2"
                    onChange={handelUserInput}
                    value={shippingInfo.address2}
                    placeholder="Apartment, suite, unit etc. (optional)"
                    className="form-control mt-1 w-full dark:bg-[#111827]bg-white   border p-2 rounded"
                  />
                </div>

                <div className="flex flex-wrap mb-4">
                  <div className="w-full md:w-1/2 pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="city"
                      className="block text-black dark:text-white"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.city}
                      name="city"
                      type="text"
                      id="city"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white   border p-2 rounded"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="state"
                      className="block text-black dark:text-white"
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.state}
                      name="state"
                      type="text"
                      id="state"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white  border p-2 rounded"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pl-2">
                    <label
                      htmlFor="postalCode"
                      className="block text-black dark:text-white"
                    >
                      Postal / Zip <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      onChange={handelUserInput}
                      value={shippingInfo.postalCode}
                      name="postalCode"
                      id="postalCode"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white   border p-2 rounded"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap mb-5">
                  <div className="w-full md:w-1/2 pr-2 mb-4 md:mb-0">
                    <label
                      htmlFor="email"
                      className="block text-black dark:text-white"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.email}
                      name="email"
                      type="email"
                      id="email"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white  border p-2 rounded"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pl-2 mb-2">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-black dark:text-white"
                    >
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      onChange={handelUserInput}
                      value={shippingInfo.phoneNumber}
                      name="phoneNumber"
                      type="number"
                      id="phoneNumber"
                      placeholder="Phone Number"
                      className="form-control mt-1 w-full dark:bg-[#111827] bg-white   border p-2 rounded"
                    />
                  </div>
                  <LoadingButton
                    onClick={() => {
                      handelPlaceOrder();
                    }}
                    color={"bg-green-500"}
                    name={"Update.."}
                    message={"Updating..."}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
