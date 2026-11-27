
import {
    CheckCircle,
    CreditCard,
    MapPin,
    Package,
    ShoppingBag
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const OrderSuccess = () => {
    const { state } = useLocation();
    const order = state?.order;

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                    <Package
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                    />

                    <h2 className="text-xl font-semibold">
                        No order information found
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Please check your orders to view your order details.
                    </p>

                    <Link
                        to="/my-orders"
                        className="mt-5 inline-block rounded-lg bg-black px-6 py-3 text-white"
                    >
                        My Orders
                    </Link>
                </div>
            </div>
        );
    }

    const shipping = order.shippingAddress || {};

    const paymentStatus = order.paymentStatus || "pending";
    const orderStatus = order.orderStatus || "pending";

    const isPaid = paymentStatus.toLowerCase() === "paid";

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-3xl">

                {/* Success Header */}
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">

                    <CheckCircle
                        size={64}
                        className="mx-auto mb-5 text-green-600"
                    />

                    <h1 className="text-3xl font-bold">
                        {isPaid ? "Payment Successful!" : "Order Created!"}
                    </h1>

                    <p className="mt-3 text-gray-500">
                        {isPaid
                            ? "Your payment has been verified successfully. Your order is confirmed."
                            : "Your order has been created. Payment is currently pending."}
                    </p>

                    <div className="mt-6 inline-block rounded-lg bg-gray-50 px-5 py-3">
                        <p className="text-sm text-gray-500">
                            Order Number
                        </p>

                        <p className="mt-1 font-bold">
                            {order.orderNumber}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

                    <h2 className="mb-5 text-xl font-semibold">
                        Order Summary
                    </h2>

                    <div className="space-y-4">
                        {(order.items || []).map((item, index) => {
                            const product =
                                typeof item.product === "object"
                                    ? item.product
                                    : null;

                            return (
                                <div
                                    key={product?._id || index}
                                    className="flex items-center justify-between gap-4 border-b pb-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {product?.name || "Product"}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Quantity: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-semibold">
                                        {formatPrice(
                                            item.price * item.quantity
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 flex justify-between text-lg font-bold">
                        <span>Total Amount</span>

                        <span>
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

                    <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
                        <CreditCard size={21} />
                        Payment Information
                    </h2>

                    <div className="flex justify-between gap-4">
                        <span className="text-gray-500">
                            Payment Method
                        </span>

                        <span className="font-medium">
                            {order.paymentMethod || "Razorpay"}
                        </span>
                    </div>

                    <div className="mt-4 flex justify-between gap-4">
                        <span className="text-gray-500">
                            Payment Status
                        </span>

                        <span className={`font-semibold ${
                            isPaid ? "text-green-600" : "text-orange-600"
                        }`}>
                            {paymentStatus}
                        </span>
                    </div>

                    <div className="mt-4 flex justify-between gap-4">
                        <span className="text-gray-500">
                            Order Status
                        </span>

                        <span className="font-semibold">
                            {orderStatus}
                        </span>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

                    <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
                        <MapPin size={21} />
                        Delivery Address
                    </h2>

                    <p className="font-semibold">
                        {shipping.fullName}
                    </p>

                    <p className="mt-2 text-gray-600">
                        {shipping.address}
                    </p>

                    <p className="text-gray-600">
                        {shipping.city}, {shipping.state} - {shipping.pincode}
                    </p>

                    <p className="mt-2 text-gray-600">
                        Phone: {shipping.phone}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                    <Link
                        to="/my-orders"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white"
                    >
                        <Package size={18} />
                        My Orders
                    </Link>

                    <Link
                        to="/track-order"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3"
                    >
                        Track Order
                    </Link>

                    <Link
                        to="/products"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Link>

                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
