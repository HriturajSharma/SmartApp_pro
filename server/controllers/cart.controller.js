import Cart from "../models/cart.model.js";

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        return res.status(200).json({ success: true, cart: cart || { items: [] } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

        const item = cart.items.find((entry) => entry.product.toString() === productId);
        if (item) item.quantity += Number(quantity);
        else cart.items.push({ product: productId, quantity });

        await cart.save();
        await cart.populate("items.product");
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
        if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });

        item.quantity = Number(req.body.quantity);
        await cart.save();
        await cart.populate("items.product");
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
        await cart.save();
        await cart.populate("items.product");
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [] },
            { new: true }
        );
        return res.status(200).json({ success: true, cart: cart || { items: [] } });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};