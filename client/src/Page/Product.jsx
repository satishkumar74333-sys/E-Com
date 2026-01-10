import { useDispatch } from "react-redux";
import { getAllProduct, getSearchProduct } from "../Redux/Slice/ProductSlice";

import { useEffect, useState } from "react";
import ProductCard from "../Components/productCard";
import Layout from "../layout/layout";
import FeedbackForm from "../Components/feedbackfrom";
import FeedbackList from "../Components/feedbackList";
import { useLocation } from "react-router-dom";
import SearchBar from "../Components/SearchBar";

function Product() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const dispatch = useDispatch();
  const { state } = useLocation();

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setSearchTitle(query);
      const res = await dispatch(getSearchProduct(query));
      setLoading(false);
      setSearch(true);
      setProducts(res?.payload?.data);
    } catch (error) {
      alert(error.message);
    }
  };
  const fetchProducts = async (page) => {
    setLoading(true);

    try {
      if (state) {
        setSearchTitle(state);
        const res = await dispatch(getSearchProduct(state));

        setProducts(res?.payload?.data);

        setSearch(true);
      } else {
        setSearch(false);
        const response = await dispatch(
          getAllProduct({ page, limit: window.innerWidth > 760 ? "50" : "25" })
        );
        const { data, totalPages } = response.payload;
        setProducts(data);
        setTotalPages(totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
    } finally {
      setLoading(false); // Hide loader
    }
  };

  function handleProductDelete(productId) {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== productId)
    );
  }

  useEffect(() => {
    fetchProducts(1); // Load the first page initially
  }, []);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      fetchProducts(page);
    }
  };

  return (
    <Layout load={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {search ? `Search Results for "${searchTitle}"` : "All Products"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {search ? `Found ${products?.length || 0} products` : "Discover our complete collection"}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full lg:w-auto">
                <SearchBar
                  setQueryBarTitle={searchTitle}
                  onSearch={handleSearch}
                  width="w-full"
                  TopMargin="mt-0"
                />
              </div>
              {/* Future: Add filter dropdowns here */}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  {search ? "Searching products..." : "Loading products..."}
                </p>
              </div>
            </div>
          ) : products?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
                {products.map((product, index) => (
                  <div key={product._id} className="animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                    <ProductCard
                      data={product}
                      loadProduct={() => fetchProducts()}
                      onProductDelete={handleProductDelete}
                    />
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              <div className="flex flex-wrap justify-center items-center space-x-2 space-y-2">
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200"
                  >
                    Previous
                  </button>
                )}
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const pageNum = Math.max(1, currentPage - 2) + index;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                        pageNum === currentPage
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {search ? "No products found" : "No products available"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {search
                  ? "Try adjusting your search terms or browse all products"
                  : "Check back later for new arrivals"
                }
              </p>
              {search && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  View All Products
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Customer Reviews
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                See what our customers are saying
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-4"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 mb-8">
                <FeedbackForm />
              </div>
              <FeedbackList />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
export default Product;
