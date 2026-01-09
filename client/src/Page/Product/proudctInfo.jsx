import React from "react";
import { formatPrice } from "./format";
import { MdCurrencyRupee } from "react-icons/md";

function ProductInfo({ product }) {
  return (
    <div className="space-y-6 ">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        {product.name}
      </h1>
      <p className="text-xl text-gray-600 dark:text-white">
        {product.description}
      </p>
      <div className="text-lg flex flex-col">
        <span className="dark:text-white text-black font-bold flex   items-center">
          <MdCurrencyRupee size={20} />{" "}
          {product?.discount
            ? (
                product?.price +
                (product?.price * product?.gst) / 100 -
                ((product?.price + (product?.price * product?.gst) / 100) *
                  product?.discount) /
                  100
              ).toFixed(2)
            : (product?.price + (product?.price * product?.gst) / 100).toFixed(
                2
              )}
          {product?.discount > 0 && (
            <span className="line-through text-gray-500 text-sm flex  items-center">
              <MdCurrencyRupee />{" "}
              {(product?.price + (product?.price * product?.gst) / 100).toFixed(
                2
              )}
              /-
            </span>
          )}
        </span>

        <div className="">
          <p className="text-sm font-mono text-gray-600">
            With GST: {product?.gst}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              product?.stock === "In stock" ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <p
            className={`text-sm font-medium text-gray-700 ${
              product?.stock === "In stock" ? "text-green-500" : "text-red-500"
            }`}
          >
            {product?.stock}
          </p>
        </div>
        <h1 className="text-sm font-semibold">
          {" "}
          Category:{" "}
          <span className="text-sm text-gray-500">{product?.category}</span>
        </h1>
      </div>
    </div>
  );
}

export default ProductInfo;
