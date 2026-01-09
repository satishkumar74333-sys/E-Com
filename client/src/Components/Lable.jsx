import React, { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

const ProfessionalShippingLabel = ({ Order, setShowPrint }) => {
  const [order, setOrder] = useState(Order);
  const labelRef = useRef();
  const { phoneNumber, address } = useSelector((state) => state?.ShopInfo);
  const domain =
    window.location.hostname +
    (window.location.port ? `:${window.location.port}` : "");

  const url = `http://${domain}/api/v3/user/order/${order._id}`;
  const handlePrint = () => {
    const printContent = labelRef.current.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Shipping Label</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #fff;
            }
            .label-container {
              width: 800px;
              padding: 20px;
              border: 1px solid #000;
              margin: auto;
            }
            .section {
              margin-bottom: 15px;
              font-size: 14px;
            }
            .section-header {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #000;
            }
            .details {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
            }
            .barcode {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 10px 0;
            }
            .barcode img, .qr-code {
              max-width: 100%;
              height: auto;
            }
            .qr-code {
              margin-left: 20px;
              display: inline-block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              text-align: left;
              padding: 8px;
            }
            th {
              background-color: #f2f2f2;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  };

  return (
    <div>
      <div
        className="fixed  max-w-xs:overflow-auto max-w-xs:pt-48 inset-0 bg-gray-700 bg-opacity-0 flex justify-center items-center z-40 "
        onClick={() => setShowPrint(false)}
      >
        <div
          className="bg-white p-8 rounded-lg shadow-lg w-full  max-w-xs:w-[95%]  relative dark:text-white dark:bg-[#111827]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowPrint(false)}
            className="absolute top-2 right-2 text-red-500  p-1 rounded-full"
          >
            <X />
          </button>
          <div className="label-container" ref={labelRef}>
            {/* Header: Order ID and Barcode */}
            <div className="details">
              <div>
                <strong>Order ID:</strong> {order?._id || "1234567890"}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(order?.createdAt).toLocaleDateString() || "N/A"}
              </div>
              <div className="barcode">
                <QRCodeSVG value={url} size={80} />
              </div>
            </div>

            {/* Sender & Recipient Details */}
            <div className="section">
              <div className="section-header">Sender Details</div>
              <p>
                <strong>Company:</strong> KGS DOORS
                <br />
                <strong>Address:</strong>
                {address}
                <br />
                <strong>Contact:</strong>+91 {phoneNumber || "9950352887"}
              </p>
            </div>

            <div className="section">
              <div className="section-header">Recipient Details</div>
              <p>
                <strong>Name:</strong> {order?.shippingAddress?.name}
                <br />
                <strong>Address:</strong> {order?.shippingAddress?.address},{" "}
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state},{" "}
                {order?.shippingAddress?.postalCode}
                <br />
                <strong>Phone:</strong> {order?.shippingAddress?.phoneNumber}
              </p>
            </div>

            {/* Products Table */}
            <div className="section">
              <div className="section-header">Order Details</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.products?.map((product, index) => (
                    <tr key={index}>
                      <td>{product.productDetails?.name}</td>
                      <td>{product.quantity}</td>
                      <td>${product.price?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shipping Method */}
            <div className="section">
              <div className="section-header">Shipping Method</div>
              <p>{order?.shippingMethod}</p>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white py-2 px-4 rounded mt-4"
            >
              Print Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalShippingLabel;
