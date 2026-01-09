import { MdCurrencyRupee } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { useState } from "react";
import ProfessionalShippingLabel from "./Lable";

export const OrderShow = ({
  Orders,
  Role,
  orderStats,
  setOrderId,
  setShow,
  setEditShow,
  setPaymentStatus,
  handelOrderCancel,
}) => {
  const [showPrint, setShowPrint] = useState(false);
  const [OrderPrintData, setOrderPrintData] = useState();

  const renderOrderProgress = (status) => {
    const progressWidth = {
      Processing: "40%",
      Shipping: "70%",
      Delivered: "100%",
      Canceled: "100%",
    };
    return progressWidth[status] || "10%";
  };

 
  return Orders?.map((order, index) => (
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
                setPaymentStatus(order.paymentStatus);
                setEditShow(true);
              }}
              size={26}
              className="cursor-pointer text-red-400 hover:text-red-300"
            />
            <AiOutlinePrinter
              onClick={() => (setShowPrint(true), setOrderPrintData(order))}
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
            crossOrigin="anonymous"
            src={product?.productDetails?.image?.secure_url}
            alt={product.productDetails.name}
            className="w-24 h-24 object-contain rounded"
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
            <p className="text-sm">{order.shippingAddress.name}</p>
            <p className="text-sm">
              {order.shippingAddress.address}, {order.shippingAddress.city}
            </p>
            <p className="text-sm">
              {order.shippingAddress.state}, {order.shippingAddress.postalCode}
            </p>
            <a
              className="text-sm"
              href={`tel:+${order.shippingAddress.phoneNumber}`}
            >
              {order.shippingAddress.phoneNumber}
            </a>
            <br />
            <a
              className=" text-[11px]"
              href={`mailto:${order.shippingAddress.email}`}
            >
              {order.shippingAddress.email}
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
            Order placed on {new Date(order.createdAt).toLocaleDateString()}
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
              <span className="text-blue-600 font-medium">Order placed</span>
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
      {showPrint && (
        <ProfessionalShippingLabel
          Order={OrderPrintData}
          setShowPrint={setShowPrint}
        />
      )}
    </div>
  ));
};
