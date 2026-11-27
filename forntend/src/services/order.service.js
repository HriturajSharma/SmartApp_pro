
import api from "./api";

// Create order
export const createOrder = async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
};

// Get logged-in user's orders
export const getMyOrders = async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
};

// Get order details
export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

// Track order
export const trackOrder = async (orderNumber, email) => {
    const response = await api.get("/orders/track", {
        params: { orderNumber, email }
    });
    return response.data;
};

export const createPaymentOrder = async (orderId) => {
    const response = await api.post(`/orders/${orderId}/payment`);
    return response.data;
};
export const verifyPayment = async (orderId, paymentData) => {
    const response = await api.post(
        `/orders/${orderId}/verify-payment`,
        paymentData
    );

    return response.data;
};

