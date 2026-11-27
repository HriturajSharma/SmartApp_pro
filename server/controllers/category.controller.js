import Category from "../models/category.model.js";

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        return res.status(200).json({ success: true, category });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json({ success: true, category });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        return res.status(200).json({ success: true, category });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        return res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};