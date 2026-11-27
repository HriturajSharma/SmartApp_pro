import Banner from "../models/banner.model.js";

export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
        return res.status(200).json({ success: true, banners });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        return res.status(201).json({ success: true, banner });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
        return res.status(200).json({ success: true, banner });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
        return res.status(200).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};