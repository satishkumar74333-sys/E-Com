import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useTheme } from "./ThemeContext"; // Importing the useTheme hook
import { useSelector } from "react-redux";

function Footer() {
  const currentData = new Date();
  const year = currentData.getFullYear();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { phoneNumber, email, address, instagram, youtube, facebook } =
    useSelector((state) => state?.ShopInfo);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              KGS DOORS
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner for premium quality doors and furniture.
              Crafted with excellence, designed for perfection.
            </p>
            <div className="flex space-x-4">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <FaYoutube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("/About")}
                        className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/Product")}
                        className="text-gray-300 hover:text-white transition-colors">
                  Shop
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/Blog")}
                        className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/Contact")}
                        className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("/Product", { state: "Chairs" })}
                        className="text-gray-300 hover:text-white transition-colors">
                  Chairs
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/Product", { state: "Sofa" })}
                        className="text-gray-300 hover:text-white transition-colors">
                  Sofa
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/Product", { state: "Table" })}
                        className="text-gray-300 hover:text-white transition-colors">
                  Table
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/Product", { state: "Lamp" })}
                        className="text-gray-300 hover:text-white transition-colors">
                  Lamp
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
            <div className="space-y-3">
              {email && (
                <a href={`mailto:${email}`}
                   className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                  <span className="text-blue-400">✉</span>
                  <span className="text-sm">{email}</span>
                </a>
              )}
              <a href={`tel:${phoneNumber || "+919950352887"}`}
                 className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                <span className="text-green-400">📞</span>
                <span className="text-sm">+91 {phoneNumber || "9950352887"}</span>
              </a>
              <a href={`https://wa.me/${phoneNumber || "9950352887"}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                <span className="text-green-500">💬</span>
                <span className="text-sm">Chat on WhatsApp</span>
              </a>
              {address && (
                <div className="flex items-start space-x-3 text-gray-300">
                  <span className="text-red-400 mt-1">📍</span>
                  <span className="text-sm leading-relaxed">{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2 text-white">Stay Updated</h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates and offers</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {year} KGS DOORS. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/Contact" className="text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
