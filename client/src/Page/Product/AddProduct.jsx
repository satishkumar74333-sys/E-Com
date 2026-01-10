import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../layout/layout";
import LoadingButton from "../../constants/LoadingBtn";
import { AddNewProduct, getProductsForSelection } from "../../Redux/Slice/ProductSlice";
import { addCategory } from "../../Redux/Slice/CategorySlice";
import { formatPrice } from "./format";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE"];

const emptyColor = () => ({
  name: "",
  hex: "",
  price: "",
  discount: 0,
  stockQuantity: "",
  sku: "",
  images: [],
});

export default function AddProduct() {
  const dispatch = useDispatch();
  const { CategoryList } = useSelector(s => s.Category);
  const addCategoryToList = (category) => {
    if (category && !CategoryList.some(c => c.category === category)) {
      dispatch(addCategory({ category }));
    }
  };
  const [selectionProducts, setSelectionProducts] = useState([]);

  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [isChangingType, setIsChangingType] = useState(false);

  const [product, setProduct] = useState({
    productType: "simple",
    name: "",
    description: "",
    category: "",
    gst: 18,

    simpleProduct: {
      price: "",
      discount: 0,
      stockQuantity: "",
      sku: "",
      images: [],
    },

    variants: [
      { size: "", colors: [emptyColor()] }
    ],

    bundleProducts: {
      sku: "",
      discount: 0,
      images:[],
      products: [],
    },
  });

  useEffect(() => {
    if (product.productType === "bundle") {
      dispatch(getProductsForSelection({ limit: 20 })).then(res => {
        if (res.payload?.success) {
          setSelectionProducts(res.payload.data);
        }
      });
    }
  }, [product.productType, dispatch]);

  // Auto-generate SKU
  const generateSKU = (type, category, extra = "") => {
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const cat = category.slice(0, 3).toUpperCase();
    if (type === "simple") return `SIM-${cat}-${random}`;
    if (type === "variant") return `VAR-${cat}-${extra}-${random}`;
    if (type === "bundle") return `BUN-${cat}-${random}`;
    return random;
  };

  useEffect(() => {
    if (product.productType && product.category) {
      if (product.productType === "simple" && !product.simpleProduct.sku) {
        setSimple("sku", generateSKU("simple", product.category));
      } else if (product.productType === "variant") {
        product.variants.forEach((v, vi) => {
          v.colors.forEach((c, ci) => {
            if (!c.sku && v.size && c.name) {
              const extra = `${v.size}-${c.name.slice(0, 3).toUpperCase()}`;
              setColor(vi, ci, "sku", generateSKU("variant", product.category, extra));
            }
          });
        });
      } else if (product.productType === "bundle" && !product.bundleProducts.sku) {
        setBundleField("sku", generateSKU("bundle", product.category));
      }
    }
  }, [product.productType, product.category, product.variants]);

  /* ================= BASIC ================= */
  const setField = (k, v) =>
    setProduct(p => ({ ...p, [k]: v }));

  /* ================= SIMPLE ================= */
  const setSimple = (k, v) =>
    setProduct(p => ({
      ...p,
      simpleProduct: { ...p.simpleProduct, [k]: v },
    }));

  /* ================= VARIANT ================= */
  const addVariant = () =>
    setProduct(p => ({
      ...p,
      variants: [...p.variants, { size: "", colors: [emptyColor()] }],
    }));

  const removeVariant = i =>
    setProduct(p => {
      if (p.variants.length === 1) {
        toast.error("At least one variant required");
        return p;
      }
      return {
        ...p,
        variants: p.variants.filter((_, idx) => idx !== i),
      };
    });

  const setVariantSize = (i, val) =>
    setProduct(p => {
      const v = [...p.variants];
      v[i].size = val;
      return { ...p, variants: v };
    });

  const addColor = vi =>
    setProduct(p => {
      const v = [...p.variants];
      v[vi].colors.push(emptyColor());
      return { ...p, variants: v };
    });

  const removeColor = (vi, ci) =>
    setProduct(p => {
      const v = [...p?.variants];
      if (v[vi]?.colors?.length === 1) {
        toast.error("At least one color required");
        return p;
      }
      v[vi].colors.splice(ci, 1);
      return { ...p, variants: v };
    });

  const setColor = (vi, ci, k, val) =>
    setProduct(p => {
      const v = [...p.variants];
      v[vi].colors[ci][k] = val;
      return { ...p, variants: v };
    });

  /* ================= BUNDLE ================= */
  const addBundleProduct = () =>
    setProduct(p => ({
      ...p,
      bundleProducts: {
        ...p.bundleProducts,
        products: [
          ...p.bundleProducts.products,
          { product: "", sku: "", size: "", color: "", quantity: 1 },
        ],
      },
    }));

  const removeBundleProduct = i =>
    setProduct(p => ({
      ...p,
      bundleProducts: {
        ...p.bundleProducts,
        products: p.bundleProducts.products.filter((_, idx) => idx !== i),
      },
    }));

  const setBundleField = (k, v) =>
    setProduct(p => ({
      ...p,
      bundleProducts: { ...p.bundleProducts, [k]: v },
    }));

  const setBundleProduct = (i, k, v) =>
    setProduct(p => {
      const bp = [...p.bundleProducts.products];
      bp[i][k] = v;
      return {
        ...p,
        bundleProducts: { ...p.bundleProducts, products: bp },
      };
    });

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!product.name || !product.category || !product.productType)
      return toast.error("Basic details missing");

    if (product.productType === "simple") {
      const s = product.simpleProduct;
      if (!s.price || !s.sku || s.images.length < 2)
        return toast.error("Simple product incomplete");
    }

    if (product.productType === "variant") {
      for (const v of product.variants) {
        if (!v.size) return toast.error("Variant size missing");
        for (const c of v.colors) {
          if (!c.name || !c.price || !c.sku || c.images.length < 2)
            return toast.error("Variant color incomplete");
          if (c.hex && !/^#([0-9A-F]{3}){1,2}$/i.test(c.hex))
            return toast.error("Invalid hex code for color");
        }
      }
    }

    if (product.productType === "bundle") {
      const b = product.bundleProducts;
      if(b.images.length==0) return toast.error("Bundle images required...")
      if (!b.sku) return toast.error("Bundle SKU required");
      if (!b.price) return toast.error("Bundle price required");
      if (b.products.length === 0)
        return toast.error("Add at least one product to bundle");

      for (const item of b.products) {
        if (!item.product) return toast.error("Select product for all bundle items");
        const prod = selectionProducts.find(p => p._id === item.product);
        if (prod?.productType === "variant" && !item.sku) {
          return toast.error("Select variant for variant products in bundle");
        }
        if (prod?.productType !== "variant" && item.sku) {
          return toast.error("SKU not allowed for non-variant products");
        }
      }

      const ids = b.products.map(p => p.product);
      if (new Set(ids).size !== ids.length)
        return toast.error("Duplicate product in bundle");
    }

    return true;
  };
    const handleSimpleImages = files => {
    if (files.length < 2) {
      toast.error("Minimum 2 images required");
      return;
    }
    setSimple("images", Array.from(files));
  };
 
   
  
  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", product.name);
      fd.append("description", product.description);
      fd.append("category", product.category);
      fd.append("gst", product.gst);
      fd.append("productType", product.productType);

      if (product.productType === "simple") {
        fd.append("simpleProduct", JSON.stringify(product.simpleProduct));
        product.simpleProduct.images.forEach(img =>
          fd.append("simpleImages", img)
        );
      }

      if (product.productType === "variant") {
        fd.append("variants", JSON.stringify(product.variants));
        product.variants.forEach((v, vi) =>
          v.colors.forEach((c, ci) =>
            c.images.forEach(img =>
              fd.append(`variantImages[${vi}][${ci}]`, img)
            )
          )
        );
      }

      if (product.productType === "bundle") {
        fd.append("bundleProducts", JSON.stringify(product.bundleProducts));
        product.bundleProducts.images.forEach(img =>
          fd.append("bundleImages", img)
        );
      }

      const res = await dispatch(AddNewProduct(fd));
      console.log(res)
      res?.payload?.success
        ? toast.success("Product Created")
        : toast.error(res?.payload?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen space-y-6">

        {/* STEP 2 */}
        {step === 2 && (
          <>
            {/* BASIC */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Product Name"
                  value={product.name}
                  onChange={e => setField("name", e.target.value)} />
                <input
                  className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Category"
                  value={product.category}
                  onChange={e => setField("category", e.target.value)}
                  onBlur={e => addCategoryToList(e.target.value)}
                  list="categories"
                />
                <datalist id="categories">
                  {CategoryList?.map(c => (
                    <option key={c.category} value={c.category} />
                  ))}
                </datalist>
                <input
                  className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="GST %"
                  type="number"
                  value={product.gst}
                  onChange={e => setField("gst", e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Type:</span>
                {isChangingType ? (
                  <select
                    className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 flex-1"
                    value={product.productType}
                    onChange={e => {
                      setField("productType", e.target.value);
                      // Reset other data when changing type
                      if (e.target.value === "simple") {
                        setProduct(p => ({
                          ...p,
                          simpleProduct: { price: "", discount: 0, stockQuantity: "", sku: "", images: [] },
                          variants: [{ size: "", colors: [emptyColor()] }],
                          bundleProducts: { sku: "", discount: 0, images: [], products: [] }
                        }));
                      } else if (e.target.value === "variant") {
                        setProduct(p => ({
                          ...p,
                          simpleProduct: { price: "", discount: 0, stockQuantity: "", sku: "", images: [] },
                          variants: [{ size: "", colors: [emptyColor()] }],
                          bundleProducts: { sku: "", discount: 0, images: [], products: [] }
                        }));
                      } else if (e.target.value === "bundle") {
                        setProduct(p => ({
                          ...p,
                          simpleProduct: { price: "", discount: 0, stockQuantity: "", sku: "", images: [] },
                          variants: [{ size: "", colors: [emptyColor()] }],
                          bundleProducts: { sku: "", discount: 0, images: [], products: [] }
                        }));
                      }
                      setIsChangingType(false);
                    }}
                  >
                    <option value="simple">Simple</option>
                    <option value="variant">Variant</option>
                    <option value="bundle">Bundle</option>
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 capitalize flex-1">{product.productType}</span>
                )}
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  onClick={() => setIsChangingType(true)}
                >
                  Change
                </button>
              </div>
              <textarea className="input h-24 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Description"
                value={product.description}
                onChange={e => setField("description", e.target.value)} />
            </div>
  {product.productType === "simple" && (
             <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg space-y-4">
               <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Simple Product Details</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Price"
                    type="number"
                    value={product.simpleProduct.price}
                    onChange={e => setSimple("price", e.target.value)}
                  />
                  <input
                    className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Discount %"
                    type="number"
                    value={product.simpleProduct.discount}
                    onChange={e => setSimple("discount", e.target.value)}
                  />
                  <input
                    className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Stock Quantity"
                    type="number"
                    value={product.simpleProduct.stockQuantity}
                    onChange={e => setSimple("stockQuantity", e.target.value)}
                  />
                  <input
                    className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="SKU (auto-generated)"
                    value={product.simpleProduct.sku}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images (min 2)</label>
                  <input
                    type="file"
                    multiple
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={e => handleSimpleImages(e.target.files)}
                  />
                </div>
                {/* IMAGE PREVIEW */}
                {product.simpleProduct.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {product.simpleProduct.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => setSimple("images", product.simpleProduct.images.filter((_, idx) => idx !== i))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* VARIANT */}
            {product.productType === "variant" && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Variant Details</h3>
                {product.variants.map((v, vi) => (
                  <div key={vi} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Variant {vi + 1}</h4>
                      <button onClick={() => removeVariant(vi)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove Variant</button>
                    </div>
                    <select className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      value={v.size}
                      onChange={e => setVariantSize(vi, e.target.value)}>
                      <option value="">Select Size</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {v.colors.map((c, ci) => (
                      <div key={ci} className="border border-gray-300 dark:border-gray-600 p-4 rounded-xl space-y-3 bg-gray-50 dark:bg-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <input className="input flex-1 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Color Name"
                              value={c.name}
                              onChange={e => setColor(vi, ci, "name", e.target.value)} />
                            {c.hex && <div className="w-6 h-6 rounded border border-gray-400" style={{ backgroundColor: c.hex }}></div>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="color" className="w-12 h-10 border border-gray-300 dark:border-gray-500 rounded"
                              value={c.hex || "#000000"}
                              onChange={e => setColor(vi, ci, "hex", e.target.value)} />
                            <input className="input flex-1 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Hex Code"
                              value={c.hex}
                              onChange={e => setColor(vi, ci, "hex", e.target.value)} />
                          </div>
                          <input className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Price"
                            type="number"
                            value={c.price}
                            onChange={e => setColor(vi, ci, "price", e.target.value)} />
                          <input className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Discount %"
                            type="number"
                            value={c.discount}
                            onChange={e => setColor(vi, ci, "discount", e.target.value)} />
                          <input className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Stock Quantity"
                            type="number"
                            value={c.stockQuantity}
                            onChange={e => setColor(vi, ci, "stockQuantity", e.target.value)} />
                          <input className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="SKU (auto-generated)"
                            value={c.sku}
                            readOnly />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images (min 2)</label>
                          <input type="file" multiple
                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={e =>
                              setColor(vi, ci, "images", Array.from(e.target.files))
                            } />
                        </div>
                        {c.images && c.images.length > 0 && (
                          <div className="flex gap-3 flex-wrap">
                            {c.images.map((img, i) => (
                              <div key={i} className="relative">
                                <img
                                  src={URL.createObjectURL(img)}
                                  alt="preview"
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  onClick={() => setColor(vi, ci, "images", c.images.filter((_, idx) => idx !== i))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => removeColor(vi, ci)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove Color</button>
                      </div>
                    ))}
                 
                    <button onClick={() => addColor(vi)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">+ Add Color</button>
                  </div>
                ))}

                <button onClick={addVariant}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-semibold">
                  + Add Variant
                </button>
              </>
            )}

            {/* BUNDLE */}
            {product.productType === "bundle" && (
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bundle Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Bundle SKU (auto-generated)"
                    value={product.bundleProducts.sku}
                    readOnly />
                  <input className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Bundle Price"
                    type="number"
                    value={product.bundleProducts.price || ""}
                    onChange={e => setBundleField("price", e.target.value)} />
                  <input className="input bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" placeholder="Bundle Discount %"
                    type="number"
                    value={product.bundleProducts.discount}
                    onChange={e => setBundleField("discount", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bundle Images (min 1)</label>
                  <input type="file" multiple
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={e => setBundleField("images", Array.from(e.target.files))} />
                </div>
                {product.bundleProducts.images && product.bundleProducts.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {product.bundleProducts.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => setBundleField("images", product.bundleProducts.images.filter((_, idx) => idx !== i))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Products in Bundle</h4>
                  {product.bundleProducts.products.map((b, i) => {
                    const selectedProduct = selectionProducts.find(p => p._id === b.product);
                    const selectedVariant = selectedProduct?.productType === "variant" && b.sku ?
                      selectedProduct.variants?.flatMap(v => v.colors).find(c => c.sku === b.sku) : null;
                    return (
                      <div key={i} className="border border-gray-300 dark:border-gray-600 p-4 rounded-xl space-y-3 bg-gray-50 dark:bg-gray-700">
                        <select className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          value={b.product}
                          onChange={e => setBundleProduct(i, "product", e.target.value)}>
                          <option value="">Select Product</option>
                          {selectionProducts.map(p => (
                            <option key={p._id} value={p._id}>{p.name.length > 30 ? p.name.slice(0,30)+'...' : p.name} - {formatPrice(p.finalPrice)}</option>
                          ))}
                        </select>
                        {selectedProduct && selectedProduct.productType === "variant" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                              value={b.size || ""}
                              onChange={e => {
                                const size = e.target.value;
                                setBundleProduct(i, "size", size);
                                // Reset color and sku if size changes
                                setBundleProduct(i, "color", "");
                                setBundleProduct(i, "sku", "");
                              }}>
                              <option value="">Select Size</option>
                              {selectedProduct.variants?.map(v => (
                                <option key={v.size} value={v.size}>{v.size}</option>
                              ))}
                            </select>
                            <select className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                              value={b.color || ""}
                              onChange={e => {
                                const colorName = e.target.value;
                                setBundleProduct(i, "color", colorName);
                                // Find sku
                                const variant = selectedProduct.variants?.find(v => v.size === b.size);
                                const color = variant?.colors?.find(c => c.name === colorName);
                                if (color) {
                                  setBundleProduct(i, "sku", color.sku);
                                }
                              }}
                              disabled={!b.size}>
                              <option value="">Select Color</option>
                              {selectedProduct.variants?.find(v => v.size === b.size)?.colors?.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {selectedProduct && (
                          <div className="flex items-center space-x-3">
                            <img src={selectedVariant ? selectedVariant.images?.[0]?.secure_url : selectedProduct.thumbnail} alt={selectedProduct.name} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProduct.name}</p>
                              <p className="text-sm text-green-600 dark:text-green-400">{formatPrice(selectedVariant ? selectedVariant.finalPrice : selectedProduct.finalPrice)}</p>
                              {selectedVariant && <p className="text-xs text-gray-500 dark:text-gray-400">{b.size} - {b.color}</p>}
                            </div>
                          </div>
                        )}
                        <input className="input bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100" placeholder="Quantity"
                          type="number"
                          min="1"
                          value={b.quantity}
                          onChange={e => setBundleProduct(i, "quantity", Number(e.target.value))} />
                        <button onClick={() => removeBundleProduct(i)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove Product</button>
                      </div>
                    );
                  })}
                  <button onClick={addBundleProduct}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Add Product to Bundle</button>
                </div>
              </div>
            )}

            <LoadingButton loading={loading}
              name="Create Product" onClick={submit} />
          </>
        )}
      </div>
    </Layout>
  );
}
