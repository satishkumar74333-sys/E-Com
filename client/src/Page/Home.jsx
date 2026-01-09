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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        
        {/* Enhanced Carousel Section */}
        <section className="relative mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-2xl">
            <div className="relative w-full overflow-hidden h-[400px] max-w-xs:h-[250px]">
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
                        ? "bg-white scale-125 shadow-lg" 
                        : "bg-white/50 hover:bg-white/75"
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
        </section>

      

        {/* Popular Products Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FiTrendingUp className="text-3xl text-orange-500 mr-3" />
              <h2 className="text-3xl max-w-xs:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Trending Products
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-xs:text-sm">
              Discover our most popular items loved by customers
            </p>
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-6 max-w-xs:space-x-3 w-max">
                {popularProducts?.map((product, index) => (
                  <div key={product._id} className="flex-shrink-0">
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
        </section>

        {/* All Products Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FiShoppingBag className="text-3xl text-blue-500 mr-3" />
              <h2 className="text-3xl max-w-xs:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                All Products
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-xs:text-sm">
              Explore our complete collection of amazing products
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 max-w-xs:gap-3">
            {displayProducts?.map((product) => (
              <ProductCard
                key={product._id}
                data={product}
                onProductDelete={handleProductDelete}
                variant="grid"
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={()=>navigate("/product")} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300">
              View All Products
            </button>
          </div>

          {displayProducts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No products available at the moment
              </p>
            </div>
          )}
        </section>

        {/* Enhanced Feedback Section */}
        <section className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl max-w-xs:text-2xl font-bold text-gray-800 dark:text-white mb-4">
                What Our Customers Say
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <FeedbackForm />
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
