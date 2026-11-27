import crypto, { randomBytes } from "crypto";
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";


export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = "razorpay" } = req.body;

        // Validate shipping address
        const requiredFields = [
            "fullName",
            "phone",
            "email",
            "address",
            "city",
            "state",
            "pincode"
        ];

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        for (const field of requiredFields) {
            if (
                typeof shippingAddress[field] !== "string" ||
                !shippingAddress[field].trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        if (!/^[6-9]\d{9}$/.test(shippingAddress.phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number"
            });
        }

        if (!/^\d{6}$/.test(shippingAddress.pincode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid PIN code"
            });
        }

        if (!["razorpay", "stripe", "cod"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        // Get cart from database, not from frontend
        const cart = await Cart.findOne({
            user: req.user._id
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        let subtotal = 0;
        const orderItems = [];

        // Validate products and calculate trusted prices
        for (const item of cart.items) {
            const product = item.product;

            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is unavailable"
                });
            }

            if (
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > product.stock
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0]?.url || "",
                quantity: item.quantity,
                price: product.price,
                warrantyMonths: product.warrantyMonths
            });
        }

        const shippingCharge = 0;
        const totalAmount = subtotal + shippingCharge;

        const order = await Order.create({
            orderNumber: `ORD-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`,
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingCharge,
            totalAmount,
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Admin can view any order.
        // Customers can only view their own orders.
        const isAdmin = req.user.role === "admin";
        const isOwner = order.user?._id.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this order."
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order details error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order details."
        });
    }
};


export const trackOrder = async (req, res) => {
    try {
        const { orderNumber, identifier, email } = req.query;
        const trackingIdentifier = identifier || email;

        if (!orderNumber?.trim() || !trackingIdentifier?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Order number and registered email or phone are required."
            });
        }

        const value = trackingIdentifier.trim();

        const order = await Order.findOne({
            orderNumber: orderNumber.trim(),
            $or: [
                { "shippingAddress.email": value.toLowerCase() },
                { "shippingAddress.phone": value }
            ]
        }).select(
            "orderNumber items orderStatus paymentStatus createdAt deliveredAt"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "No order found. Check your details and try again."
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to track order.",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: req.body.orderStatus || req.body.status },
            { new: true, runValidators: true }
        );
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};




export const createRazorpayOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.paymentStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This order cannot be paid"
            });
        }

        if (order.paymentMethod !== "razorpay") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        // Reuse an existing Razorpay order if already created
        if (order.razorpayOrderId) {
            return res.status(200).json({
                success: true,
                key: process.env.RAZORPAY_KEY_ID,
                razorpayOrderId: order.razorpayOrderId,
                amount: order.totalAmount * 100,
                currency: "INR",
                order
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: order.orderNumber,
            notes: {
                databaseOrderId: order._id.toString(),
                customerId: req.user._id.toString()
            }
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required"
            });
        }

        // Find the customer's order
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Prevent verification against another Razorpay order
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay order ID"
            });
        }

        // Avoid processing an already paid order again
        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        // Generate expected signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        // Compare signatures safely
        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Verify payment directly with Razorpay
        const payment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment is not captured yet"
            });
        }

        // Mark order as paid only after verification

let updatedOrder;

const session = await mongoose.startSession();

try {
    await session.withTransaction(async () => {
        // Recheck order inside transaction
        const currentOrder = await Order.findOne({
            _id: order._id,
            user: req.user._id
        }).session(session);

        if (!currentOrder) {
            throw new Error("Order not found");
        }

        // Prevent duplicate stock deduction
        if (currentOrder.paymentStatus === "paid") {
            updatedOrder = currentOrder;
            return;
        }

        // Deduct stock for every ordered product
        for (const item of currentOrder.items) {
            const result = await Product.updateOne(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                },
                { session }
            );

            if (result.modifiedCount !== 1) {
                throw new Error(
                    `Insufficient stock for ${item.name}`
                );
            }
        }

        // Mark order as paid
        currentOrder.paymentId = razorpay_payment_id;
        currentOrder.paymentStatus = "paid";
        currentOrder.orderStatus = "paid";

        await currentOrder.save({ session });

        // Clear customer's cart
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $set: { items: [] } },
            { new: true, session }
        );

        updatedOrder = currentOrder;
    });

} finally {
    await session.endSession();
}

return res.status(200).json({
    success: true,
    message: "Payment verified and order confirmed",
    order: updatedOrder
});


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

