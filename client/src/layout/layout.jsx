import {
  AiFillCloseCircle,
  AiFillHome,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { GiShoppingCart } from "react-icons/gi";
import {
  FaBell,
  FaBlog,
  FaBoxOpen,
  FaMagnifyingGlass,
  FaMoon,
  FaSun,
  FaUser,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../Components/footer";
import LoadingButton from "../constants/LoadingBtn";
import { useEffect, useState } from "react";
import {
  getShopInfo,
  LoadAccount,
  LogoutAccount,
} from "../Redux/Slice/authSlice";
import { useTheme } from "../Components/ThemeContext";
import { NotificationGet } from "../Redux/Slice/notification.Slice";
import NotificationCart from "../Page/notification/notification";
import SearchBar from "../Components/SearchBar";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineContactPage,
  MdSpaceDashboard,
} from "react-icons/md";
import { BsArrowsCollapse, BsCloudUpload } from "react-icons/bs";
import toast from "react-hot-toast";

function Layout({ children, load }) {
  const [loading, setLoading] = useState("");
  const [NotificationShow, setNotificationShow] = useState(false);
  const [notification, setNotification] = useState([]);
  const [isDrawer, setDrawer] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const { role, exp, data } = useSelector((state) => state?.auth);

  const { phoneNumber, email, address, instagram, youtube, facebook } =
    useSelector((state) => state?.ShopInfo);

  function changeWight() {
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "auto";
    setDrawer(true);
  }

  function hideSide() {
    const element = document.getElementsByClassName("drawer-toggle");
    element[0].checked = false;
    setDrawer(false);
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "0";
  }

  const handelLogout = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await dispatch(LogoutAccount());
    setLoading(false);
    if (res?.payload?.success) {
      navigate("/login");
    }
  };
  const toggleNotificationSidebar = () => {
    setNotificationShow(!NotificationShow);
  };
  const handelNotificationLoad = async () => {
    if (isLoggedIn) {
      const res = await dispatch(NotificationGet());
      const AccountData = await dispatch(LoadAccount());
      if (AccountData?.payload?.message === " please login..") {
        await dispatch(LogoutAccount());
        navigate("/login");
      }
      if (res?.payload?.data) {
        const notificationsArray = Array.isArray(res.payload.data)
          ? res.payload.data
          : [res.payload.data];

        setNotification(notificationsArray);
      }
    }
  };
  useEffect(() => {
    async function handelShopInfo() {
      await dispatch(getShopInfo());
    }

    if (
      phoneNumber == "" ||
      email == "" ||
      address == "" ||
      instagram == "" ||
      youtube == "" ||
      facebook == ""
    ) {
      handelShopInfo();
    }
  }, []);
  const handleSearch = async (query) => {
    try {
      navigate("/Product", { state: query });
    } catch (e) {}
  };

  const handleReadNotification = (NotificationId) => {
    setNotification((prevNotiFiCation) =>
      prevNotiFiCation.filter(
        (Notification) => Notification._id !== NotificationId
      )
    );
  };
  useEffect(() => {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    async function handelCheckJWT() {
      if (exp != 0 && currentTimestamp > exp) {
        await dispatch(LogoutAccount());
        toast.error("please Login...");
        navigate("/login");
      }
    }

    handelCheckJWT();
  }, []);

  useEffect(() => {
    handelNotificationLoad();
  }, []);

  useEffect(() => {
    const checkNetworkSpeed = () => {
      if (!navigator.onLine) {
        navigate("/App/Slow-Network");
        return;
      }

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      const slowConnectionTypes = ["slow-2g", "2g"];
      if (
        connection &&
        slowConnectionTypes.includes(connection.effectiveType)
      ) {
        // navigate("/App/Slow-Network");
      }
    };

    checkNetworkSpeed();

    window.addEventListener("offline", checkNetworkSpeed);
    window.addEventListener("online", checkNetworkSpeed);
    navigator.connection?.addEventListener("change", checkNetworkSpeed);

    return () => {
      window.removeEventListener("offline", checkNetworkSpeed);
      window.removeEventListener("online", checkNetworkSpeed);
      navigator.connection?.removeEventListener("change", checkNetworkSpeed);
    };
  }, [navigate]);

  return (
    <div
      className={`min-h-[90vh] select-none z-20 bg-white dark:text-white  dark:bg-gray-900 text-black  overflow-hidden `}
    >
      <div className="sticky top-0 z-50">
        <nav
          className={`flex fixed z-50 justify-between w-[100%] items-center bg-white   dark:bg-gray-900 `}
        >
          <label htmlFor="my-drawer" className="relative cursor-pointer">
            <FiMenu
              onClick={changeWight}
              size={"36px"}
              className={`font-bold dark:text-white text-gray-800 m-4 `}
            />
          </label>
          {!load && <SearchBar onSearch={handleSearch} />}
          <div
            className={`flex gap-5 font-bold text-black dark:text-white items-center `}
          >
            <div className="max-sm:hidden flex">
              {!isLoggedIn && (
                <Link to="/Login">
                  <button
                    className={` text-sm px-8 bg-blue-700 dark:bg-blue-600 py-3 font-medium text-white rounded-md w-full hover:bg-transparent hover:text-blue-700 hover:border-2`}
                  >
                    Login
                  </button>
                </Link>
              )}
            </div>
            <div className=" relative cursor-pointer hover:text-green-400 dark:text-white">
              <FaBell
                size={"20px"}
                onClick={() => toggleNotificationSidebar()}
              />
              <p className="absolute text-green-600 font-serif text-sm top-[-12px] right-[-5px]">
                {notification &&
                  notification?.length >= 1 &&
                  notification?.length}
              </p>
            </div>
            <Link to="/Search">
              <div className="cursor-pointer dark:text-white sm:hidden">
                <FaMagnifyingGlass size={"20px"} />
              </div>
            </Link>

            {isLoggedIn && (
              <div className="cursor-pointer hover:text-green-400 dark:text-white">
                <FaUser size={"20px"} onClick={() => navigate("/Profile")} />
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded text-black dark:text-white`}
            >
              {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

            <div
              onClick={() => navigate("/Cart")}
              className="relative cursor-pointer text-white mr-4 dark:text-black"
            >
              <p className="absolute text-green-600 font-serif text-sm top-[-12px] right-[-5px]">
                {data?.walletAddProducts?.length >= 1 &&
                  data?.walletAddProducts?.length}
              </p>
              <GiShoppingCart
                size={"20px"}
                className={`${
                  data?.walletAddProducts?.length >= 1
                    ? `text-green-400`
                    : `text-black dark:text-white`
                }`}
              />
            </div>
          </div>
        </nav>
        <div className="drawer absolute left-0 z-50 w-fit">
          <input className="drawer-toggle" id="my-drawer" type="checkbox" />
          <div className={`drawer-side w-0 `}>
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
            <ul
              className={`menu p-4 w-56 bg-base-200 text-base-content dark:bg-gray-800 dark:text-gray-300 min-h-[100%] sm:w-80 space-y-4  max-w-xs:space-y-2 relative overflow-y-auto `}
            >
              <li className="w-fit absolute right-2 z-50">
                <button onClick={hideSide}>
                  <AiFillCloseCircle size={"20px"} />
                </button>
              </li>
              <li onClick={hideSide} className="pt-2">
                <Link to="/">
                  {" "}
                  <AiFillHome />
                  Home
                </Link>
              </li>

              <li onClick={hideSide}>
                <Link to="/Product">
                  {" "}
                  <FaBoxOpen />
                  All Product
                </Link>
              </li>
              <li onClick={hideSide}>
                <Link to="/Blog">
                  {" "}
                  <FaBlog />
                  Blog
                </Link>
              </li>

              <li onClick={hideSide}>
                <Link to="/Contact">
                  {" "}
                  <MdOutlineContactPage />
                  Contact Us
                </Link>
              </li>
              <li onClick={hideSide}>
                <Link to="/About">
                  {" "}
                  <AiOutlineInfoCircle />
                  About Us
                </Link>
              </li>

              {["ADMIN", "AUTHOR"].includes(role) && (
                <>
                  <p className="flex items-center gap-1 text-xm">
                    <MdOutlineAdminPanelSettings size={20} /> Admin Routes
                  </p>
                  <li onClick={hideSide}>
                    <Link
                      to={`/DashBoard/${
                        data?._id || "67816211921701ac1e5a5c1d"
                      }`}
                    >
                      <MdSpaceDashboard />
                      ADMIN Dashboard
                    </Link>
                  </li>
                  <li onClick={hideSide}>
                    <Link to="/AddProduct">
                      {" "}
                      <BsCloudUpload />
                      Add Product
                    </Link>
                  </li>
                  <li onClick={hideSide}>
                    <Link to="/CarouselUpdate">
                      {" "}
                      <BsArrowsCollapse />
                      Carousel Update
                    </Link>
                  </li>
                  <li onClick={hideSide}>
                    <Link to="/CarouselUpload">
                      {" "}
                      <BsCloudUpload />
                      CarouselUpload
                    </Link>
                  </li>
                  <li onClick={hideSide}>
                    <Link to="/BlogUpload ">
                      {" "}
                      <BsCloudUpload />
                      BlogUpload
                    </Link>
                  </li>
                </>
              )}
              {!isLoggedIn && (
                <li className="w-[90%]  absolute bottom-4">
                  <div className="flex mt-2 items-center justify-center w-full flex-wrap">
                    <Link to="/Login">
                      <button className="btn btn-primary px-8 py-1 rounded-md font-semibold w-full">
                        Login
                      </button>
                    </Link>
                    <Link to="/SignUp">
                      <button className="btn btn-secondary px-8 py-1 rounded-md font-semibold w-full">
                        SignUp
                      </button>
                    </Link>
                  </div>
                </li>
              )}

              {isLoggedIn && (
                <div className="w-[90%]  absolute bottom-4">
                  <div className="flex items-center justify-center w-full flex-wrap">
                    <LoadingButton
                      textSize={"py-2"}
                      loading={loading}
                      message={"Loading.."}
                      onClick={handelLogout}
                      name={"Logout"}
                      color={"bg-red-500"}
                    />
                  </div>
                </div>
              )}
            </ul>
          </div>
        </div>
        {isDrawer && (
          <div
            className="fixed inset-0 w-full bg-black bg-opacity-30 z-10"
            onClick={hideSide}
          ></div>
        )}
        {NotificationShow && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-10"
            onClick={toggleNotificationSidebar}
          ></div>
        )}

        <div
          role="dialog"
          aria-label="Notification Panel"
          className={`fixed  right-0 h-full dark:bg-[#111827] bg-white shadow-lg max-sm:w-[90%] w-[40%] z-50 transition-transform duration-500 ease-in-out ${
            NotificationShow ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex  justify-between items-center dark:bg-[#111827]  bg-gray-100 p-4 border-b border-gray-300 ">
            <h2 className="text-xl font-bold dark:text-white text-gray-800">
              Notifications
            </h2>
            <button
              className="text-red-500 text-lg font-bold"
              onClick={toggleNotificationSidebar}
            >
              X
            </button>
          </div>

          <div className="p-4 space-y-4 dark:text-white text-black overflow-y-auto max-h-[calc(100vh-80px)] ">
            {notification && notification.length == 0 ? (
              <p className="text-center">No notification...</p>
            ) : (
              notification.map((data, ind) => {
                return (
                  <div
                    key={ind}
                    className="p-3 bg-gray-100 dark:bg-[#111827] rounded-md shadow-[0_0_1px_white] "
                  >
                    <NotificationCart
                      data={data}
                      handleReadNotification={handleReadNotification}
                      onUpdate={handelNotificationLoad}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className=" mt-16">{children}</div>
      <Footer />
    </div>
  );
}

export default Layout;
