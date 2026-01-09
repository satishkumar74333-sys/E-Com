import Notification from "../module/Notification.module.js";
import Product from "../module/Product.module.js";
import User from "../module/user.module.js";
import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

//   const { name, description, price, discount, category, gst } = req.body;
  
//   const { userName } = req.user;

//   if (!name || !description || !price || !category) {
//     return next(new AppError("All fields are required", 400));
//   }

//   try {
//     let imageUploads = [];
//     if (req.files && req.files.length > 0) {
//       imageUploads = await Promise.all(
//         req.files.map(async (file) => {
//           const uploadResult = await cloudinary.v2.uploader.upload(file.path, {
//             folder: "Product",
//           });

//           await fs.rm(file.path, { force: true });

//           return {
//             public_id: uploadResult.public_id,
//             secure_url: uploadResult.secure_url,
//           };
//         })
//       );
//     }

//     if (imageUploads.length === 0) {
//       return next(
//         new AppError("Image upload failed. No product was created.", 400)
//       );
//     }

//     const product = await Product.create({
//       name,
//       description,
//       price,
//       ...(discount && { discount }),
//       category,
//       ...(gst && { gst }),
//       images: imageUploads,
//     });

//     const users = await User.find({}, "_id");
//     if (users && users.length > 0) {
//       const notifications = users.map((user) => ({
//         userId: user._id,
//         message: `${userName} has uploaded a new product: "${product.name}"`,
//         type: "new product",
//         read: false,
//       }));

//       await Notification.insertMany(notifications);
//     }

//     res.status(200).json({
//       success: true,
//       data: product,
//       message:
//         "Product uploaded successfully with multiple images and notifications sent.",
//     });
//   } catch (error) {
//     if (req.files) {
//       await Promise.all(
//         req.files.map((file) => fs.rm(file.path, { force: true }))
//       );
//     }

//     return next(new AppError(`Product upload failed: ${error.message}`, 400));
//   }
// };


/* ======================================================
   PRODUCT UPLOAD
====================================================== */
export const ProductUpload = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      gst,
      productType,
      simpleProduct,
      variants,
      bundleProducts,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!name || !description || !category || !productType) {
      return next(new AppError("All required fields missing", 400));
    }

    if (description.length < 10) {
      return next(new AppError("Description must be at least 10 characters", 400));
    }

    /* ==================================================
       SIMPLE PRODUCT
    ================================================== */
    let parsedSimple = null;

    if (productType === "simple") {
      if (!simpleProduct) {
        return next(new AppError("Simple product data required", 400));
      }

      parsedSimple = JSON.parse(simpleProduct);

      if (!parsedSimple.price || !parsedSimple.sku) {
        return next(new AppError("Price & SKU required", 400));
      }

      const files = req.files?.filter(f => f.fieldname === "simpleImages");

      if (!files || files.length < 2) {
        return next(new AppError("Minimum 2 images required", 400));
      }

      parsedSimple.images = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "Products",
          });
          if (file.path && file.path.startsWith(process.cwd())) {
  await fs.rm(file.path, { force: true });
}

          return {
            public_id: result.public_id,
            secure_url: result.secure_url,
          };
        })
      );
    }

    /* ==================================================
       VARIANT PRODUCT
    ================================================== */
    let parsedVariants = [];

    if (productType === "variant") {
      if (!variants) {
        return next(new AppError("Variants data required", 400));
      }

      parsedVariants = JSON.parse(variants);

      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        return next(new AppError("At least one variant required", 400));
      }

      const skuSet = new Set();

      for (let vi = 0; vi < parsedVariants.length; vi++) {
        const variant = parsedVariants[vi];

        if (!variant.size || !variant.colors?.length) {
          return next(new AppError("Each variant needs size & color", 400));
        }

        for (let ci = 0; ci < variant.colors.length; ci++) {
          const color = variant.colors[ci];

          if (!color.name || !color.price || !color.sku) {
            return next(new AppError("Color data incomplete", 400));
          }

          if (skuSet.has(color.sku)) {
            return next(new AppError(`Duplicate SKU: ${color.sku}`, 400));
          }
          skuSet.add(color.sku);

          const files = req.files?.filter(
            f => f.fieldname === `variantImages[${vi}][${ci}]`
          );

          if (!files || files.length < 2) {
            return next(
              new AppError(
                `Minimum 2 images required for ${color.name} (${variant.size})`,
                400
              )
            );
          }

          color.images = await Promise.all(
            files.map(async (file) => {
              const result = await cloudinary.uploader.upload(file.path, {
                folder: "Products",
              });
            if (file.path && file.path.startsWith(process.cwd())) {
  await fs.rm(file.path, { force: true });
}

              return {
                public_id: result.public_id,
                secure_url: result.secure_url,
              };
            })
          );

          color.price = Number(color.price);
          color.discount = Number(color.discount || 0);
          color.stockQuantity = Number(color.stockQuantity || 0);
        }
      }
    }

    /* ==================================================
       BUNDLE PRODUCT
    ================================================== */
    let parsedBundle = null;

    if (productType === "bundle") {
      if (!bundleProducts) {
        return next(new AppError("Bundle data required", 400));
      }

      parsedBundle = JSON.parse(bundleProducts);

      if (
        !parsedBundle.sku ||
        !Array.isArray(parsedBundle.products) ||
        parsedBundle.products.length === 0
      ) {
        return next(new AppError("Invalid bundle structure", 400));
      }
      
    const files = req.files?.filter(f => f.fieldname === "bundleImages");

      if (!files || files.length < 1) {
        return next(new AppError("Minimum 1 images required", 400));
      }

      parsedBundle.images = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "Products",
          });
          if (file.path && file.path.startsWith(process.cwd())) {
  await fs.rm(file.path, { force: true });
}

          return {
            public_id: result.public_id,
            secure_url: result.secure_url,
          };
        })
      );

      parsedBundle.discount = Number(parsedBundle.discount || 0);

      const ids = parsedBundle.products.map(p => p.product);
      if (new Set(ids).size !== ids.length) {
        return next(new AppError("Duplicate product in bundle", 400));
      }
    }

    /* ==================================================
       CREATE PRODUCT
    ================================================== */
    const product = await Product.create({
      name,
      description,
      category,
      gst,
      productType,
      simpleProduct: parsedSimple,
      variants: parsedVariants,
      bundleProducts: parsedBundle,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (req.files?.length) {
      await Promise.all(
        req.files.map((f) => fs.rm(f.path, { force: true }))
      );
    }

    console.error("PRODUCT UPLOAD ERROR:", error);
    next(new AppError(error.message || "Server error", 500));
  }
};





export const OrderCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderCount: count } = req.body;

    if (!id) {
      return next(new AppError("Product ID is required for update.", 400));
    }
    if (!count) {
      return next(new AppError("Order count is required for update.", 400));
    }

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return next(new AppError("Product not found.", 404));
    }

    currentProduct.orderCount += count;
    await currentProduct.save();

    res.status(200).json({
      success: true,
      message: "Product successfully updated.",
      data: currentProduct.orderCount,
    });
  } catch (error) {
    next(error);
  }
};

export const productUpdate = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    orderCount,
    description,
    price,
    images,
    index,
    discount,
    category,
    gst,
    stock,
  } = req.body;
  if (!id) {
    return next(new AppError("Product ID is required for update.", 400));
  }

  try {
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return next(new AppError("Product not found.", 404));
    }

    if (orderCount) {
      currentProduct.orderCount += orderCount;
    }

    let updatedImageData = [...currentProduct.images];

    if (req.files && req.files.length > 0) {
      const files = req.files;

      if (index && Array.isArray(index)) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (index[i] !== undefined) {
            const imageIndex = parseInt(index[i], 10);

            const uploadResult = await cloudinary.v2.uploader.upload(
              file.path,
              {
                folder: "Product",
              }
            );

            await fs.rm(file.path, { force: true });

            updatedImageData[imageIndex] = {
              public_id: uploadResult.public_id,
              secure_url: uploadResult.secure_url,
            };
          }
        }
      } else if (index !== undefined) {
        for (const file of files) {
          const uploadResult = await cloudinary.v2.uploader.upload(file.path, {
            folder: "Product",
          });

          await fs.rm(file.path, { force: true });

          updatedImageData[parseInt(index, 10)] = {
            public_id: uploadResult.public_id,
            secure_url: uploadResult.secure_url,
          };
        }
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(price && { price }),
      ...(description && { description }),

      ...(discount && { discount }),
      ...(category && { category }),
      ...(gst && { gst }),
      ...(stock && { stock }),
      images: updatedImageData,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return next(
        new AppError("Failed to update the product. Please try again.", 400)
      );
    }

    res.status(200).json({
      success: true,
      message: "Product successfully updated.",
      data: updatedProduct,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const productDelete = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("product update to id is required..", 400));
  }
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(
        new AppError(" product failed  to Delete.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "product successfully Delete...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getSearchProduct = async (req, res, next) => {
  const { query } = req.query;
  try {
    let filter = {};
    let name = "";
    let maxPrice = null;

    // Regex patterns for matching query
    const regex1 = /(\w+)\s*under\s*(\d+)/; // Format: name under price
    const regex2 = /^([a-zA-Z]+)\s*(\d+)$/;
    const cleanQuery = query.trim();
    const match1 = cleanQuery.match(regex1);
    const match2 = cleanQuery.match(regex2);
    if (match1) {
      name = match1[1];
      maxPrice = Number(match1[2]);
    } else if (match2) {
      name = match2[1];
      maxPrice = Number(match2[2]);
    } else if (!isNaN(Number(query))) {
      maxPrice = Number(query);
    } else {
      name = query;
    }

    if (name) {
      filter.$or = [
        { name: { $regex: new RegExp(name, "i") } }, // Correct $regex syntax
        { category: { $regex: new RegExp(name, "i") } },
      ];
    }
    if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }
    const products = await Product.find(filter);

    if (!products || products.length === 0) {
      return next(new AppError("No products found. Please try again.", 404));
    }

    res.status(200).json({
      success: true,
      data: products,
      message: "Products fetched successfully.",
    });
  } catch (error) {
    return next(
      new AppError(`Failed to fetch products: ${error.message}`, 500)
    );
  }
};
export const getProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("product update to id is required..", 400));
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(
        new AppError(" product failed  to get.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      data: product,
      message: "product successfully get...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("bundleProducts.products.product", "name")
      .lean();

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getAllProduct = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const filter = category ? { category } : {};

    const products = await Product.find(filter)
      .select(
        "name productType simpleProduct variants bundleProducts orderCount createdAt gst"
      )
      .populate({
        path: "bundleProducts.products.product",
        select: "productType simpleProduct variants",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments();

    const formattedProducts = products.map(p => {
      /* ================= SIMPLE ================= */
      if (p.productType === "simple") {
        const price = Number(p.simpleProduct?.price || 0);
        const discount = Number(p.simpleProduct?.discount || 0);

        return {
          _id: p._id,
          name: p.name,
          productType: "simple",
          sku: p.simpleProduct?.sku,
          price,
          gst:p.gst,
          discount,
          finalPrice: Math.round(price - (price * discount) / 100),
          thumbnail: p.simpleProduct?.images?.[0]?.secure_url || "",
          createdAt: p.createdAt,
        };
      }

      /* ================= VARIANT ================= */
      if (p.productType === "variant") {
        let minPrice = Infinity;
        let maxPrice = 0;
        let thumbnail = "";

        p.variants?.forEach(v => {
          v.colors?.forEach(c => {
            const price = Number(c.price || 0);
            const discount = Number(c.discount || 0);
            const final = price - (price * discount) / 100;

            if (final < minPrice) minPrice = final;
            if (final > maxPrice) maxPrice = final;

            if (!thumbnail && c.images?.length) {
              thumbnail = c.images[0].secure_url;
            }
          });
        });

        if (minPrice === Infinity) minPrice = 0;

        return {
          _id: p._id,
          name: p.name,
          gst:p.gst,
          productType: "variant",
            sku: p.variants[0].colors[0]?.sku,
          price:p.variants[0].colors[0].price,
          discount:p.variants[0].colors[0].discount,
          priceRange: {
            min: Math.round(minPrice),
            max: Math.round(maxPrice),
          },
          thumbnail,
          createdAt: p.createdAt,
        };
      }

      /* ================= BUNDLE ================= */
      if (p.productType === "bundle") {
        let basePrice = 0;
        let thumbnail = "";

        p.bundleProducts?.products?.forEach(item => {
          const prod = item.product;
          if (!prod) return;

          /* SIMPLE */
          if (prod.productType === "simple") {
            const price = Number(prod.simpleProduct?.price || 0);
            const discount = Number(prod.simpleProduct?.discount || 0);
            const final = price - (price * discount) / 100;

            basePrice += final * item.quantity;

            if (!thumbnail && prod.simpleProduct?.images?.length) {
              thumbnail = prod.simpleProduct.images[0].secure_url;
            }
          }

          /* VARIANT → lowest price */
          if (prod.productType === "variant") {
            let min = Infinity;

            prod.variants?.forEach(v =>
              v.colors?.forEach(c => {
                const price = Number(c.price || 0);
                const discount = Number(c.discount || 0);
                const final = price - (price * discount) / 100;

                if (final < min) min = final;

                if (!thumbnail && c.images?.length) {
                  thumbnail = c.images[0].secure_url;
                }
              })
            );

            if (min !== Infinity) {
              basePrice += min * item.quantity;
            }
          }
        });

        const discount = Number(p.bundleProducts?.discount || 0);
        const finalPrice = Math.round(
          basePrice - (basePrice * discount) / 100
        );

        return {
          _id: p._id,
          name: p.name,
          gst:p.gst,
          productType: "bundle",
          sku: p.bundleProducts?.sku,
          price: Math.round(basePrice),
          discount,
          finalPrice,
          thumbnail,
          createdAt: p.createdAt,
        };
      }

      return null;
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: formattedProducts,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    next(new AppError("Failed to load products", 500));
  }
};



export const LikeAndDisLikeProduct = async (req, res, next) => {
  const { id } = req.params;
  const { userName } = req.user;

  if (!userName) {
    return next(new AppError("Username is required.", 400));
  }

  if (!id) {
    return next(new AppError("Product ID is required.", 400));
  }

  try {
    const product = await Product.findOne({
      _id: id,
    });

    if (!product) {
      return next(new AppError("Product not found.", 400));
    }

    const likeIndex = product.ProductLikes.findIndex(
      (like) => like.userName === userName
    );

    if (likeIndex !== -1) {
      if (product.ProductLikes[likeIndex].ProductLike === true) {
        product.ProductLikes.splice(likeIndex, 1);
      } else {
        product.ProductLikes[likeIndex].ProductLike = true;
      }
    } else {
      product.ProductLikes.push({ ProductLike: true, userName: userName });
    }

    product.likeCount = product.ProductLikes.filter(
      (like) => like.ProductLike === true
    ).length;

    product.ProductLikes = product.ProductLikes.map((like) => ({
      ...like,
      ProductLike:
        typeof like.ProductLike === "boolean" ? like.ProductLike : false, // enforce boolean
    }));

    await product.save();

    res.status(200).json({
      success: true,
      product,
      message: "Product successfully liked or disliked.",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const checkInStock = async (req, res, next) => {
  try {
    const { productId, sku } = req.body;
    if (!productId) return next(new AppError("productId is required ..", 400));

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let isInStock = false;

    if (product.productType === "simple") {
      isInStock = product.simpleProduct?.stockStatus === "In stock";
    } else if (product.productType === "variant") {
      if (sku) {
        const color = product.variants?.flatMap(v => v.colors).find(c => c.sku === sku);
        isInStock = color?.stockStatus === "In stock";
      } else {
        // If no sku, check if any color is in stock
        isInStock = product.variants?.some(v => v.colors?.some(c => c.stockStatus === "In stock"));
      }
    } else if (product.productType === "bundle") {
      isInStock = true; // Bundles are virtual
    }

    if (!isInStock) {
      return res.status(400).json({
        success: false,
        message: `Product ${product.name} is out of stock.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product ${product.name} is in stock.`,
    });
  } catch (error) {
    return next(new AppError(error.message || error), 400);
  }
};

export const getProductsForSelection = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const products = await Product.find({ isActive: true })
      .select("name productType simpleProduct.price simpleProduct.discount simpleProduct.finalPrice simpleProduct.images variants.colors.name variants.colors.price variants.colors.discount variants.colors.finalPrice variants.colors.images bundleProducts.price bundleProducts.discount bundleProducts.finalPrice bundleProducts.images")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = products.map(p => {
      let price = 0;
      let finalPrice = 0;
      let thumbnail = "";

      if (p.productType === "simple") {
        price = p.simpleProduct?.price || 0;
        finalPrice = p.simpleProduct?.finalPrice || price;
        thumbnail = p.simpleProduct?.images?.[0]?.secure_url || "";
      } else if (p.productType === "variant") {
        const colors = p.variants?.[0]?.colors || [];
        if (colors.length > 0) {
          price = colors[0].price || 0;
          finalPrice = colors[0].finalPrice || price;
          thumbnail = colors[0].images?.[0]?.secure_url || "";
        }
      } else if (p.productType === "bundle") {
        price = p.bundleProducts?.price || 0;
        finalPrice = p.bundleProducts?.finalPrice || price;
        thumbnail = p.bundleProducts?.images?.[0]?.secure_url || "";
      }

      return {
        _id: p._id,
        name: p.name,
        productType: p.productType,
        price,
        finalPrice,
        thumbnail,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(new AppError("Failed to fetch products for selection", 500));
  }
};
