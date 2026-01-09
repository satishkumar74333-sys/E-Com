import React from "react";
import { FaCircleXmark } from "react-icons/fa6";

const PriceCart = ({
  price,
  gst,
  discount,
  ShowPrice,
  setShowPrice,
  handelUploadProduct,
}) => {
  const gstAmount = (Number(price) * Number(gst)) / 100;
  const priceWithGST = Number(price) + gstAmount;

  const discountAmount = (priceWithGST * discount) / 100;
  const totalPriceAfterDiscount = priceWithGST - discountAmount;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  if (!ShowPrice) return null;

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Cart Summary</h2>
          <FaCircleXmark
            className="text-red-500 cursor-pointer text-2xl hover:scale-110 transition-transform"
            onClick={() => setShowPrice(false)}
          />
        </div>

        {/* Cart Details */}
        <div className="text-gray-700 space-y-4">
          <p>
            <span className="font-medium">Base Price:</span>{" "}
            {formatCurrency(price)}
          </p>
          <p>
            <span className="font-medium">GST Percentage:</span> {gst}%
          </p>
          <p>
            <span className="font-medium">GST Amount:</span>{" "}
            {formatCurrency(gstAmount)}
          </p>
          <p>
            <span className="font-medium">Price with GST:</span>{" "}
            {formatCurrency(priceWithGST)}
          </p>
          <p>
            <span className="font-medium">Discount Percentage:</span> {discount}
            %
          </p>
          <p>
            <span className="font-medium">Discount Amount:</span>{" "}
            {formatCurrency(discountAmount)}
          </p>
          <p className="text-lg font-bold text-gray-900">
            Price After Discount: {formatCurrency(totalPriceAfterDiscount)}
          </p>
        </div>

        {/* Footer Button */}
        <button
          onClick={() => (handelUploadProduct(), setShowPrice(false))}
          className="w-full mt-6 bg-green-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-green-600 hover:scale-105 transition-all"
        >
          Upload Product
        </button>
      </div>
    </div>
  );
};

export default PriceCart;
