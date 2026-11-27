import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";


// Get all products




export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minWattage,
      maxWattage,
      minCapacity,
      autoShutOff,
      sortBy,
      featured,
    } = req.query;

    // Base filter: only active products
    const filter = { isActive: true };

    // Featured products filter
    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Search by name or brand
    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { brand: { $regex: safe, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category }).select("_id");
        filter.category = cat ? cat._id : null;
      }
    }

    // Power filtering
    if (minWattage || maxWattage) {
      filter["specifications.power"] = {};

      if (minWattage) {
        filter["specifications.power"].$gte = Number(minWattage);
      }

      if (maxWattage) {
        filter["specifications.power"].$lte = Number(maxWattage);
      }
    }

    // Capacity filtering
    if (minCapacity) {
      filter["specifications.capacity"] = {
        $gte: Number(minCapacity),
      };
    }

    // Auto shut-off filter
    if (autoShutOff === "true") {
      filter["specifications.safetyFeatures"] = {
        $regex: "auto shut.?off",
        $options: "i",
      };
    }

    // Sorting
    let sort = {};

    if (sortBy === "price-low") {
      sort.price = 1;
    } else if (sortBy === "price-high") {
      sort.price = -1;
    } else if (sortBy === "name") {
      sort.name = 1;
    } else if (sortBy === "popular") {
      sort.isFeatured = -1;
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sort);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Create product
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        // const product = await Product.findById(req.params.id).populate("category");
        const product = await Product.findOne({
    _id: req.params.id,
    isActive: true
}).populate("category");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update product


export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const {
            name,
            description,
            brand,
            category,
            price,
            mrp,
            stock,
            specifications,
            safetyPrecautions,
            usageInstructions,
            warrantyMonths,
            images,
            isFeatured,
            isActive
        } = req.body;

        if (
            !name?.trim() ||
            !description?.trim() ||
            !brand?.trim() ||
            !category ||
            !mongoose.Types.ObjectId.isValid(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid product details"
            });
        }

        if (
            !Number.isFinite(Number(price)) ||
            !Number.isFinite(Number(mrp)) ||
            Number(price) < 0 ||
            Number(mrp) < Number(price) ||
            !Number.isFinite(Number(stock)) ||
            Number(stock) < 0 ||
            !Number.isFinite(Number(warrantyMonths)) ||
            Number(warrantyMonths) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price, MRP, stock or warranty"
            });
        }

        if (
            !specifications ||
            !Number.isFinite(Number(specifications.power)) ||
            !Number.isFinite(Number(specifications.capacity)) ||
            Number(specifications.power) < 0 ||
            Number(specifications.capacity) < 0 ||
            !["L", "kg", "ml", "cups"].includes(
                specifications.capacityUnit
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product specifications"
            });
        }

        if (!Array.isArray(images) || images.length === 0 ||
            images.some(image => !image.url?.trim())) {
            return res.status(400).json({
                success: false,
                message: "At least one valid product image is required"
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description.trim(),
                brand: brand.trim(),
                category,
                price: Number(price),
                mrp: Number(mrp),
                stock: Number(stock),
                specifications,
                safetyPrecautions: safetyPrecautions || [],
                usageInstructions: usageInstructions || [],
                warrantyMonths: Number(warrantyMonths),
                images,
                isFeatured: Boolean(isFeatured),
                isActive: Boolean(isActive)
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("category", "name");

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Update Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


