import React, { useEffect, useState } from "react";
import ProductGallery from "./productGally";
import ProductInfo from "./proudctInfo";
import { DeleteIcon, EditIcon } from "./icon";
import Layout from "../../layout/layout";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { DeleteProduct, updateProduct } from "../../Redux/Slice/ProductSlice";
import { EditModal } from "../../Components/Product/editModule";
import toast from "react-hot-toast";

function SingleProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [product, setProduct] = useState(state);
  const [editingSlide, setEditingSlide] = useState(null);

  useEffect(() => {
    if (!state) {
      navigate(-1);
    } else {
      setProduct(state);
    }
  }, [state, navigate]);

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!isConfirmed) return;

    try {
      await dispatch(DeleteProduct(productId));
      toast.success("Product deleted successfully");

      navigate(-1);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  const handelOnSave = async (UpdatedProductData) => {
    if (!UpdatedProductData) {
      alert("Please provide the updated data.");
      return;
    }

    const formData = new FormData();
    formData.append("name", UpdatedProductData.name);
    formData.append("description", UpdatedProductData.description);
    formData.append("price", UpdatedProductData.price);
    formData.append("discount", UpdatedProductData.discount);
    formData.append("stock", UpdatedProductData.stock);
    formData.append("gst", UpdatedProductData.gst);
    formData.append("category", UpdatedProductData.category);

    UpdatedProductData.updatedImages.forEach((file) => {
      formData.append("images", file.file);
    });
    UpdatedProductData.updatedImages.forEach((file) => {
      formData.append("index", file.index);
    });
    try {
      const res = await dispatch(
        updateProduct({ data: formData, id: UpdatedProductData._id })
      );

      if (res.payload?.data) {
        setProduct(res.payload?.data);
        navigate(".", { state: res.payload?.data, replace: true });
        toast.success("Product updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update product.");
    }
  };

  return (
    <Layout>
      <div className=" shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 ">
          <ProductGallery images={product?.images} />
          <div className="p-8 flex flex-col relative">
            {product?.discount && (
              <p className=" absolute text-sm top-0 rounded-xl py-1 px-3 bg-red-300 ">
                {product?.discount}% off
              </p>
            )}
            <ProductInfo product={product} />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mt-10">
                {/* Edit Button */}
                <button
                  onClick={() => setEditingSlide(product)}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <EditIcon className="w-5 h-5 mr-2" />
                  Edit
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <DeleteIcon className="w-5 h-5 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingSlide && (
          <EditModal
            slide={editingSlide}
            onClose={() => setEditingSlide(null)}
            onSave={handelOnSave}
          />
        )}
      </div>
    </Layout>
  );
}

export default SingleProduct;
