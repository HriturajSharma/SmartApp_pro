
import { CheckCircle, Package, Search, ShieldCheck, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { trackOrder } from "../../services/order.service";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const trackingSteps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "paid", label: "Payment Confirmed", icon: CheckCircle },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle }
];

const TrackOrder = () => {
    const [orderNumber, setOrderNumber] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const response = await trackOrder(
                orderNumber.trim(),
                identifier.trim()
            );

            setOrder(response.order);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to track your order."
            );
        } finally {
            setLoading(false);
        }
    };

    const currentStatus = order?.orderStatus?.toLowerCase();
    const isCancelled = currentStatus === "cancelled";

    const statusIndex = trackingSteps.findIndex(
        (step) => step.status === currentStatus
    );

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-3xl">

                {/* Page Header */}
                <div className="mb-8 text-center">
                    <Package
                        size={48}
                        className="mx-auto mb-4 text-gray-700"
                    />

                    <h1 className="text-3xl font-bold">
                        Track Your Order
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Enter your order number and registered email or phone.
                    </p>
                </div>

                {/* Search Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Order Number
                        </label>

                        <input
                            type="text"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="Enter your order number"
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Registered Email or Phone
                        </label>

                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter email address or phone number"
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-white disabled:opacity-50"
                    >
                        <Search size={18} />
                        {loading ? "Searching..." : "Track Order"}
                    </button>

                    {error && (
                        <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </form>

                {/* Order Result */}
                {order && (
                    <div className="mt-8 space-y-6">

                        {/* Order Details */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Order Details
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {order.orderNumber}
                                    </p>
                                </div>

                                <span className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                                    isCancelled
                                        ? "bg-red-100 text-red-700"
                                        : currentStatus === "delivered"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-blue-700"
                                }`}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-5">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order Date
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Total Amount
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {formatPrice(order.totalAmount)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Payment Status
                                    </p>

                                    <p className="mt-1 font-semibold capitalize">
                                        {order.paymentStatus}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Payment Method
                                    </p>

                                    <p className="mt-1 font-medium capitalize">
                                        {order.paymentMethod || "Not available"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Progress */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-semibold">
                                Delivery Progress
                            </h2>

                            {isCancelled ? (
                                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
                                    <XCircle size={28} />

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
                                <div className="space-y-6">
                                    {trackingSteps.map((step, index) => {
                                        const Icon = step.icon;

                                        const completed =
                                            statusIndex >= index &&
                                            statusIndex !== -1;

                                        return (
                                            <div
                                                key={step.status}
                                                className="flex items-center gap-4"
                                            >
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                    completed
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-400"
                                                }`}>
                                                    <Icon size={20} />
                                                </div>

                                                <div>
                                                    <p className={`font-medium ${
                                                        completed
                                                            ? "text-green-700"
                                                            : "text-gray-400"
                                                    }`}>
                                                        {step.label}
                                                    </p>

                                                    {step.status === "delivered" &&
                                                        order.deliveredAt && (
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(order.deliveredAt)}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Ordered Products */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-semibold">
                                Ordered Products
                            </h2>

                            <div className="space-y-5">
                                {order.items?.map((item, index) => {
                                    const product =
                                        typeof item.product === "object"
                                            ? item.product
                                            : null;

                                    const productName =
                                        product?.name || item.name || "Product";

                                    const warrantyMonths =
                                        item.warrantyMonths ??
                                        product?.warrantyMonths;

                                    return (
                                        <div
                                            key={item._id || index}
                                            className="border-b pb-5 last:border-0 last:pb-0"
                                        >
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {productName}
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

                                            {warrantyMonths !== undefined && (
                                                <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                                                    <ShieldCheck size={17} />

                                                    <span>
                                                        Warranty: {warrantyMonths} months
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Delivery Date */}
                        {order.deliveredAt && (
                            <div className="rounded-xl bg-green-50 p-5 text-green-800">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={20} />

                                    <p className="font-semibold">
                                        Order Delivered
                                    </p>
                                </div>

                                <p className="mt-2 text-sm">
                                    Delivered on {formatDate(order.deliveredAt)}
                                </p>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </section>
    );
};

export default TrackOrder;
