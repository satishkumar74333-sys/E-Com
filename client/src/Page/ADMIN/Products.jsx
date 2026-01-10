import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAllProduct } from "../../Redux/Slice/ProductSlice";
import { LoadAccount } from "../../Redux/Slice/authSlice";
import Layout from "../../layout/layout";
import { ProductsCart } from "../../Components/DashBoard/ProductDataCart";

const Products = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page) => {
    try {
      const productsRes = await dispatch(
        getAllProduct({ page, limit: window.innerWidth > 760 ? "50" : "25" })
      );
      const { data, totalPages } = productsRes.payload;
      setProducts(data);
      setTotalPages(totalPages);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const loadProfile = async () => {
    await dispatch(LoadAccount());
  };

  useEffect(() => {
    fetchProducts(1);
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen select-none">
        <header className="bg-white dark:bg-gray-800 shadow-sm top-[50px] sm:top-[66px] z-40 w-full fixed">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-indigo-600">Products Management</h1>
            </div>
          </div>
        </header>
        <div className="pt-[100px] max-w-xs:pt-[50px]">
          <ProductsCart
            currentPage={currentPage}
            totalPages={totalPages}
            products={products}
            fetchProducts={fetchProducts}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Products;