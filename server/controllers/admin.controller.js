
import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const allowedOrderStatuses = [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled"
];

const adminAllowedStatuses = [
    "shipped",
    "delivered",
    "cancelled"
];

// Escape special regex characters
const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


// ========================================
// GET DASHBOARD STATISTICS
// ========================================

export const getDashboardStats = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const paidOrderFilter = {
            paymentStatus: "paid",
            orderStatus: { $ne: "cancelled" }
        };

        const [
            totalOrders,
            totalCustomers,
            totalProducts,
            revenueResult,
            pendingOrders,
            shippedOrders,
            deliveredOrders,
            recentOrders,
            monthlyRevenue,
            topProducts
        ] = await Promise.all([

            // Total orders
            Order.countDocuments(),

            // Total customers
            User.countDocuments({ role: "user" }),

            // Active products
            Product.countDocuments({ isActive: true }),

            // Total paid revenue
            Order.aggregate([
                {
                    $match: paidOrderFilter
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]),

            // Pending orders
            Order.countDocuments({
                orderStatus: "pending"
            }),

            // Shipped orders
            Order.countDocuments({
                orderStatus: "shipped"
            }),

            // Delivered orders
            Order.countDocuments({
                orderStatus: "delivered"
            }),

            // Latest five orders
            Order.find()
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            // Monthly revenue for current year
            Order.aggregate([
                {
                    $match: {
                        ...paidOrderFilter,
                        createdAt: {
                            $gte: new Date(currentYear, 0, 1),
                            $lt: new Date(currentYear + 1, 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $month: "$createdAt"
                        },
                        revenue: {
                            $sum: "$totalAmount"
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]),

            // Top five selling products
            Order.aggregate([
                {
                    $match: paidOrderFilter
                },
                {
                    $unwind: "$items"
                },
                {
                    $group: {
                        _id: "$items.name",
                        sold: {
                            $sum: "$items.quantity"
                        },
                        revenue: {
                            $sum: {
                                $multiply: [
                                    "$items.price",
                                    "$items.quantity"
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: {
                        sold: -1
                    }
                },
                {
                    $limit: 5
                }
            ])
        ]);

        return res.status(200).json({
            success: true,

            stats: {
                totalRevenue: revenueResult[0]?.total || 0,
                totalOrders,
                totalCustomers,
                totalProducts,
                pendingOrders,
                shippedOrders,
                deliveredOrders
            },

            recentOrders,
            monthlyRevenue,
            topProducts
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch dashboard statistics."
        });
    }
};


// ========================================
// GET ALL ORDERS
// SEARCH + FILTER + PAGINATION
// ========================================

export const getAllOrders = async (req, res) => {
    try {
        const {
            search = "",
            status = "",
            page = "1",
            limit = "10"
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Validate pagination
        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values."
            });
        }

        // Validate status filter
        if (
            status &&
            !allowedOrderStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status filter."
            });
        }

        const filter = {};

        if (status) {
            filter.orderStatus = status;
        }

        // Search by order number, customer name, email or phone
        const searchValue = String(search).trim();

        if (searchValue) {
            const searchRegex = {
                $regex: escapeRegex(searchValue),
                $options: "i"
            };

            filter.$or = [
                { orderNumber: searchRegex },
                { "shippingAddress.fullName": searchRegex },
                { "shippingAddress.email": searchRegex },
                { "shippingAddress.phone": searchRegex }
            ];
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [orders, totalOrders] = await Promise.all([

            Order.find(filter)
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Order.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            orders,

            pagination: {
                totalOrders,
                currentPage: pageNumber,
                totalPages: Math.ceil(
                    totalOrders / limitNumber
                ),
                limit: limitNumber
            }
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch orders."
        });
    }
};


// ========================================
// UPDATE ORDER STATUS
// ========================================

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        // Admin cannot change payment status
        if (!adminAllowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Payment status is managed separately."
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const currentStatus = order.orderStatus;

        // Cancelled orders cannot be updated
        if (currentStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be updated."
            });
        }

        // Delivered orders are final
        if (currentStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered orders cannot be updated."
            });
        }

        // Prevent shipping unpaid online orders
        if (
            ["shipped", "delivered"].includes(status) &&
            order.paymentMethod !== "cod" &&
            order.paymentStatus !== "paid"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment must be completed before shipping."
            });
        }

        // Allowed status transitions
        const validTransitions = {
            pending: ["shipped", "cancelled"],
            paid: ["shipped", "cancelled"],
            shipped: ["delivered", "cancelled"],
            delivered: [],
            cancelled: []
        };

        if (
            !validTransitions[currentStatus]?.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot change order status from ${currentStatus} to ${status}.`
            });
        }

        // Set delivery date
        if (status === "delivered") {
            order.deliveredAt = new Date();
        }

        order.orderStatus = status;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update order status."
        });
    }
};
