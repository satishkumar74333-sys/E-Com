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
      <div className="min-h-[100vh] max-w-xs:pt-[20px] ">
        <SearchBar
          setQueryBarTitle={searchTitle}
          onSearch={handleSearch}
          width={"w-[80%]"}
          TopMargin={"mt-[10px]"}
        />
        <div className="container mx-auto ">
          {loading ? (
            <div className="text-center py-8">
              {" "}
              {search ? "searching products..." : "Loading products..."}
            </div>
          ) : products?.length > 0 ? (
            <>
              {search && (
                <h1 className=" my-10 text-center text-2xl font-serif text-black dark:text-white">
                  Your Search product
                </h1>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 my-6 w-full">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    data={product}
                    loadProduct={() => fetchProducts()}
                    onProductDelete={handleProductDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap justify-center  space-x-2 space-y-2 mb-2">
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 border rounded bg-white text-blue-500 border-blue-500"
                  >
                    Previous
                  </button>
                )}
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 border rounded ${
                      index + 1 === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-white text-blue-500 border-blue-500"
                    }`}
                    disabled={index + 1 === currentPage}
                  >
                    {index + 1}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 border rounded bg-white text-blue-500 border-blue-500"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              {" "}
              {search ? "Not Available product..." : "No products Found..."}
            </div>
          )}
        </div>
        {/* feedback section */}
        <div className="w-full  ">
          <hr className="h-1 bg-slate-200" />
          <h1 className="text-2xl font-bold mb-4 ml-10 text-start dark:text-white text-black">
            feedback Section
          </h1>
          <FeedbackForm />
          <FeedbackList />
        </div>
      </div>
    </Layout>
  );
}
export default Product;
