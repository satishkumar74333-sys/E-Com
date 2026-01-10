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
  FaBox,
  FaBoxOpen,
  FaCreditCard,
  FaEnvelope,
  FaMagnifyingGlass,
  FaMoon,
  FaSellcast,
  FaSun,
  FaUser,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../Components/footer";
import LoadingButton from "../constants/LoadingBtn";
import { useEffect, useState, useRef } from "react";
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
  MdSettings,
  MdSpaceDashboard,
} from "react-icons/md";
import { BsArrowsCollapse, BsCloudUpload } from "react-icons/bs";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";

function Layout({ children, load }) {
  const [loading, setLoading] = useState("");
  const [NotificationShow, setNotificationShow] = useState(false);
  const [notification, setNotification] = useState([]);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const { role, exp, data } = useSelector((state) => state?.auth);

  const { phoneNumber, email, address, instagram, youtube, facebook } =
    useSelector((state) => state?.ShopInfo);


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

  function hideSide() {
    if (window.innerWidth > 1024) return;
    const element = document.getElementsByClassName("drawer-toggle");
    element[0].checked = false;
  }
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
    const handleResize = () => {
      const element = document.getElementsByClassName("drawer-toggle");
      if (element[0]) {
        if (window.innerWidth >= 1024) {
          element[0].checked = true;
        } else {
          element[0].checked = false;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      className={`min-h-screen z-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-black dark:text-white`}
    >
      <div className="sticky top-0 z-50">
        {/* Modern Header */}
        <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Mobile Menu */}
              <div className="flex items-center">
                <label htmlFor="my-drawer" className="lg:hidden relative cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <FiMenu size={24} className="text-gray-700 dark:text-gray-300" />
                </label>
                <div className="hidden lg:block ml-4">
                  <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    KGS DOORS
                  </Link>
                </div>
              </div>

              {/* Desktop Navigation */}
              {!["ADMIN", "AUTHOR"].includes(role) && (
                <nav className="hidden lg:flex space-x-8">
                  <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Home</Link>
                  <Link to="/Product" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Products</Link>
                  <Link to="/Blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Blog</Link>
                  <Link to="/Contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Contact</Link>
                  <Link to="/About" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">About</Link>
                </nav>
              )}
              {["ADMIN", "AUTHOR"].includes(role) && (
                <nav className="hidden lg:flex space-x-6">
                  <Link to="/DashBoard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Dashboard</Link>
                  <Link to="/Users" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Users</Link>
                  <Link to="/Orders" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Orders</Link>
                  <Link to="/ProductsAdmin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Products</Link>
                  <Link to="/Payments" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Payments</Link>
                </nav>
              )}

              {/* Search Bar - Always Visible */}
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <SearchBar onSearch={handleSearch} />
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button
                  onClick={toggleNotificationSidebar}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FaBell size={20} className="text-gray-700 dark:text-gray-300" />
                  {notification && notification.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notification.length}
                    </span>
                  )}
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {darkMode ? <FaSun size={20} className="text-yellow-500" /> : <FaMoon size={20} className="text-gray-700 dark:text-gray-300" />}
                </button>

                {/* User Menu */}
                {isLoggedIn ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <FaUser size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link to="/Profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                      {!["ADMIN", "AUTHOR"].includes(role) && (
                        <Link to="/Cart" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cart</Link>
                      )}
                      <button onClick={handelLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                    </div>
                  </div>
                ) : (
                  <Link to="/Login">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                      Login
                    </button>
                  </Link>
                )}

                {/* Cart Icon - Desktop */}
                {!["ADMIN", "AUTHOR"].includes(role) && (
                  <button
                    onClick={() => navigate("/Cart")}
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <GiShoppingCart size={24} className="text-gray-700 dark:text-gray-300" />
                    {data?.walletAddProducts?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {data.walletAddProducts.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden pb-4">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </header>
        {/* Sidebar for Desktop */}
        {["ADMIN", "AUTHOR"].includes(role) && (
          <div className="hidden lg:block fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 z-30">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Admin Panel</h2>
            </div>
            <nav className="p-4 space-y-2">
              <Link to="/DashBoard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MdSpaceDashboard />
                <span>Dashboard</span>
              </Link>
              <Link to="/Users" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaUser />
                <span>Users</span>
              </Link>
              <Link to="/up-sell" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaSellcast />
                <span>up sell</span>
              </Link>
              <Link to="/AddProduct" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Upload />
                <span>AddProduct</span>
              </Link>
              <Link to="/Orders" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaBox />
                <span>Orders</span>
              </Link>
              <Link to="/ProductsAdmin" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaBoxOpen />
                <span>Products</span>
              </Link>
              <Link to="/Payments" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaCreditCard />
                <span>Payments</span>
              </Link>
              <Link to="/Messages" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaEnvelope />
                <span>Messages</span>
              </Link>
              <Link to="/Settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MdSettings />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Mobile Drawer */}
        <div className="drawer lg:hidden">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side z-40">
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
            <aside className="min-h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                  <label htmlFor="my-drawer" className="btn btn-ghost btn-circle">
                    <AiFillCloseCircle size={24} />
                  </label>
                </div>
              </div>
              <ul className="menu p-4 space-y-2">
                {!["ADMIN", "AUTHOR"].includes(role) && (
                  <>
                    <li><Link to="/" className="flex items-center space-x-3"><AiFillHome /><span>Home</span></Link></li>
                    <li><Link to="/Product" className="flex items-center space-x-3"><FaBoxOpen /><span>Products</span></Link></li>
                    <li><Link to="/Blog" className="flex items-center space-x-3"><FaBlog /><span>Blog</span></Link></li>
                    <li><Link to="/Contact" className="flex items-center space-x-3"><MdOutlineContactPage /><span>Contact</span></Link></li>
                    <li><Link to="/About" className="flex items-center space-x-3"><AiOutlineInfoCircle /><span>About</span></Link></li>
                  </>
                )}
                {["ADMIN", "AUTHOR"].includes(role) && (
                  <>
                    <li className="menu-title"><MdOutlineAdminPanelSettings className="mr-2" />Admin Panel</li>
                    <li><Link to="/DashBoard"><MdSpaceDashboard className="mr-2" />Dashboard</Link></li>
                    <li><Link to="/AddProduct"><BsCloudUpload className="mr-2" />Add Product</Link></li>
                    <li><Link to="/up-sell"><FaSellcast className="mr-2" />Up Sell Manage</Link></li>
                    <li><Link to="/CarouselUpdate"><BsArrowsCollapse className="mr-2" />Carousel Update</Link></li>
                    <li><Link to="/CarouselUpload"><BsCloudUpload className="mr-2" />Carousel Upload</Link></li>
                    <li><Link to="/BlogUpload"><BsCloudUpload className="mr-2" />Blog Upload</Link></li>
                    <li><Link to="/Users"><FaUser className="mr-2" />Users</Link></li>
                    <li><Link to="/Orders"><FaBox className="mr-2" />Orders</Link></li>
                    <li><Link to="/ProductsAdmin"><FaBoxOpen className="mr-2" />Products</Link></li>
                    <li><Link to="/Payments"><FaCreditCard className="mr-2" />Payments</Link></li>
                    <li><Link to="/Messages"><FaEnvelope className="mr-2" />Messages</Link></li>
                    <li><Link to="/Settings"><MdSettings className="mr-2" />Settings</Link></li>
                  </>
                )}
              </ul>
              <div className="absolute bottom-4 left-4 right-4">
                {!isLoggedIn ? (
                  <div className="space-y-2">
                    <Link to="/Login" className="btn btn-primary w-full">Login</Link>
                    <Link to="/Signup" className="btn btn-outline w-full">Sign Up</Link>
                  </div>
                ) : (
                  <LoadingButton
                    textSize="py-2"
                    loading={loading}
                    message="Logging out..."
                    onClick={handelLogout}
                    name="Logout"
                    color="bg-red-500"
                  />
                )}
              </div>
            </aside>
          </div>
        </div>
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

      {/* Main Content */}
      <main className={`pt-4 pb-8 min-h-[calc(100vh-4rem)] overflow-auto ${["ADMIN", "AUTHOR"].includes(role) ? "lg:ml-64" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Layout;

