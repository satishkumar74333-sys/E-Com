import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useTheme } from "./ThemeContext"; // Importing the useTheme hook
import { useSelector } from "react-redux";

function Footer() {
  const currentData = new Date();
  const year = currentData.getFullYear();
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Get darkMode state from ThemeContext
  const { phoneNumber, email, address, instagram, youtube, facebook } =
    useSelector((state) => state?.ShopInfo);

  return (
    <footer className="relative py-4 bottom-0 border-t-2 border-[#0005] left-0 w-full ">
      <h1 className="text-center text-3xl font-semibold max-w-xs:text-2xl">
        KGS DOORS
      </h1>

      <div
        className={`grid grid-cols-2 justify-evenly max-sm:gap-6 gap-36 max-sm:items-center p-5 sm:flex-col text-center`}
      >
        <div>
          <ul className="flex flex-col gap-1 max-w-xs:text-sm font-normal">
            <h1
              className={`text-2xl max-w-xs:text-xl font-semibold ${
                darkMode ? "text-gray-300" : "text-gray-950"
              }`}
            >
              About
            </h1>
            <li
              onClick={() => navigate("/About")}
              className="cursor-pointer hover:text-blue-800"
            >
              About us
            </li>
            <li
              onClick={() => navigate("/product")}
              className="cursor-pointer hover:text-blue-800"
            >
              Shop
            </li>
            <a
              href={`https://wa.me/${phoneNumber || `9950352887`}`}
              target="_blank"
              className="cursor-pointer hover:text-blue-800"
            >
              Chat
            </a>
            <li
              onClick={() => navigate("/Contact")}
              className="cursor-pointer hover:text-blue-800"
            >
              Contact
            </li>
          </ul>
        </div>
        <div>
          <ul className="flex flex-col gap-1  max-w-xs:text-sm font-normal">
            <h1
              className={`text-2xl  max-w-xs:text-xl font-semibold ${
                darkMode ? "text-gray-300" : "text-gray-950"
              }`}
            >
              Categories
            </h1>
            <li
              onClick={() =>
                navigate("/Product", {
                  state: "Chairs",
                  replace: true,
                })
              }
              className="cursor-pointer hover:text-blue-800"
            >
              Chairs
            </li>
            <li
              onClick={() =>
                navigate("/Product", { state: "Sofa", replace: true })
              }
              className="cursor-pointer hover:text-blue-800"
            >
              Sofa
            </li>
            <li
              onClick={() =>
                navigate("/Product", { state: "Table", replace: true })
              }
              className="cursor-pointer hover:text-blue-800"
            >
              Table
            </li>
            <li
              onClick={() =>
                navigate("/Product", { state: "Lamp", replace: true })
              }
              className="cursor-pointer hover:text-blue-800"
            >
              Lamp
            </li>
          </ul>
        </div>
      </div>
      <div
        className="flex flex-col justify-center w-full
       items-center text-center mb-5"
      >
        <ul className="flex flex-col gap-1">
          <h1
            className={`text-2xl  max-w-xs:text-xl font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-950"
            }`}
          >
            Contact
          </h1>
          <a
            className="cursor-pointer max-w-xs:text-sm hover:text-blue-800"
            href={`mailto:${email || ""}`}
          >
            {email || ""}
          </a>

          <a
            className="cursor-pointer max-w-xs:text-sm hover:text-blue-800"
            href={`tel:${phoneNumber || "+91 9950352887"}`}
          >
            +91 {phoneNumber || "9950352887"}
          </a>
          <p className=" line-clamp-2 max-w-xs:text-sm ">{address}</p>
        </ul>
        <div className="flex gap-5 mt-1 justify-center">
          <a href={`${instagram || ""}`} target="_blank">
            <FaInstagram
              className={`w-[22px] h-[22px] hover:text-yellow-500 cursor-pointer ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            />
          </a>

          <a href={`${facebook || ""}`} target="_blank">
            <FaFacebook
              className={`w-[22px] h-[22px] hover:text-yellow-500 cursor-pointer ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            />
          </a>
          <a href={`${youtube || ""}`} target="_blank">
            <FaYoutube
              className={`w-[22px] h-[22px] hover:text-yellow-500 cursor-pointer ${
                darkMode ? "text-white" : "text-gray-700"
              }`}
            />
          </a>
        </div>
      </div>
      <div
        className={`flex justify-between max-w-xs:text-sm mx-5 my-1 ${
          darkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <div className="flex justify-between w-full">
          <h1>Copyright {year} | All rights reserved</h1>
          <Link
            onClick={() => window.open("/App/privacy-policy", "_blank")}
            className="hover:text-blue-500 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
