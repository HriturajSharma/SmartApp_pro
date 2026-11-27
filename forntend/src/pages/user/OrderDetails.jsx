
import {
    ArrowLeft,
    CheckCircle,
    CreditCard,
    MapPin,
    Package,
    ShieldCheck,
    Truck,
    XCircle
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../../services/order.service";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
};

const statusSteps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "paid", label: "Payment Confirmed", icon: CheckCircle },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle }
];

const OrderDetails = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(id);
                setOrder(response.order);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load order details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Loading order details...
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-12 text-center">
                <p className="mb-5 text-red-600">
                    {error || "Order not found."}
                </p>

                <Link to="/my-orders" className="underline">
                    Back to My Orders
                </Link>
            </div>
        );
    }

    const currentStatus = order.orderStatus?.toLowerCase();
    const currentStep = statusSteps.findIndex(
        (step) => step.status === currentStatus
    );

    const isCancelled = currentStatus === "cancelled";
    const shipping = order.shippingAddress || {};

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-6xl">

                {/* Back Button */}
                <Link
                    to="/my-orders"
                    className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-black"
                >
                    <ArrowLeft size={18} />
                    Back to My Orders
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Order Details
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Order Number: {order.orderNumber}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Placed on: {formatDate(order.createdAt)}
                    </p>
                </div>

                {/* Order Progress */}
                {isCancelled ? (
                    <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                        <XCircle size={26} />

                        <div>
                            <p className="font-semibold">
                                Order Cancelled
                            </p>

                            <p className="text-sm">
                                This order has been cancelled.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-semibold">
                            Order Progress
                        </h2>

                        <div className="grid grid-cols-4 gap-2">
                            {statusSteps.map((step, index) => {
                                const Icon = step.icon;
                                const completed =
                                    currentStep >= index && currentStep !== -1;

                                return (
                                    <div
                                        key={step.status}
                                        className="text-center"
                                    >
                                        <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${
                                            completed
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-400"
                                        }`}>
                                            <Icon size={20} />
                                        </div>

                                        <div className={`mb-2 h-1 rounded-full ${
                                            completed
                                                ? "bg-green-500"
                                                : "bg-gray-200"
                                        }`} />

                                        <p className={`text-xs sm:text-sm ${
                                            completed
                                                ? "font-semibold text-green-700"
                                                : "text-gray-500"
                                        }`}>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {order.deliveredAt && (
                            <p className="mt-5 text-sm text-green-700">
                                Delivered on: {formatDate(order.deliveredAt)}
                            </p>
                        )}
                    </div>
                )}

                {/* Ordered Products */}
                <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <Package size={22} />

                        <h2 className="text-xl font-semibold">
                            Ordered Products
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {order.items?.map((item, index) => {
                            const product =
                                typeof item.product === "object"
                                    ? item.product
                                    : null;

                            const productName =
                                product?.name || item.name || "Product";

                            const image =
                                product?.images?.[0]?.url ||
                                item.image ||
                                "";

                            const warrantyMonths =
                                item.warrantyMonths ??
                                product?.warrantyMonths;

                            return (
                                <div
                                    key={item._id || index}
                                    className="flex flex-col gap-4 border-b pb-6 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={productName}
                                            className="h-24 w-24 rounded-lg bg-gray-100 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
                                            <Package className="text-gray-400" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h3 className="font-semibold">
                                            {productName}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Quantity: {item.quantity}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Unit Price: {formatPrice(item.price)}
                                        </p>

                                        {warrantyMonths !== undefined && (
                                            <p className="mt-2 flex items-center gap-2 text-sm text-green-700">
                                                <ShieldCheck size={17} />
                                                Warranty: {warrantyMonths} months
                                            </p>
                                        )}
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
                </div>

                {/* Address and Payment */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* Shipping Address */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
                            <MapPin size={21} />
                            Shipping Address
                        </h2>

                        <p className="font-semibold">
                            {shipping.fullName}
                        </p>

                        <p className="mt-2 text-gray-600">
                            {shipping.address}
                        </p>

                        <p className="text-gray-600">
                            {shipping.city}, {shipping.state}
                        </p>

                        <p className="text-gray-600">
                            PIN: {shipping.pincode}
                        </p>

                        <p className="mt-3 text-gray-600">
                            Phone: {shipping.phone}
                        </p>

                        <p className="text-gray-600">
                            Email: {shipping.email}
                        </p>
                    </div>

                    {/* Payment Summary */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
                            <CreditCard size={21} />
                            Payment Summary
                        </h2>

                        <div className="mb-3 flex justify-between gap-4">
                            <span className="text-gray-500">
                                Subtotal
                            </span>

                            <span>
                                {formatPrice(order.subtotal)}
                            </span>
                        </div>

                        <div className="mb-3 flex justify-between gap-4">
                            <span className="text-gray-500">
                                Shipping
                            </span>

                            <span>
                                {formatPrice(order.shippingCharge)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 border-t pt-4 text-lg font-bold">
                            <span>Total</span>

                            <span>
                                {formatPrice(order.totalAmount)}
                            </span>
                        </div>

                        <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                            <p>
                                Payment Method:{" "}
                                <span className="font-medium capitalize">
                                    {order.paymentMethod || "Not available"}
                                </span>
                            </p>

                            <p>
                                Payment Status:{" "}
                                <span className="font-medium capitalize">
                                    {order.paymentStatus || "Pending"}
                                </span>
                            </p>

                            {order.paymentId && (
                                <p className="break-all">
                                    Payment ID: {order.paymentId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Track Order */}
                <div className="mt-6 flex justify-end">
                    <Link
                        to="/track-order"
                        className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-white"
                    >
                        <Truck size={18} />
                        Track Order
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default OrderDetails;
