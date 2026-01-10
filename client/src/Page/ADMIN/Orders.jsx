import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AllOrder } from "../../Redux/Slice/OrderSlice";
import { LoadAccount } from "../../Redux/Slice/authSlice";
import Layout from "../../layout/layout";
import { OrderCart } from "../../Components/OrderDataCart";

const Orders = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const ordersRes = await dispatch(AllOrder());
      setOrders(ordersRes?.payload?.data);
      setLoading(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const loadProfile = async () => {
    await dispatch(LoadAccount());
  };

  useEffect(() => {
    fetchData();
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen select-none">
        <header className="bg-white dark:bg-gray-800 shadow-sm top-[50px] sm:top-[66px] z-40 w-full fixed">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-indigo-600">Orders Management</h1>
            </div>
          </div>
        </header>
        <div className="pt-[100px] max-w-xs:pt-[50px]">
          <OrderCart order={orders} />
        </div>
      </div>
    </Layout>
  );
};

export default Orders;