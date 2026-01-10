import React, { useEffect } from "react";
import Layout from "../../layout/layout";
import { useLocation, useNavigate } from "react-router-dom";
import { MdCurrencyRupee } from "react-icons/md";
import FeedbackForm from "../../Components/feedbackfrom";
import FeedbackList from "../../Components/feedbackList";
import { formatPrice } from "../Product/format";

const ThankYou = () => {
  const { state } = useLocation();
  const data = state?.data;
  const navigate = useNavigate();
  useEffect(() => {
    if (!data || data == undefined) {
      navigate(-1);
    }
  }, []);

  return (
    <Layout>
      <div className="bg-gray-100 dark:bg-[#1F2937] flex flex-col justify-center items-center w-full ">
        <div className=" w-full   p-6">
          {/* Thank You Message */}
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Thank you. Your order has been received.
          </h1>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-gray-700 dark:text-white">
                <strong>Order Id:</strong> {data._id}
              </div>
              <div className="text-gray-700 dark:text-white">
                <strong>Date:</strong> {data.createdAt}
              </div>
              <div className="text-gray-700 dark:text-white flex items-center">
                <strong>Total:</strong>
                <p className="font-medium">{formatPrice(data.totalAmount)}/-</p>
              </div>
              <div className="text-gray-700 dark:text-white">
                <strong>Payment Method:</strong> {data.PaymentMethod}
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Order Details
          </h2>
          {data.products.map((product, ind) => {

            return (
              
              <div key={ind} className="mb-6">
               
                <h1 className="pl-4 py-2 font-bold">Order #{ind + 1}</h1>
                <table
                  key={ind}
                  className="w-full border-collapse border border-gray-300 mb-6"
                >
                  <thead>
                    <tr className="bg-gray-200 text-gray-800">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Product
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border  font-bold border-gray-300 px-4 py-2">
                        {product.productDetails.name} × {product.quantity}
                      </td>
                      <td className="border font-bold border-gray-300 px-4 py-2 text-right">
                        {formatPrice(product.finalPrice || product.productDetails.price)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        Subtotal:
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                        {formatPrice((product.finalPrice || product.productDetails.price) * product.quantity)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        paymentStatus:
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-right">
                        {data.paymentStatus}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        Payment Method:
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-bold text-right">
                        {data.PaymentMethod}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Billing Address */}
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Billing Address
          </h2>

          <div className="text-gray-700 dark:text-white">
            <div>
              <strong>{data.shippingAddress.name}</strong>
            </div>
            <p>{data.shippingAddress.address}</p>
            <p>
              {data.shippingAddress.state}, {data.shippingAddress.postalCode}
            </p>
            <p>
              {data.shippingAddress.state}, {data.shippingAddress.country}
            </p>
            <p>📞 {data.shippingAddress.phoneNumber}</p>
            <p>📧 {data.shippingAddress.email}</p>
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
};

export default ThankYou;
