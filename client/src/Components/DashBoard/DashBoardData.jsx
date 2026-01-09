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
    <>
      <div className="grid sm:grid-cols-2 justify-center gap-5 m-auto mx-10">
        <div className="flex flex-col items-center  gap-10 p-5 shadow-lg rounded-md">
          <div className="w-80 h-80 max-w-xs:w-72  max-w-xs:h-72">
            <Pie data={userData} />
          </div>
          <div className="grid grid-cols-3 max-w-xs:gap-1  gap-2">
            <div className="flex items-center justify-between  p-1 gap-2 rounded-md shadow-md">
              <div className="flex flex-col items-center ">
                <p className="font-semibold max-w-xs:text-sm"> USER</p>
                <h3 className="text-2xl max-w-xs:text-xl  font-bold">
                  {stats.users}
                </h3>
              </div>
              <FaUsers className="text-yellow-500 text-3xl max-w-xs:text-2xl" />
            </div>
            <div className="flex items-center justify-between p-1 gap-2 rounded-md shadow-md">
              <div className="flex flex-col items-center">
                <p className="font-semibold max-w-xs:text-sm">ADMIN</p>
                <h3 className="text-2xl font-bold max-w-xs:text-xl">
                  {stats.Admin}
                </h3>
              </div>
              <FaUsers className="text-green-500 text-3xl max-w-xs:text-2xl" />
            </div>
            <div className="flex items-center justify-between p-1 gap-2 rounded-md shadow-md">
              <div className="flex flex-col items-center">
                <p className="font-semibold max-w-xs:text-sm">AUTHOR</p>
                <h3 className="text-2xl font-bold max-w-xs:text-xl">
                  {stats.Author}
                </h3>
              </div>
              <FaUsers className="text-green-500 text-3xl ax-w-xs:text-xl" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-10 p-5 shadow-lg rounded-md">
          <div className="h-80 max-w-xs:h-52 w-full relative">
            <Bar className="absolute bottom-0  w-full" data={salesData} />
          </div>
          <div className="grid grid-cols-2  gap-5">
            <div className="flex items-center max-w-xs:flex-col justify-between max-w-xs:gap-2 p-2 gap-5 rounded-md shadow-md">
              <div className="flex flex-col items-center">
                <p className="font-semibold max-w-xs:text-sm">Total Order</p>
                <h3 className="text-3xl font-bold max-w-xs:text-xl">
                  {stats.orders}
                </h3>
              </div>
              <FcSalesPerformance className="text-yellow-500 text-5xl" />
            </div>
            <div className="flex items-center max-w-xs:flex-col justify-between max-w-xs:gap-2 p-2 gap-5 rounded-md shadow-md">
              <div className="flex flex-col items-center">
                <p className="font-semibold max-w-xs:text-sm">Total Revenue</p>
                <h3 className="text-3xl font-bold max-w-xs:text-xl">
                  ₹{stats.totalPayments}
                </h3>
              </div>
              <GiMoneyStack className="text-green-500 text-5xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-10 py-5 shadow-lg rounded-md">
        <div className=" max-w-xs:w-80 max-w-xs:h-80 w-96 h-96">
          <Pie data={orderStatusChartData} />
        </div>
        <div className="grid grid-cols-4  gap-2">
          <div className="flex items-center justify-center  p-1 max-sm:flex-col gap-2   rounded-md shadow-md">
            <FiCheckCircle className="text-green-500 text-3xl" />
            <div className="flex flex-col items-center max-w-xs:text-sm">
              <p className="font-semibold"> Delivered</p>
              <p className="text-2xl  font-bold max-w-xs:text-xl">
                {
                  orders.filter((order) => order.orderStats === "Delivered")
                    .length
                }
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center  p-1 max-sm:flex-col gap-2  rounded-md shadow-md">
            <FiXCircle className="text-red-500  text-3xl" />
            <div className="flex flex-col items-center">
              <p className="font-semibold max-w-xs:text-sm">Canceled</p>
              <h3 className="text-2xl font-bold max-w-xs:text-xl">
                {
                  orders.filter((order) => order.orderStats === "Canceled")
                    .length
                }
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-center  p-1 max-sm:flex-col gap-2  rounded-md shadow-md">
            <FiLoader className="text-blue-500  text-3xl" />
            <div className="flex flex-col items-center">
              <p className="font-semibold max-w-xs:text-sm">Processing</p>
              <h3 className="text-2xl font-bold max-w-xs:text-xl">
                {
                  orders.filter((order) => order.orderStats === "Processing")
                    .length
                }
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-center max-sm:flex-col  p-1  gap-2  rounded-md shadow-md">
            <FiTruck className="text-yellow-500 text-3xl " />
            <div className="flex flex-col items-center">
              <p className="font-semibold max-w-xs:text-sm">Shipping</p>
              <h3 className="text-2xl font-bold max-w-xs:text-xl">
                {
                  orders.filter((order) => order.orderStats === "Shipping")
                    .length
                }
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
