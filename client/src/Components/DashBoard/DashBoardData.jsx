import { Bar, Pie } from "react-chartjs-2";
import { FaUsers } from "react-icons/fa6";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { FcSalesPerformance } from "react-icons/fc";
import { GiMoneyStack } from "react-icons/gi";
import { FiCheckCircle, FiLoader, FiTruck, FiXCircle } from "react-icons/fi";
ChartJS.register(
  ArcElement,

  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export const DashBoard = ({ stats, orders }) => {
  const orderStatusChartData = {
    labels: ["Delivered", "Canceled", "Processing", "Shipping"],
    datasets: [
      {
        label: "Order Status",
        data: [
          orders.filter((order) => order.orderStats === "Delivered").length,
          orders.filter((order) => order.orderStats === "Canceled").length,
          orders.filter((order) => order.orderStats === "Processing").length,
          orders.filter((order) => order.orderStats === "Shipping").length,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800", "#2196f3"],
        borderColor: ["#4caf50", "#f44336", "#ff9800", "#2196f3"],
        borderWidth: 1,
      },
    ],
  };

  const userData = {
    labels: ["USER", "ADMIN", "AUTHOR"],
    fontColor: "white",
    datasets: [
      {
        label: "User Details",
        data: [stats.users, stats.Admin, stats.Author],
        backgroundColor: ["yellow", "green", "red"],
        borderWidth: 1,
        borderColor: ["yellow", "green", "red"],
      },
    ],
  };
  const salesData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    fontColor: "white",
    datasets: [
      {
        label: "Sales / Month",
        data: stats.monthlySalesRecord,
        backgroundColor: ["green"],
        borderColor: ["white"],
        borderWidth: 2,
      },
    ],
  };
  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{stats.users + stats.Admin + stats.Author}</p>
            </div>
            <FaUsers className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold">{stats.orders}</p>
            </div>
            <FcSalesPerformance className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.totalPayments}</p>
            </div>
            <GiMoneyStack className="text-4xl text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Products</p>
              <p className="text-3xl font-bold">{stats.products}</p>
            </div>
            <FcSalesPerformance className="text-4xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie data={userData} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users}</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.Admin}</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Authors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.Author}</p>
            </div>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Sales</h3>
          <div className="h-80">
            <Bar data={salesData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Status Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 flex items-center justify-center">
            <Pie data={orderStatusChartData} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="text-green-500 text-2xl" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Delivered</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                    {orders.filter((order) => order.orderStats === "Delivered").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiLoader className="text-blue-500 text-2xl" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Processing</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                    {orders.filter((order) => order.orderStats === "Processing").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiTruck className="text-yellow-500 text-2xl" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Shipping</p>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                    {orders.filter((order) => order.orderStats === "Shipping").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiXCircle className="text-red-500 text-2xl" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Canceled</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                    {orders.filter((order) => order.orderStats === "Canceled").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
