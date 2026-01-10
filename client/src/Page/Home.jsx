import React, { useEffect, useState, useMemo } from "react";
import Layout from "../layout/layout";
import ProductCard from "../Components/productCard";
import { useDispatch, useSelector } from "react-redux";
import { getAllProduct } from "../Redux/Slice/ProductSlice";
import CarouselSlide from "../Components/CarouselSlice";
import LoginPrompt from "../Components/loginProment";
import FeedbackForm from "../Components/feedbackfrom";
import FeedbackList from "../Components/feedbackList";
import { getAllCarousel } from "../Redux/Slice/CarouselSlice";
import { FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [oneTime, setOneTime] = useState(true);
  
  const dispatch = useDispatch();
  const navigate= useNavigate()
  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const { product = [], topProducts = [] } = useSelector((state) => state.product);
  const carousel = useSelector((state) => state.carousel.Carousel);

  // Memoized filtered products
  const { displayProducts, popularProducts } = useMemo(() => {
    const popular = topProducts.slice(0, 8);
    const regular = product.filter(p => !topProducts.some(tp => tp._id === p._id)).slice(0, 20);

    return {
      displayProducts: regular,
      popularProducts: popular
    };
  }, [product, topProducts]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(getAllCarousel()),
        dispatch(getAllProduct({ page: 1, limit: 25 }))
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = (productId) => {
    // This will be handled by Redux state automatically
  };

  // Auto-slide carousel
  useEffect(() => {
    if (!loading && carousel?.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev + 1) % carousel.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [loading, carousel?.length]);

  // Login prompt after 10 seconds
  useEffect(() => {
    if (!loading && oneTime && !isLoggedIn) {
      const timer = setTimeout(() => {
        setShow(true);
        setOneTime(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [loading, oneTime, isLoggedIn]);

  useEffect(() => {
    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                Welcome to <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">KGS DOORS</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Discover premium quality doors and furniture for your home. Crafted with excellence, designed for perfection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/Product')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => navigate('/About')}
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        </section>

        {/* Enhanced Carousel Section */}
        <section className="relative py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Collections
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Explore our latest and most popular products
              </p>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative w-full overflow-hidden h-[400px] md:h-[500px]">
                  <div
                    className={`flex h-full ${isAnimating ? "transition-transform duration-700 ease-in-out" : ""}`}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {carousel?.map((slide, index) => (
                      <CarouselSlide
                        key={index}
                        image={slide?.images[0]?.secure_url}
                        title={slide?.name}
                        description={slide?.description}
                      />
                    ))}
                  </div>

                  {/* Enhanced Navigation Dots */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {carousel?.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentSlide === index
                            ? "bg-blue-600 scale-125 shadow-lg"
                            : "bg-gray-400 hover:bg-gray-600"
                        }`}
                        onClick={() => {
                          setIsAnimating(true);
                          setCurrentSlide(index);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      

        {/* Popular Products Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <FiTrendingUp className="text-3xl text-orange-500 mr-3 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Trending Products
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover our most popular items loved by customers worldwide
              </p>
            </div>

            <div className="relative">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex space-x-6 w-max px-4">
                  {popularProducts?.map((product, index) => (
                    <div key={product._id} className="flex-shrink-0 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <ProductCard
                        data={product}
                        onProductDelete={handleProductDelete}
                        priority={index < 4}
                        variant="featured"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Products Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <FiShoppingBag className="text-3xl text-blue-500 mr-3 animate-bounce" />
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  All Products
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our complete collection of amazing products crafted with care
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {displayProducts?.map((product, index) => (
                <div key={product._id} className="animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                  <ProductCard
                    data={product}
                    onProductDelete={handleProductDelete}
                    variant="grid"
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={()=>navigate("/product")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View All Products
              </button>
            </div>

            {displayProducts?.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-gray-500 dark:text-gray-400 text-xl">
                  No products available at the moment
                </p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Check back soon for new arrivals!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Feedback Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Hear from our satisfied customers
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                <FeedbackForm />
              </div>
              <FeedbackList />
            </div>
          </div>
        </section>

        {show && <LoginPrompt show={show} setShow={setShow} />}
      </div>
    </Layout>
  );
}

export default HomePage;
