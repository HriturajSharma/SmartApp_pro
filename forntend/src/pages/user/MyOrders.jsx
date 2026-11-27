
import { Eye, Package, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../services/order.service";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getMyOrders();
                setOrders(response.orders || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your orders."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-700",
            paid: "bg-blue-100 text-blue-700",
            shipped: "bg-purple-100 text-purple-700",
            delivered: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
            failed: "bg-red-100 text-red-700"
        };

        return colors[status?.toLowerCase()] ||
            "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-gray-500">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-red-600">{error}</p>

                <Link
                    to="/products"
                    className="rounded-lg bg-black px-5 py-3 text-white"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-6xl">

                {/* Page Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>

                        <p className="mt-2 text-gray-500">
                            View and track all your purchases.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Link>
                </div>

                {/* Empty State */}
                {orders.length === 0 ? (
                    <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
                        <Package
                            size={48}
                            className="mx-auto mb-4 text-gray-400"
                        />

                        <h2 className="text-xl font-semibold">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Your orders will appear here after checkout.
                        </p>

                        <Link
                            to="/products"
                            className="mt-5 inline-block rounded-lg bg-black px-6 py-3 text-white"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="mb-5 text-sm text-gray-500">
                            {orders.length} {orders.length === 1 ? "order" : "orders"} found
                        </p>

                        <div className="space-y-5">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="rounded-xl border bg-white p-5 shadow-sm"
                                >
                                    {/* Order Header */}
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Order Number
                                            </p>

                                            <h2 className="text-lg font-semibold">
                                                {order.orderNumber}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm capitalize ${getStatusColor(order.paymentStatus)}`}
                                            >
                                                Payment: {order.paymentStatus || "Pending"}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-sm capitalize ${getStatusColor(order.orderStatus)}`}
                                            >
                                                {order.orderStatus || "Pending"}
                                            </span>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    {/* Products */}
                                    <div className="space-y-3">
                                        {order.items?.map((item, index) => {
                                            const product =
                                                typeof item.product === "object"
                                                    ? item.product
                                                    : null;

                                            return (
                                                <div
                                                    key={item._id || index}
                                                    className="flex items-center justify-between gap-4"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {product?.name || item.name || "Product"}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Quantity: {item.quantity}
                                                        </p>
                                                    </div>

                                                    <p className="shrink-0 text-sm font-semibold">
                                                        {formatPrice(
                                                            item.price * item.quantity
                                                        )}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <hr className="my-4" />

                                    {/* Order Footer */}
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Total Amount
                                            </p>

                                            <p className="mt-1 text-xl font-bold">
                                                {formatPrice(order.totalAmount)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                to="/track-order"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
                                            >
                                                <Truck size={17} />
                                                Track Order
                                            </Link>

                                            <Link
                                                to={`/my-orders/${order._id}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-white"
                                            >
                                                <Eye size={17} />
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default MyOrders;
