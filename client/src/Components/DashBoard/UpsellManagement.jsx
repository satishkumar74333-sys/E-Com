import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUpsells, createUpsell, updateUpsell, deleteUpsell } from "../../Redux/Slice/UpsellSlice";
import { getAllProduct, getProduct } from "../../Redux/Slice/ProductSlice";
import LoadingButton from "../../constants/LoadingBtn";
import { formatPrice } from "../../Page/Product/format";
import toast from "react-hot-toast";
import Layout from "../../layout/layout";

const UpsellManagement = () => {
  const dispatch = useDispatch();
  const { upsells=[], loading } = useSelector((state) => state?.upsell);
  const products = useSelector((state) => state.product.product);

  const [selectedUpsell, setSelectedUpsell] = useState(null);
  const [formData, setFormData] = useState({
    triggerProduct: "",
    upsellProducts: [],
    minQty: 1,
    active: true,
  });
  const [selectedVariants, setSelectedVariants] = useState({}); // productId -> sku
  const [isEditing, setIsEditing] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [fullProductDetails, setFullProductDetails] = useState({});
const [isloading,setIsloading]=useState(false)
  useEffect(() => {
    dispatch(getAllUpsells());
    const loadProducts = async () => {
      setProductsLoading(true);
      await dispatch(getAllProduct({ limit: 1000 })); // Increase limit to get more products
      setProductsLoading(false);
    };
    loadProducts();
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      triggerProduct: "",
      upsellProducts: [],
      minQty: 1,
      active: true,
    });
    setSelectedUpsell(null);
    setIsEditing(false);
    setSelectedVariants({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.triggerProduct || formData.upsellProducts.length === 0) {
      toast.error("Please select trigger product and at least one upsell product");
      return;
    }

    // Validate that all upsell products have required fields
    for (const item of formData.upsellProducts) {
      if (!item.product || item.discountValue < 0 || isNaN(item.discountValue)) {
        toast.error("Please fill all upsell product details with valid discount values");
        return;
      }
    }

    try {
      if (isEditing && selectedUpsell) {
        await dispatch(updateUpsell({ id: selectedUpsell._id, data: formData }));
      } else {
       setIsloading(true)
       const res=  await dispatch(createUpsell(formData));
       setIsloading(false)
       
      if(res?.payload.success){
        toast.success(res?.payload.message)
        resetForm();
            }else{
               toast.error(res?.payload.message)
            }
          }
    } catch (error) {
      console.error("Upsell save error:", error);
      toast.error(error?.response?.data?.message || "Failed to save upsell");
    }
  };

  const handleEdit = async (upsell) => {
    setSelectedUpsell(upsell);
    const variants = {};
    upsell.upsellProducts.forEach(item => {
      if (item.sku) {
        variants[item.product?._id || item.product] = item.sku;
      }
    });
    setSelectedVariants(variants);

    // Fetch full product details for variant products
    const variantProducts = upsell.upsellProducts.filter(item =>
      products?.find(p => p._id === (item.product?._id || item.product))?.productType === "variant"
    );
    for (const item of variantProducts) {
      const productId = item.product?._id || item.product;
      if (!fullProductDetails[productId]) {
        try {
          const res = await dispatch(getProduct(productId));
          if (res?.payload?.success) {
            setFullProductDetails(prev => ({ ...prev, [productId]: res.payload.data }));
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
    }

    setFormData({
      triggerProduct: upsell.triggerProduct?._id || upsell.triggerProduct,
      upsellProducts: upsell.upsellProducts.map(item => ({
        product: item.product?._id || item.product,
        sku: item.sku,
        discountType: item.discountType,
        discountValue: item.discountValue,
      })),
      minQty: upsell.minQty,
      active: upsell.active,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this upsell?")) {
      await dispatch(deleteUpsell(id));
    }
  };

  const handleSelectUpsell = (id) => {
    setSelectedUpsells(prev =>
      prev.includes(id)
        ? prev.filter(upsellId => upsellId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUpsells.length === filteredUpsells.length) {
      setSelectedUpsells([]);
    } else {
      setSelectedUpsells(filteredUpsells.map(u => u._id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedUpsells.length === 0) {
      toast.error("Please select upsells first");
      return;
    }

    if (!bulkAction) {
      toast.error("Please select an action");
      return;
    }

    try {
      if (bulkAction === "activate") {
        for (const id of selectedUpsells) {
          const upsell = upsells.find(u => u._id === id);
          if (upsell && !upsell.active) {
            await dispatch(updateUpsell({ id, data: { ...upsell, active: true } }));
          }
        }
        toast.success("Selected upsells activated");
      } else if (bulkAction === "deactivate") {
        for (const id of selectedUpsells) {
          const upsell = upsells.find(u => u._id === id);
          if (upsell && upsell.active) {
            await dispatch(updateUpsell({ id, data: { ...upsell, active: false } }));
          }
        }
        toast.success("Selected upsells deactivated");
      } else if (bulkAction === "delete") {
        if (window.confirm(`Delete ${selectedUpsells.length} upsell(s)?`)) {
          for (const id of selectedUpsells) {
            await dispatch(deleteUpsell(id));
          }
          toast.success("Selected upsells deleted");
        }
      }
      setSelectedUpsells([]);
      setBulkAction("");
    } catch (error) {
      toast.error("Bulk operation failed");
    }
  };

  const addUpsellProduct = () => {
    setFormData(prev => ({
      ...prev,
      upsellProducts: [...prev.upsellProducts, { product: "", sku: "", discountType: "percentage", discountValue: 0 }]
    }));
  };

  const removeUpsellProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      upsellProducts: prev.upsellProducts.filter((_, i) => i !== index)
    }));
  };

  const updateUpsellProduct = async (index, field, value) => {
    if (field === "discountValue") {
      const num = parseFloat(value);
      value = isNaN(num) ? 0 : num;
    }
    if (field === "product") {
      // Reset sku when product changes
      setSelectedVariants(prev => ({ ...prev, [value]: "" }));

      // Fetch full product details if it's a variant
      const selectedProduct = products?.find(p => p._id === value);
      if (selectedProduct?.productType === "variant" && !fullProductDetails[value]) {
        try {
          const res = await dispatch(getProduct(value));
          if (res?.payload?.success) {
            setFullProductDetails(prev => ({ ...prev, [value]: res.payload.data }));
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }

      setFormData(prev => ({
        ...prev,
        upsellProducts: prev.upsellProducts.map((item, i) =>
          i === index ? { ...item, [field]: value, sku: "" } : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        upsellProducts: prev.upsellProducts.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      }));
    }
  };

  const updateVariantSelection = (productId, sku) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: sku }));
    // Update formData sku for the corresponding upsell product
    setFormData(prev => ({
      ...prev,
      upsellProducts: prev.upsellProducts.map(item =>
        item.product === productId ? { ...item, sku } : item
      )
    }));
  };

  const getProductName = (productId) => {
    const product = products?.find(p => p._id === productId);
    return product ? product.name : "Unknown Product";
  };

  const getProductPrice = (productId, sku) => {
    const product = products?.find(p => p._id === productId);
    if (!product) return 0;

    if (product.productType === "simple") {
      return product.simpleProduct?.finalPrice || 0;
    } else if (product.productType === "variant") {
      if (sku) {
        const color = product.variants?.flatMap(v => v.colors).find(c => c.sku === sku);
        return color?.finalPrice || 0;
      }
      return product.variants?.[0]?.colors?.[0]?.finalPrice || 0;
    } else if (product.productType === "bundle") {
      return product.bundleProducts?.finalPrice || 0;
    }
    return 0;
  };

  const getVariantOptions = (productId) => {
    const product = fullProductDetails[productId] || products?.find(p => p._id === productId);
    if (!product || product.productType !== "variant") return [];

    const options = [];
    product.variants?.forEach(variant => {
      variant.colors?.forEach(color => {
        options.push({
          sku: color.sku,
          label: `${variant.size} - ${color.name} (${formatPrice(color.finalPrice || color.price)})`,
          price: color.finalPrice || color.price
        });
      });
    });
    return options;
  };

  // Filter and sort upsells
  const filteredUpsells = upsells?.filter(upsell => {
    const triggerProductName = getProductName(upsell.triggerProduct?._id || upsell.triggerProduct).toLowerCase();
    const matchesSearch = triggerProductName.includes(searchTerm.toLowerCase());

    if (filterStatus === "active") return matchesSearch && upsell.active;
    if (filterStatus === "inactive") return matchesSearch && !upsell.active;
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "name":
        const nameA = getProductName(a.triggerProduct?._id || a.triggerProduct).toLowerCase();
        const nameB = getProductName(b.triggerProduct?._id || b.triggerProduct).toLowerCase();
        return nameA.localeCompare(nameB);
      default:
        return 0;
    }
  }) || [];

  // Calculate analytics
  const analytics = {
    totalUpsells: upsells?.length || 0,
    activeUpsells: upsells?.filter(u => u.active).length || 0,
    totalProductsInUpsells: upsells?.reduce((sum, u) => sum + u.upsellProducts.length, 0) || 0,
    averageDiscount: upsells?.length > 0
      ? Math.round(
          upsells.reduce((sum, u) =>
            sum + u.upsellProducts.reduce((prodSum, prod) =>
              prodSum + (prod.discountType === 'percentage' ? prod.discountValue : 0), 0
            ), 0
          ) / upsells.reduce((sum, u) => sum + u.upsellProducts.length, 0) || 1
        )
      : 0,
  };

  return (
    <Layout>    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Upsell Management</h2>

          {/* Quick Analytics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalUpsells}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Rules</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.activeUpsells}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Rules</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalProductsInUpsells}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Products in Rules</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.averageDiscount}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Discount</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Upsell" : "Create New Upsell"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trigger Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trigger Product
                </label>
                <select
                  value={formData.triggerProduct}
                  onChange={(e) => setFormData(prev => ({ ...prev, triggerProduct: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  disabled={productsLoading}
                >
                  <option className="w-[250px]" value="">
                    {productsLoading ? "Loading products..." : "Select Trigger Product"}
                  </option>
                  {products?.map(product => (
                  <option
  key={product._id}
  value={product._id}
  title={`${product.name} - ${formatPrice(getProductPrice(product._id))}`}
>
  {product.name.length > 40
    ? product.name.slice(0, 40) + "..."
    : product.name}{" "}
  - {formatPrice(getProductPrice(product._id))}
</option>

                  ))}
                </select>
              </div>

              {/* Minimum Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Quantity Required
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minQty}
                  onChange={(e) => setFormData(prev => ({ ...prev, minQty: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>

              {/* Upsell Products */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upsell Products
                  </label>
                  <button
                    type="button"
                    onClick={addUpsellProduct}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="space-y-3">
                   {formData.upsellProducts.map((item, index) => {
                     const selectedProduct = products?.find(p => p._id === item.product);
                     const isVariant = selectedProduct?.productType === "variant";
                     const variantOptions = getVariantOptions(item.product);

                     return (
                       <div key={index} className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <select
                             value={item.product}
                             onChange={(e) => updateUpsellProduct(index, "product", e.target.value)}
                             className="p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                             required
                             disabled={productsLoading}
                           >
                             <option value="">
                               {productsLoading ? "Loading..." : "Select Product"}
                             </option>
                             {products?.filter(p => p._id !== formData.triggerProduct).map(product => (
                               <option key={product._id} value={product._id}>
                                 {product.name}
                               </option>
                             ))}
                           </select>

                           <select
                             value={item.discountType}
                             onChange={(e) => updateUpsellProduct(index, "discountType", e.target.value)}
                             className="p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                           >
                             <option value="percentage">Percentage</option>
                             <option value="flat">Flat Amount</option>
                           </select>

                           <div className="flex gap-2">
                             <input
                               type="number"
                               min="0"
                               step={item.discountType === "percentage" ? "1" : "0.01"}
                               value={item.discountValue||0}
                               onChange={(e) => updateUpsellProduct(index, "discountValue", parseFloat(e.target.value))}
                               placeholder={item.discountType === "percentage" ? "%" : "Amount"}
                               className="flex-1 p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                               required
                             />
                             <button
                               type="button"
                               onClick={() => removeUpsellProduct(index)}
                               className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                             >
                               ×
                             </button>
                           </div>
                         </div>

                         {isVariant && (
                           <div className="mt-3">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Select Variant (Optional - leave empty to apply discount to entire product)
                             </label>
                             <select
                               value={item.sku || ""}
                               onChange={(e) => updateVariantSelection(item.product, e.target.value)}
                               className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                             >
                               <option value="">Apply to entire product</option>
                               {variantOptions.length > 0 ? (
                                 variantOptions.map(option => (
                                   <option key={option.sku} value={option.sku}>
                                     {option.label}
                                   </option>
                                 ))
                               ) : (
                                 <option disabled>Loading variants...</option>
                               )}
                             </select>
                           </div>
                         )}

                         {item.product && (
                           <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                             Original Price: {formatPrice(getProductPrice(item.product, item.sku))}
                             {item.discountType === "percentage" ? (
                               <> → Discounted: {formatPrice(getProductPrice(item.product, item.sku) * (1 - item.discountValue / 100))}</>
                             ) : (
                               <> → Discounted: {formatPrice(getProductPrice(item.product, item.sku) - item.discountValue)}</>
                             )}
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
              </div>

              <div className="flex gap-3">
                <LoadingButton
                  loading={loading||isloading}
                  type="submit"
                  className="flex-1 " 
                  message={"loading..."}
                  name={isEditing ? "Update Upsell" : "Create Upsell"}
                />
                  
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Existing Upsells</h3>

              {/* Bulk Actions */}
              {selectedUpsells.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="">Choose Action</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Apply ({selectedUpsells.length})
                  </button>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by trigger product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>


            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredUpsells.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {upsells?.length === 0 ? "No upsells created yet" : "No upsells match your filters"}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedUpsells.length === filteredUpsells.length && filteredUpsells.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select All ({filteredUpsells.length})
                  </label>
                </div>

                {filteredUpsells.map(upsell => (
                  <div key={upsell._id} className={`border border-gray-300 dark:border-gray-600 p-4 rounded-lg transition-colors ${
                    selectedUpsells.includes(upsell._id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedUpsells.includes(upsell._id)}
                          onChange={() => handleSelectUpsell(upsell._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Trigger: {getProductName(upsell.triggerProduct?._id || upsell.triggerProduct)}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Min Qty: {upsell.minQty} | Status:
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                              upsell.active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {upsell.active ? "Active" : "Inactive"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(upsell)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(upsell._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upsell Products:</p>
                      {upsell.upsellProducts.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                          • {getProductName(item.product?._id || item.product)} -
                          {item.discountType === "percentage"
                            ? ` ${item.discountValue}% off`
                            : ` ${formatPrice(item.discountValue)} off`
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div></Layout>

  );
};

export default UpsellManagement;