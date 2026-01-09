import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../layout/layout";
import {
  getProduct,
  getAllProduct,
} from "../../Redux/Slice/ProductSlice";
import LoadingButton from "../../constants/LoadingBtn";
import { LikeAndDisLike } from "../../Redux/Slice/ProductSlice";
import { addToCart } from "../../Redux/Slice/CartSlice";
import ProductCard from "../../Components/productCard";
import FeedbackForm from "../../Components/feedbackfrom";
import FeedbackList from "../../Components/feedbackList";
import LoginPrompt from "../../Components/loginProment";
import UpsellComponent from "../../Components/UpsellComponent";
import { formatPrice } from "../Product/format";
import toast from "react-hot-toast";

// Icons
import {
  FiShare2,
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiPackage,
  FiTag,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiZoomIn,
  FiX,
} from "react-icons/fi";
import { BsLightning } from "react-icons/bs";
import { MdVerified } from "react-icons/md";

function ProductDescription() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname, state=[] } = useLocation();
  const productId = pathname.split("/").pop();
  const { data: userData, isLoggedIn } = useSelector((s) => s.auth);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [bundledProducts, setBundledProducts] = useState([]);
  const [bundledLoading, setBundledLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bundlePrice, setBundlePrice] = useState(0);
  const [bundleDiscount, setBundleDiscount] = useState(0);
  const [bundleStock, setBundleStock] = useState("In stock");

  // Variant
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColorData, setSelectedColorData] = useState(null);
  const getProductSKU = (product, selectedColorData) => {
    if (product.productType === "simple") {
      return product?.simpleProduct.sku;
    } else if (product.productType === "bundle") {
      return product?.bundleProducts.sku;
    } else if (product.productType === "variant") {
      return selectedColorData?.sku;
    }
    return null;
  };

  /* ================= PRODUCT INFO ================= */
  const productInfo = useMemo(() => {
    if (!productData) return {};

    // ---------- IMAGES ----------
    let images = [];
    if (productData.productType === "simple") {
      images = productData.simpleProduct?.images || [];
    } else if (productData.productType === "variant") {
      images =
        selectedColorData?.images ||
        productData.variants?.[0]?.colors?.[0]?.images ||
        [];
    } else if (productData.productType === "bundle") {
      images = productData.bundleProducts?.images || [];
    }

    // ---------- PRICE ----------
    let price = 0,
      finalPrice = 0,
      discount = 0;

    if (productData.productType === "simple") {
      price = productData.simpleProduct?.price || 0;
      discount = productData.simpleProduct?.discount || 0;
      finalPrice =
        price - Math.round((price * discount) / 100);
    }

    if (productData.productType === "variant") {
      const colorData = selectedColorData || productData.variants?.[0]?.colors?.[0];
      if (colorData) {
        price = colorData.price || 0;
        discount = colorData.discount || 0;
        finalPrice = price - Math.round((price * discount) / 100);
      }
    }

    if (productData.productType === "bundle") {
      price = bundlePrice;
      discount = bundleDiscount;
      finalPrice = price - Math.round((price * discount) / 100);
    }

    return {
      images,
      price,
      finalPrice,
      discount,
      stock:
        productData.productType === "variant"
          ? (selectedColorData || productData.variants?.[0]?.colors?.[0])?.stockStatus
          : productData.productType === "bundle"
          ? bundleStock
          : productData.simpleProduct?.stockStatus || "In stock",
    };
  }, [productData, selectedColorData, bundlePrice, bundleDiscount]);

  /* ================= FETCH PRODUCT ================= */
  const loadProduct = async () => {
    try {
      setPageLoading(true);
      let data = state;
        const res = await dispatch(getProduct(productId));
        data = res?.payload?.data;

      setProductData(data);
      setLikeCount(data.likeCount || 0);
      // Assume not liked, or check from user data if available

      // auto select first variant
      if (data?.productType === "variant") {
        const firstVariant = data.variants?.[0];
        if (firstVariant) {
          setSelectedSize(firstVariant.size);
          setSelectedColorData(firstVariant.colors?.[0] || null);
        }
      }

      // fetch bundled products
      if (data?.productType === "bundle") {
        setBundledLoading(true);
        try {
          const productIds = data.bundleProducts.products.map(p => p.product);
          const responses = await Promise.all(productIds.map(id => dispatch(getProduct(id))));
          const bundled = responses.map(res => res.payload?.data).filter(Boolean);
          setBundledProducts(bundled);

          // Calculate bundle price and stock
          let totalPrice = 0;
          let isOutOfStock = false;
          bundled.forEach(p => {
            if (p.productType === "simple") {
              const price = p.simpleProduct?.price || 0;
              const discount = p.simpleProduct?.discount || 0;
              totalPrice += price - Math.round((price * discount) / 100);
              if (p.simpleProduct?.stockStatus !== "In stock") isOutOfStock = true;
            } else if (p.productType === "variant") {
              let minPrice = Infinity;
              let hasStock = false;
              p.variants?.forEach(v => v.colors?.forEach(c => {
                const price = c.price || 0;
                const discount = c.discount || 0;
                const final = price - Math.round((price * discount) / 100);
                if (final < minPrice) minPrice = final;
                if (c.stockQuantity > 0) hasStock = true;
              }));
              if (minPrice !== Infinity) totalPrice += minPrice;
              if (!hasStock) isOutOfStock = true;
            }
          });
          setBundlePrice(totalPrice);
          setBundleDiscount(data.bundleProducts?.discount || 0);
          setBundleStock(isOutOfStock ? "Out of stock" : "In stock");
        } catch (error) {
          console.error("Error fetching bundled products:", error);
          setBundledProducts([]);
        } finally {
          setBundledLoading(false);
        }
      }
    } catch {
      navigate("/");
    } finally {
      setPageLoading(false);
    }
  };

  /* ================= RELATED ================= */
  const loadRelated = async () => {
    if (!productData?.category) return;
    const res = await dispatch(
      getAllProduct({ category: productData.category, limit: 4 })
    );
    setRelatedProducts(res?.payload?.data || []);
  };

  /* ================= ACTIONS ================= */
  const handleAddToCart = async () => {
    if (productInfo.stock !== "In stock") {
      toast.error("Product is out of stock");
      return;
    }
    setLoading(true);
    const res= await dispatch(addToCart({
      productId: productData._id,
      sku: getProductSKU(productData, selectedColorData),
      quantity: quantity
    }));
    setLoading(false);
  };

  const handleBuyNow = () => {
    if (productInfo.stock !== "In stock") {
      toast.error("Product is out of stock");
      return;
    }
    navigate("/Product/New/Order-place", {
      state: {
        ProductId: productId,
        quantity,
        variant:
          productData.productType === "variant"
            ? selectedColorData
            : null,
      },
    });
  };

  const handleLike = async () => {
    if (!isLoggedIn) return setShowLoginPrompt(true);
    const res = await dispatch(LikeAndDisLike(productId));
    if (res?.payload?.success) {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleAddAllToCart = async () => {
    setLoading(true);
    try {
      // Add main product
      await dispatch(addToCart({
        productId: productData._id,
        sku: getProductSKU(productData, selectedColorData),
        quantity: quantity
      }));
      // Add related products
      for (const p of relatedProducts.slice(0, 2)) {
        await dispatch(addToCart({
          productId: p._id,
          sku: null, // Assuming simple products for related
          quantity: 1
        }));
      }
      toast.success("All products added to cart!");
    } catch (error) {
      toast.error("Failed to add products to cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    loadRelated();
  }, [productData]);

  useEffect(() => {
    if (productData && userData) {
      setIsLiked(productData.ProductLikes?.some(like => like.userName === userData.userName && like.ProductLike) || false);
    }
  }, [productData, userData]);

  if (pageLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ================= RENDER ================= */
  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <span>Home</span> / <span>{productData.category}</span> / <span className="text-gray-900 dark:text-gray-100 font-medium">{productData.name}</span>
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ================= IMAGE ================= */}
            <div className="relative self-start w-full order-1 lg:order-1">
          {productInfo.images.length ? (
            <img
              src={productInfo.images[currentImageIndex]?.secure_url}
              className="w-full h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] object-contain cursor-zoom-in rounded-lg shadow-md"
              onClick={() => setShowImageModal(true)}
            />
          ) : (
            <div className="w-full h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FiPackage className="w-24 h-24 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          {productInfo.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((i) =>
                    i === 0 ? productInfo.images.length - 1 : i - 1
                  )
                }
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((i) =>
                    (i + 1) % productInfo.images.length
                  )
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
                {productInfo.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? "border-blue-500 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img.secure_url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ================= INFO ================= */}
        <div className="space-y-6 order-2 lg:order-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{productData.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-4">Category: {productData.category} | Type: {productData.productType}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(productInfo.finalPrice)}
              </div>
              {productInfo.discount > 0 && (
                <span className="text-lg line-through text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                  {formatPrice(productInfo.price)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {productInfo.discount > 0 && (
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {productInfo.discount}% OFF
                </span>
              )}
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${productInfo.stock === "In stock" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
                {productInfo.stock}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <button onClick={handleLike} className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${isLiked ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <FiStar className={isLiked ? 'fill-current' : ''} /> {likeCount} Likes
            </button>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">{productData.orderCount || 0} Sold</span>
          </div>

          {/* VARIANT */}
          {productData.productType === "variant" && (
            <>
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {productData.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => {
                        setSelectedSize(v.size);
                        setSelectedColorData(v.colors[0]);
                      }}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedSize === v.size
                          ? "border-blue-500 bg-blue-500 text-white shadow-md"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {productData.variants
                    .find((v) => v.size === selectedSize)
                    ?.colors.map((c) => (
                      <button
                        key={c.name}
                        style={{ backgroundColor: c.hex || "#ccc" }}
                        onClick={() => setSelectedColorData(c)}
                        className={`w-10 h-10 border-2 rounded-full transition-all ${
                          selectedColorData?.name === c.name
                            ? "border-blue-500 scale-110 shadow-lg"
                            : "border-gray-300 dark:border-gray-600 hover:scale-105"
                        }`}
                        title={c.name}
                      >
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* QTY */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <span className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[3rem] text-center font-medium">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LoadingButton width={"w-[500px]"} name={ "Add to Cart "} color="bg-green-500 px-1 py-2" loading={loading} onClick={handleAddToCart}  disabled={productInfo.stock !== "In stock"}/>
            
            <button
              onClick={handleBuyNow}
              className={`px-2 py-2   rounded-lg flex item-center  transition-colors font-semibold ${productInfo.stock === "In stock" ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shadow-md" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
              disabled={productInfo.stock !== "In stock"}
            >
              <BsLightning className="mr-2" /> Buy Now
            </button>
          </div>
          {/* ================= BUNDLE PRODUCTS ================= */}
          {productData.productType === "bundle" && (
            bundledLoading ? (
              <div className="mt-8 text-center text-gray-600 dark:text-gray-400">Loading bundle details...</div>
            ) : bundledProducts.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Products in this Bundle</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {bundledProducts.map(p => {
                    let image = "";
                    let price = 0;
                    let discount = 0;
                    let finalPrice = 0;
                    let stock = "Out of stock";

                    if (p.productType === "simple") {
                      image = p.simpleProduct?.images?.[0]?.secure_url;
                      price = p.simpleProduct?.price || 0;
                      discount = p.simpleProduct?.discount || 0;
                      finalPrice = price - Math.round((price * discount) / 100);
                      stock = p.simpleProduct?.stockStatus || "Out of stock";
                    } else if (p.productType === "variant") {
                      image = p.variants?.[0]?.colors?.[0]?.images?.[0]?.secure_url;
                      const firstColor = p.variants?.[0]?.colors?.[0];
                      if (firstColor) {
                        price = firstColor.price || 0;
                        discount = firstColor.discount || 0;
                        finalPrice = price - Math.round((price * discount) / 100);
                        stock = firstColor.stockStatus || "Out of stock";
                      }
                    } else if (p.productType === "bundle") {
                      image = p.bundleProducts?.images?.[0]?.secure_url;
                      price = p.bundleProducts?.price || 0;
                      discount = p.bundleProducts?.discount || 0;
                      finalPrice = price - Math.round((price * discount) / 100);
                      stock = "In stock";
                    }

                    return (
                      <div key={p._id} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
                        {image && <img src={image} alt={p.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{p.productType}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-green-600">{formatPrice(finalPrice)}</span>
                            {discount > 0 && (
                              <span className="line-through text-gray-500">{formatPrice(price)}</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stock === "In stock" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
                              {stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {productInfo.discount > 0 && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 font-semibold text-center">
                      Bundle Discount: {productInfo.discount}% off - Save {formatPrice(productInfo.price - productInfo.finalPrice)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 text-center text-gray-600 dark:text-gray-400">No products found in bundle.</div>
            )
          )}
        </div>
        </div>

        {/* ================= UPSELL COMPONENT ================= */}
      <div className="container mx-auto px-4 mt-8">
        <UpsellComponent productId={productId} sku={productData.sku} productData={productData} />
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="container mx-auto px-4 mt-12">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-4">Product Description</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">{productData.description}</p>
          </div>
        </div>
      </div>

      {/* ================= FREQUENTLY BOUGHT TOGETHER ================= */}
      {relatedProducts.length > 1 && (
        <div className="container mx-auto px-4 mt-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">Frequently Bought Together</h2>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-8">
              <div className="text-center flex-shrink-0">
                <img src={productInfo.images[0]?.secure_url} alt={productData.name} className="w-24 h-24 object-cover rounded-lg mx-auto mb-3 shadow-md" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{productData.name}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatPrice(productInfo.finalPrice)}</p>
              </div>
              <span className="text-3xl text-gray-400 font-bold">+</span>
              {relatedProducts.slice(0, 2).map((p, i) => {
                const price = Number(p.finalPrice || p.price || 0);
                return (
                  <div key={p._id}>
                    <span className="text-3xl text-gray-400 font-bold">+</span>
                    <div className="text-center flex-shrink-0 ml-6">
                      <img src={p.images?.[0]?.secure_url || p.thumbnail} alt={p.name} className="w-24 h-24 object-cover rounded-lg mx-auto mb-3 shadow-md" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatPrice(price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Total: {formatPrice(
                      Number(productInfo.finalPrice || 0) +
                      relatedProducts.slice(0, 2).reduce((sum, p) => sum + Number(p.finalPrice || p.price || 0), 0)
                    )}
                  </p>
                  <p className="text-lg text-green-600 dark:text-green-400 font-semibold">Save 15% when bought together</p>
                </div>
                <button
                  onClick={handleAddAllToCart}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg transition-colors font-bold text-lg shadow-lg w-full sm:w-auto"
                >
                  {loading ? "Adding..." : "Add All to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= RELATED ================= */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 mt-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <div key={p._id} className="relative group">
                <ProductCard data={p} />
                {p.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                    {p.discount}% OFF
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-5 right-5 text-white hover:text-gray-300 transition-colors"
          >
            <FiX size={28} />
          </button>
          <img
            src={productInfo.images[currentImageIndex]?.secure_url}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* ================= FEEDBACK ================= */}
      <div className="container mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">Customer Reviews</h2>
        <div className="max-w-4xl mx-auto">
          <FeedbackForm productId={productId} />
          <FeedbackList productId={productId} />
        </div>
      </div>

        {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}
      </div>
      </div>
    </Layout>
  );
}

export default ProductDescription;
