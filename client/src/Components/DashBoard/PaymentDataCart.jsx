import { useEffect, useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaMoneyBillAlt } from "react-icons/fa";
import { FaBox, FaBoxOpen, FaCreditCard } from "react-icons/fa6";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const PaymentCart = ({ Razorpay, payments }) => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState(1);
  const filteredPayments = payments?.filter((payment) => {
    if (activeButton === 1) {
      return payment.PaymentMethod === "cash on Delivery";
    }
  });
  const handleClick = (buttonId) => {
    setActiveButton(buttonId);
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  function handelNavigateId(id) {
    if (!id) {
      alert("please try some time...");
    }

    navigate(`/api/v3/user/order/${id}`);
  }

  return (
    <>
      <div
        className="
        flex flex-col"
      >
        <div className="flex  space-x-4 w-full justify-evenly bg-[#EFF3EA] py-2 my-2 dark:bg-gray-800 shadow-2xl rounded-lg delay-500 transition-shadow">
          {/* Dashboard Button */}
          <button
            className={`p-3 max-w-xs:text-sm rounded-md transition-transform duration-300 ease-in-out flex justify-center gap-1 items-center ${
              activeButton === 1
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:scale-105 hover:shadow-md"
            }`}
            onClick={() => handleClick(1)}
          >
            <FaMoneyBillAlt />
            <span>Cash payments</span>
          </button>

          <button
            className={`p-3 max-w-xs:text-sm rounded-md transition-transform duration-300 ease-in-out flex gap-1 items-center ${
              activeButton === 2
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:scale-105 hover:shadow-md"
            }`}
            onClick={() => handleClick(2)}
          >
            <FaCreditCard />
            <span>Online payments</span>
          </button>
        </div>
      </div>
      {activeButton == 1 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Manage Payments</h2>
          <section className="mb-6 overflow-x-scroll">
            <table className="w-full bg-white shadow-md rounded-lg dark:bg-gray-800">
              <thead className="bg-gray-200 dark:bg-gray-500">
                <tr>
                  <th className="p-2">OrderId</th>
                  <th className="p-2">TotalAmount</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">contact</th>
                  <th className="p-2">name</th>
                  <th className="p-2">method</th>
                  <th className="p-2">Payment Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {filteredPayments?.map((payment, index) => (
                  <tr key={payment._id}>
                    <td
                      onClick={() => {
                        handelNavigateId(payment._id);
                      }}
                      className="p-2 cursor-pointer"
                    >
                      #{payment._id}
                    </td>
                    <td className="p-2">₹{payment.totalAmount}</td>
                    <td>{payment.amount}</td>
                    <td className="p-2">
                      <a href={`tel:+${payment.shippingAddress.phoneNumber}`}>
                        {payment.shippingAddress.phoneNumber}
                      </a>
                    </td>
                    <td className="p-2">{payment.name}</td>
                    <td className="p-2">{payment.PaymentMethod}</td>
                    <td className="p-2 flex justify-center text-center">
                      {payment.paymentStatus == "Completed" ? (
                        <FiCheckCircle className="text-green-500 text-xl" />
                      ) : payment.paymentStatus == "Failed" ? (
                        <FiXCircle className="text-red-500 text-xl" />
                      ) : (
                        <AiOutlineClockCircle
                          className="mr-2 text-yellow-500"
                          size={20}
                        />
                      )}
                    </td>
                    <td className="p-2">
                      {payment.PaymentDate
                        ? new Date(payment.PaymentDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "No date"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Manage Payments</h2>
          <section className="mb-6 overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg dark:bg-gray-800">
              <thead className="bg-gray-200 dark:bg-gray-500">
                <tr>
                  <th className="p-2">No.</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">contact</th>
                  <th className="p-2">currency</th>
                  <th className="p-2">method</th>
                  <th className="p-2">Payment Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {Razorpay?.map((payment, index) => (
                  <tr key={payment.id}>
                    <td className="p-2">#{index + 1}</td>
                    <td className="p-2">₹{payment.amount}</td>
                    <td className="p-2">{payment.contact}</td>
                    <td className="p-2">{payment.currency}</td>
                    <td className="p-2">{payment.method}</td>
                    <td className="p-2 flex justify-center">
                      {payment.status !== "failed" ? (
                        <FiCheckCircle className="text-green-500 text-xl" />
                      ) : (
                        <FiXCircle className="text-red-500 text-xl" />
                      )}
                    </td>
                    <td className="p-2">{formatDate(payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </>
  );
};
