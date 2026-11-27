
import { ArrowLeft, CreditCard, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const OrderDetails = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/${id}`);
                setOrder(response.data.order);
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
        return <div className="p-10 text-center">Loading order...</div>;
    }

    if (error || !order) {
        return (
            <div className="p-8 text-center text-red-600">
                {error || "Order not found."}
                <div className="mt-4">
                    <Link to="/admin/orders" className="text-indigo-600">
                        Back to orders
                    </Link>
                </div>
            </div>
        );
    }

    const address = order.shippingAddress || {};

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="mx-auto max-w-6xl">

                <Link
                    to="/admin/orders"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                    <ArrowLeft size={18} />
                    Back to orders
                </Link>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-indigo-600">
                            ORDER MANAGEMENT
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                            {order.orderNumber}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Placed on{" "}
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold capitalize text-indigo-700">
                        {order.orderStatus}
                    </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Products */}
                    <section className="space-y-5 lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <Package className="text-indigo-600" />
                                <h2 className="font-semibold text-slate-900">
                                    Ordered Products
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Warranty: {item.warrantyMonths || 0} months
                                            </p>
                                        </div>

                                        <p className="font-semibold text-slate-900">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping address */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="text-indigo-600" />
                                <h2 className="font-semibold text-slate-900">
                                    Shipping Address
                                </h2>
                            </div>

                            <p className="font-semibold text-slate-900">
                                {address.fullName}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {address.address}, {address.city},{" "}
                                {address.state} - {address.pincode}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                Phone: {address.phone}
                            </p>
                            <p className="text-sm text-slate-600">
                                Email: {address.email}
                            </p>
                        </div>
                    </section>

                    {/* Summary */}
                    <aside className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <CreditCard className="text-indigo-600" />
                                <h2 className="font-semibold text-slate-900">
                                    Payment Summary
                                </h2>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">Shipping</span>
                                    <span>{formatPrice(order.shippingCharge)}</span>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <div className="flex justify-between font-bold text-slate-900">
                                        <span>Total</span>
                                        <span>{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-slate-100 pt-4">
                                <p className="text-xs text-slate-500">
                                    Payment method
                                </p>
                                <p className="mt-1 font-medium capitalize">
                                    {order.paymentMethod}
                                </p>

                                <p className="mt-4 text-xs text-slate-500">
                                    Payment status
                                </p>
                                <p className="mt-1 font-semibold capitalize">
                                    {order.paymentStatus}
                                </p>

                                {order.paymentId && (
                                    <>
                                        <p className="mt-4 text-xs text-slate-500">
                                            Payment ID
                                        </p>
                                        <p className="mt-1 break-all text-xs text-slate-700">
                                            {order.paymentId}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-slate-900">
                                Order Information
                            </h2>
                            <p className="mt-4 text-sm text-slate-500">
                                Order ID
                            </p>
                            <p className="mt-1 break-all text-xs text-slate-700">
                                {order._id}
                            </p>
                            <p className="mt-4 text-sm text-slate-500">
                                Delivered at
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                                {order.deliveredAt
                                    ? new Date(order.deliveredAt).toLocaleString("en-IN")
                                    : "Not delivered yet"}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
