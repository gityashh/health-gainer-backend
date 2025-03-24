const Product = require("../models/Product");
const imagekit = require("../config/imageKit");


exports.addVariant = async (req, res) => {
  try {
    const { weight, mrp, discount, stock } = req.body;

    // Ensure required fields are provided
    if (!weight || !mrp) {
      return res.status(400).json({ success: false, message: "Weight and MRP are required" });
    }

    // Convert string numbers to actual numbers
    const parsedMrp = Number(mrp);
    const parsedDiscount = Number(discount) || 0;
    const parsedStock = Number(stock) || 0;

    // Validate converted numbers
    if (isNaN(parsedMrp) || isNaN(parsedDiscount) || isNaN(parsedStock)) {
      return res.status(400).json({ success: false, message: "Invalid numeric values" });
    }

    // Calculate the price correctly
    const calculatedPrice = parsedMrp - (parsedMrp * parsedDiscount) / 100;

    // Find the product
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Upload images to ImageKit
    const uploadedImages = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const file of files) {
        const uploadResponse = await imagekit.upload({
          file: file.data, // File buffer
          fileName: file.name, // Original file name
          folder: "/product-variants", // Folder in ImageKit
        });

        uploadedImages.push(uploadResponse.url); // Store the uploaded image URL
      }
    }

    // Create new variant
    const newVariant = {
      weight,
      price: calculatedPrice,
      mrp: parsedMrp,
      discount: parsedDiscount,
      images: uploadedImages, // Use the uploaded image URLs
      stock: parsedStock,
    };

    // Add the variant to the product
    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({ success: true, message: "Variant added successfully", product });
  } catch (error) {
    console.error("Error adding variant:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ✅ Update Variant
exports.updateVariant = async (req, res) => {
  try {
    const { weight, mrp, discount, stock } = req.body;
    const { productId, variantId } = req.params;
    
    console.log(req.body, "req.body");
    console.log(req.files, "req.files"); // Debugging file uploads

    if (!weight || !mrp) {
      return res.status(400).json({ success: false, message: "Weight and MRP are required" });
    }

    const parsedMrp = Number(mrp);
    const parsedDiscount = Number(discount) || 0;
    const parsedStock = Number(stock) || 0;

    if (isNaN(parsedMrp) || isNaN(parsedDiscount) || isNaN(parsedStock)) {
      return res.status(400).json({ success: false, message: "Invalid numeric values" });
    }

    const calculatedPrice = parsedMrp - (parsedMrp * parsedDiscount) / 100;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    // Extract existing images from `req.body['images[]']`
    let existingImages = req.body['images[]'];
    if (!Array.isArray(existingImages)) {
      existingImages = existingImages ? [existingImages] : [];
    }

    let uploadedImages = [];

    // Handle new image uploads
    if (req.files && req.files['newImages[]']) {
      let files = req.files['newImages[]'];
      files = Array.isArray(files) ? files : [files]; // Convert to array if not

      for (const file of files) {
        console.log(`Uploading file: ${file.name}`);
        try {
          const uploadResponse = await imagekit.upload({
            file: file.data,
            fileName: file.name,
            folder: "/product-variants",
          });
          console.log(`Upload success: ${uploadResponse.url}`);
          uploadedImages.push(uploadResponse.url);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return res.status(500).json({ success: false, message: "Image upload failed" });
        }
      }
    }

    console.log(existingImages, "Existing images from req.body");
    console.log(uploadedImages, "Uploaded new images");

    // Update variant fields
    variant.weight = weight;
    variant.mrp = parsedMrp;
    variant.discount = parsedDiscount;
    variant.price = calculatedPrice;
    variant.stock = parsedStock;
    variant.images = [...existingImages, ...uploadedImages]; // Update images

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      variant,
    });
  } catch (error) {
    console.error("Error updating variant:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ✅ Delete Variant
exports.deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.variants = product.variants.filter((v) => v._id.toString() !== variantId);
    await product.save();

    res.json({ success: true, message: "Variant deleted successfully", product });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getVariantById = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.find((v) => v._id.toString() === variantId);

    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    res.json({ success: true, variant });
  } catch (error) {
    console.error("Error find variant:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
