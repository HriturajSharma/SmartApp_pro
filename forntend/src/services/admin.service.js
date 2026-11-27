
import api from "./api";

export const getDashboardStats = async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
};

export const getAllOrders = async (params = {}) => {
    const response = await api.get("/admin/orders", { params });
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(
        `/admin/orders/${orderId}/status`,
        { status }
    );

    return response.data;
};
