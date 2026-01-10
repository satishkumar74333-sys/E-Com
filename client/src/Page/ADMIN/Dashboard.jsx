import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAllUsers, LoadAccount } from "../../Redux/Slice/authSlice";
import { getPaymentRecord, PaymentData } from "../../Redux/Slice/paymentSlice";
import { AllOrder } from "../../Redux/Slice/OrderSlice";
import { getAllProduct } from "../../Redux/Slice/ProductSlice";
import { FaBoxOpen, FaEnvelope } from "react-icons/fa6";
import Layout from "../../layout/layout";

import { FaUser, FaBox, FaCreditCard, FaThLarge, FaGift } from "react-icons/fa";
import { UsersCart } from "../../Components/DashBoard/UserDataCard";
import { ProductsCart } from "../../Components/DashBoard/ProductDataCart";
import { DashBoard } from "../../Components/DashBoard/DashBoardData";
import { PaymentCart } from "../../Components/DashBoard/PaymentDataCart";
import { OrderCart } from "../../Components/OrderDataCart";
import Messages from "../../Components/DashBoard/MessageData";
import ShopInformationForm from "../../Components/shopInfo";
import UpsellManagement from "../../Components/DashBoard/UpsellManagement";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { MdMenu, MdSettings } from "react-icons/md";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({
    users: 0,
    Admin: 0,
    Author: 0,
    products: 0,
    orders: 0,
    monthlySalesRecord: [],
    totalPayments: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [Razorpay, setRazorpay] = useState([]);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchProducts = async (page) => {
    try {
      const productsRes = await dispatch(
        getAllProduct({ page, limit: window.innerWidth > 760 ? "50" : "25" })
      );
      const { data, totalPages } = productsRes.payload;
      setProducts(data);
      setTotalPages(totalPages);
      setCurrentPage(page);

      setStats({
        products: productsRes.payload.totalProducts,
      });
    } catch (error) {
      alert(error.message);
    }
  };
  const loadProfile = async () => {
    await dispatch(LoadAccount());
  };

  const fetchData = async () => {
    try {
      const usersRes = await dispatch(getAllUsers());
      const ordersRes = await dispatch(AllOrder());
      const paymentsRes = await dispatch(getPaymentRecord());
      const paymentsRe = await dispatch(PaymentData());
      setRazorpay(paymentsRes?.payload?.allPayments?.items);
      setUsers(usersRes?.payload?.allUser);
      setOrders(ordersRes?.payload?.data);
      setPayments(paymentsRe?.payload?.data);
      setStats({
        users: usersRes?.payload?.allUserCount,
        Author: usersRes?.payload?.allAUTHORCount,
        Admin: usersRes?.payload?.allADMINCount,
        monthlySalesRecord: paymentsRes?.payload?.monthlySalesRecord,
        orders: ordersRes?.payload?.data.length,
        totalPayments:
          paymentsRes?.payload?.totalAmount +
          (paymentsRe?.payload?.data?.receivedAmount || 0),
      });
      setLoading(false);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchData();
    loadProfile();
    fetchProducts(1);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your store.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashBoard stats={stats} orders={orders} />
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
