
import api from "./api";

// Get logged-in user's cart
export const getCart = async () => {
    const response = await api.get("/cart");
    return response.data;
};

// Add product to cart
export const addToCart = async (productId, quantity = 1) => {
    const response = await api.post("/cart/add", {
        productId,
        quantity
    });
    return response.data;
};

// Update product quantity
export const updateCartItem = async (productId, quantity) => {
    const response = await api.put(`/cart/update/${productId}`, {
        quantity
    });
    return response.data;
};

// Remove product
export const removeCartItem = async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
};

// Clear entire cart
export const clearCart = async () => {
    const response = await api.delete("/cart/clear");
    return response.data;
};
