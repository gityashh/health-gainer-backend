const Product = require("../models/Product");
const imagekit = require("../config/imageKit");

// ✅ Create a New Product with Image Upload (Without Variants)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, mrp, discount, stock } = req.body;
    // Ensure images exist in req.files
    if (!req.files || !req.files.images) {
      return res.status(400).json({ success: false, message: "Images are required" });
    }

    const imagesArray = Array.isArray(req.files.images) ? req.files.images : [req.files.images]; // Ensure array

    const uploadedImages = await Promise.all(
      imagesArray.map(async (file) => {
        try {
          const uploadResponse = await imagekit.upload({
            file: file.data.toString("base64"),
            fileName: `product_${Date.now()}.jpg`,
            folder: "/products",
          });
          return uploadResponse.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          throw new Error(`Failed to upload image: ${error?.message || JSON.stringify(error)}`);
        }
      })
    );

    // Create Product with uploaded image URLs
    const product = new Product({
      name,
      description,
      category,
      images: uploadedImages,
      mrp,
      discount,
      stock,
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: error.stack,
    });
  }
};


// ✅ Get All Products (with filtering & pagination)
exports.getProducts = async (req, res) => {
  try {
    let { page, limit, category, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = new RegExp(search, "i"); // Case-insensitive search

    const products = await Product.find(filter).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Update Product by ID
// exports.updateProduct = async (req, res) => {
//   try {
//     const { name, description, category, mrp, discount, stock, status } = req.body;
//     console.log(req.body);
//     console.log(req.files);
//     console.log(req.params, "params");

//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     // Handle image update
//     let updatedImages = existingImages || []; // Start with existing images

//     if (req.files && req.files.newImages) {
//       const imagesArray = Array.isArray(req.files.newImages) ? req.files.newImages : [req.files.newImages];

//       const uploadedImages = await Promise.all(
//         imagesArray.map(async (file) => {
//           try {
//             const uploadResponse = await imagekit.upload({
//               file: file.data.toString("base64"),
//               fileName: `product_${Date.now()}.jpg`,
//               folder: "/products",
//             });
//             return uploadResponse.url;
//           } catch (error) {
//             console.error("Error uploading image:", error);
//             throw new Error(`Failed to upload image: ${error?.message || JSON.stringify(error)}`);
//           }
//         })
//       );

//       // Combine existing images with new uploaded images
//       updatedImages = [...updatedImages, ...uploadedImages];
//     }

//     // Update only the provided fields
//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.category = category || product.category;
//     product.images = updatedImages; // Set the combined images array
//     product.mrp = mrp || product.mrp;
//     product.discount = discount || product.discount;
//     product.price = (mrp || product.mrp) - ((mrp || product.mrp) * (discount || product.discount)) / 100;
//     product.stock = stock || product.stock;
//     product.status = status || product.status;

//     await product.save();
//     res.json({ success: true, message: "Product updated successfully", product });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ success: false, message: "Internal server error", error: error.message });
//   }
// };

exports.updateProduct = async (req, res) => {
  try {


    const { name, description, category, mrp, discount, stock, status } = req.body;
    console.log(req.body, "req.body");
    const existingImages = Object.keys(req.body)
      .filter(key => key.startsWith('existingImages[')) // Filter only existingImages keys
      .sort((a, b) => a.localeCompare(b)) // Sort to maintain order
      .map(key => req.body[key]); // Extract values

    console.log("Parsed Existing Images:", existingImages);


    if (!Array.isArray(existingImages)) {
      existingImages = existingImages ? [existingImages] : [];
    }


    console.log("Existing Images:", existingImages);
    // console.log("Uploaded Files:", req.files);
    // console.log("Params:", req.params);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Start with existing images
    let updatedImages = [...existingImages];



    // Handle new image uploads
    if (req.files && req.files.newImages) {
      const imagesArray = Array.isArray(req.files.newImages) ? req.files.newImages : [req.files.newImages];

      const uploadedImages = await Promise.all(
        imagesArray.map(async (file) => {
          try {
            const uploadResponse = await imagekit.upload({
              file: file.data.toString("base64"),
              fileName: `product_${Date.now()}.jpg`,
              folder: "/products",
            });
            return uploadResponse.url;
          } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error(`Failed to upload image: ${error?.message || JSON.stringify(error)}`);
          }
        })
      );

      // Merge old and new images
      updatedImages = [...updatedImages, ...uploadedImages];
    }

    // Update only the provided fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.images = updatedImages; // Set the combined images array
    product.mrp = mrp || product.mrp;
    product.discount = discount || product.discount;
    product.price = (mrp || product.mrp) - ((mrp || product.mrp) * (discount || product.discount)) / 100;
    product.stock = stock || product.stock;
    product.status = status || product.status;

    await product.save();
    res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};



// ✅ Delete Product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
