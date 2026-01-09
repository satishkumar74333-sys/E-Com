import React, { useEffect, useState, useMemo } from "react";
import { FiShoppingCart, FiEye, FiHeart, FiEdit, FiPackage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AddProductCard,
  DeleteProduct,
  LikeAndDisLike,
} from "../Redux/Slice/ProductSlice";
import { AiOutlineDelete } from "react-icons/ai";
import { BiColorFill } from "react-icons/bi";
import toast from "react-hot-toast";
import { LoadAccount, RemoveProductCard } from "../Redux/Slice/authSlice";
import LoginPrompt from "./loginProment";
import { formatPrice } from "../Page/Product/format";

function ProductCard({ data, onProductDelete, priority = false, variant = "grid" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLike, setIsLike] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [productExists, setProductExists] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { userName, role, data: userData } = useSelector((state) => state.auth);

  // Memoized calculations
  const productInfo = useMemo(() => {
    if (!data) return {};

    const isNew = (createdAt) => {
      const today = new Date();
      const uploadDate = new Date(createdAt);
      return (today - uploadDate) / (1000 * 3600 * 24) <= 7;
    };

    const calculateFinalPrice = () => {
      const basePrice = data.price || 0;
      const gst = data.gst || 0;
      const discount = data.discount || 0;
      
      const priceWithGST = basePrice + (basePrice * gst) / 100;
      const finalPrice = priceWithGST - (priceWithGST * discount) / 100;
      
      return {
        originalPrice: priceWithGST,
        finalPrice,
        savings: priceWithGST - finalPrice
      };
    };

    const getProductTypeInfo = () => {
      switch (data.productType) {
        case "simple":
          return {
            icon: <FiPackage className="w-3 h-3" />,
            label: "Simple",
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          };
        case "variant":
          return {
            icon: <BiColorFill className="w-3 h-3" />,
            label: "Variant",
            color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          };
        case "bundle":
          return {
            icon: <FiPackage className="w-3 h-3" />,
            label: "Bundle",
            color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          };
        default:
          return {
            icon: <FiPackage className="w-3 h-3" />,
            label: "Product",
            color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          };
      }
    };

    return {
      ...calculateFinalPrice(),
      isNew: isNew(data.createdAt),
      typeInfo: getProductTypeInfo(),
      hasDiscount: (data.discount || 0) > 0,
      priceRange: data.priceRange
    };
  }, [data]);

  useEffect(() => {
    let isLiked = false;
    if (isLoggedIn) {
      isLiked = data?.ProductLikes?.some(
        (item) => item.userName?.toString() === userName
      );
    } else {
      const guestLikes = JSON.parse(localStorage.getItem("guestLikes") || "[]");
      isLiked = guestLikes.includes(data?._id);
    }

    const productExists = userData?.walletAddProducts?.some(
      (item) => item.product?.toString() === data?._id
    );

    setIsLike(isLiked);
    setProductExists(productExists);
  }, [data, userData, userName, isLoggedIn]);

  const handleLikeDislike = async (id) => {
    if (!isLoggedIn) {
      // Handle guest likes in localStorage
      const guestLikes = JSON.parse(localStorage.getItem("guestLikes") || "[]");
      const isLiked = guestLikes.includes(id);
      if (isLiked) {
        const updatedLikes = guestLikes.filter(likeId => likeId !== id);
        localStorage.setItem("guestLikes", JSON.stringify(updatedLikes));
        setIsLike(false);
        toast.success("Removed from likes!");
      } else {
        guestLikes.push(id);
        localStorage.setItem("guestLikes", JSON.stringify(guestLikes));
        setIsLike(true);
        toast.success("Added to likes!");
      }
      return;
    }
    setIsLike((prev) => !prev);
    await dispatch(LikeAndDisLike(id));
  };

  const getProductSKU = (product) => {
    if (product.productType === "simple") {
      return product?.sku;
    } else if (product.productType === "bundle") {
      return product?.sku;
    } else if (product.productType === "variant") {
      return product.sku;
    }
    return null;
  };

  const handleAddToCart = async (productId) => {
    const sku = getProductSKU(data);
    if (!sku) {
      toast.error("Unable to add product to cart. SKU not found.");
      return;
    }

    if (!isLoggedIn) {
      // Handle guest cart in localStorage
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingIndex = guestCart.findIndex(item => item.productId === productId && item.sku === sku);

      if (existingIndex !== -1) {
        guestCart.splice(existingIndex, 1);
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        setProductExists(false);
        toast.success("Removed from cart!");
      } else {
        guestCart.push({ productId, sku, quantity: 1 });
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        setProductExists(true);
        toast.success("Added to cart!");
      }
      return;
    }

    setProductExists(!productExists);
    if (!productExists) {
      await dispatch(AddProductCard({id:productId, sku}));
      toast.success("Added to cart!");
    } else {
      await dispatch(RemoveProductCard(productId));
      toast.success("Removed from cart!");
    }
    dispatch(LoadAccount());
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await dispatch(DeleteProduct(productId));
      toast.success("Product deleted successfully");
      onProductDelete?.(productId);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${data._id}`);
  };

  // Dynamic sizing based on variant
  const cardClasses = {
    featured: "w-[260px] max-w-xs:w-[160px]",
    grid: "w-full max-w-[280px]"
  };

  return (
    <div className={`${cardClasses[variant]} group relative`}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
          <div className="aspect-square p-3 flex items-center justify-center">
            <img
              src={data?.thumbnail || "/placeholder-product.jpg"}
              alt={data.name || "Product Image"}
              className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${isHovered ? "scale-110" : "scale-100"}`}
              onLoad={() => setImageLoaded(true)}
              onClick={handleProductClick}
              loading={priority ? "eager" : "lazy"}
            />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {productInfo.isNew && (
              <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                NEW
              </span>
            )}
          </div>


        </div>

        {/* Content Section */}
        <div className="p-3">
          {/* Product Name */}
          <h3 
            className="font-semibold text-gray-800 md:text-sm sm:text-sx  dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors duration-300"
            onClick={handleProductClick}
          >
            {data.name}
          </h3>

          {/* Category */}
          {data?.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {data.category}
            </p>
          )}

          {/* Price Section */}
          <div className="mb-3">
            {data.productType === "variant" && productInfo.priceRange ? (
              <div className="text-xl md:text-sm sm:text-sx font-bold text-gray-800 dark:text-white">
                {formatPrice(productInfo.priceRange.min)} - {formatPrice(productInfo.priceRange.max)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  (Price Range)
                </span>
              </div>
            ) : (
              <div className="flex items-baseline space-x-2">
                <span className="text-xl md:text-sm sm:text-sx font-bold text-gray-800 dark:text-white">
                  {formatPrice(productInfo.finalPrice)}
                </span>
                {productInfo.hasDiscount && (
                  <>
                    <span className="text-sm md:text-sm sm:text-sx text-gray-500 line-through">
                      {formatPrice(productInfo.originalPrice)}
                    </span>
                    <span className="text-base md:text-sm sm:text-sx font-medium text-green-600">
                      Save {formatPrice(productInfo.savings)}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {role === "ADMIN" || role === "AUTHOR" ? (
              <>
                <button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md transition-colors duration-300 flex items-center justify-center space-x-1 text-sm"
                  onClick={() => handleDeleteProduct(data._id)}
                >
                  <AiOutlineDelete className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md transition-colors duration-300 flex items-center justify-center space-x-1 text-sm"
                  onClick={() => navigate("/Admin/Edit-Product", { state: { ...data } })}
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`flex-1 py-2 px-3 rounded-md transition-all duration-300 flex items-center justify-center space-x-1 text-sm font-medium ${
                    productExists
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  onClick={() => handleAddToCart(data._id)}
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span>{productExists ? "In Cart" : "Add to Cart"}</span>
                </button>
                <button
                  className={`py-2 px-3 rounded-md transition-all duration-300 flex items-center justify-center text-sm ${
                    isLike
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => handleLikeDislike(data._id)}
                >
                  <FiHeart className={`w-4 h-4 ${isLike ? "fill-current" : ""}`} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <LoginPrompt show={showLoginPrompt} setShow={setShowLoginPrompt} />
      )}
    </div>
  );
}

export default ProductCard;
