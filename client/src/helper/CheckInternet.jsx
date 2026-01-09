import { useState, useEffect } from "react";
import { FiWifiOff } from "react-icons/fi"; // Offline Icon
import { useNavigate } from "react-router-dom";

const SlowInternetPage = () => {
  const [type, setType] = useState("checking...");
  const navigate = useNavigate();

  useEffect(() => {
    const checkNetworkSpeed = () => {
      if (!navigator.onLine) {
        setType("offline");
        return;
      }

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection) {
        setType(connection.effectiveType);
        const slowConnectionTypes = ["slow-2g", "2g"];

        if (!slowConnectionTypes.includes(connection.effectiveType)) {
          navigate(-1);
        }
      } else {
        setType("unknown");
      }
    };

    checkNetworkSpeed();

    const timeout = setTimeout(checkNetworkSpeed, 5000);

    window.addEventListener("offline", checkNetworkSpeed);
    window.addEventListener("online", checkNetworkSpeed);
    navigator.connection?.addEventListener("change", checkNetworkSpeed);
    clearTimeout(timeout);

    return () => {
      window.removeEventListener("offline", checkNetworkSpeed);
      window.removeEventListener("online", checkNetworkSpeed);
      navigator.connection?.removeEventListener("change", checkNetworkSpeed);
    };
  }, [navigate]);

  if (type === "offline") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <FiWifiOff size={150} className="text-red-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100vh] flex  max-w-xs:p-2 flex-col items-center justify-center bg-gray-100 dark:bg-[#111827] dark:text-white text-gray-800">
      <div className="text-center">
        <h1 className="text-3xl max-w-xs:text-xl font-bold mb-4 text-red-600">
          Slow Internet Connection
        </h1>
        <p className="text-lg max-w-xs:text-sm mb-6">
          Your internet connection "{type}" is very slow. Some features may not
          work properly.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 max-w-xs:text-sm bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default SlowInternetPage;
