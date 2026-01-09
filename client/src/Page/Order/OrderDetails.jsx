import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { getOrder, getOrderById } from "../../Redux/Slice/OrderSlice";

const OrderDetails = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = pathname.split("/").pop();

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await dispatch(getOrderById(orderId));
      setOrderDetails(data?.payload?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Failed: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 select-none">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Order Details
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Order #{orderDetails._id}
            </p>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(orderDetails.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    orderDetails.orderStats
                  )}`}
                >
                  {orderDetails.orderStats}
                </span>
              </div>
            </div>

            {/* Products List */}
            <div className="border rounded-lg  overflow-x-scroll ">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderDetails.products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <img
                          src={product.productDetails.image.secure_url}
                          alt={product.productDetails.name}
                          className="w-20"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productDetails.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ₹{product.productDetails.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ₹{(product.price * product.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Total */}
            <div className="mt-6 border-t border-gray-200 pt-6 flex flex-col gap-5">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total Amount</p>
                <p>₹{orderDetails.totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>payment Status</p>
                <span
                  className={`${getStatusColor(
                    orderDetails.paymentStatus
                  )} p-2 rounded-xl`}
                >
                  {orderDetails.paymentStatus}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Shipping Address
              </h3>
              <address className="text-gray-600 not-italic">
                <p>{orderDetails.shippingAddress.name}, </p>
                <p> {orderDetails.shippingAddress.phoneNumber}</p>
                <p> {orderDetails.shippingAddress.email}</p>
                <p>
                  {orderDetails.shippingAddress.address},{" "}
                  {orderDetails.shippingAddress.city}
                </p>
                <p>
                  {orderDetails.shippingAddress.state},{" "}
                  {orderDetails.shippingAddress.country},{" "}
                  {orderDetails.shippingAddress.postalCode}
                </p>
              </address>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
