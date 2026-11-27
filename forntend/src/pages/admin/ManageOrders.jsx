
import {
    ChevronLeft,
    ChevronRight,
    Package,
    RefreshCw,
    Search
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getAllOrders,
    updateOrderStatus
} from "../../services/admin.service";

const statuses = [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled"
];

const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700"
};

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(price) || 0);

const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        totalOrders: 0,
        currentPage: 1,
        totalPages: 1
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch orders
    const fetchOrders = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response = await getAllOrders({
                search: debouncedSearch,
                status,
                page,
                limit: 10
            });

            setOrders(response.orders || []);

            setPagination({
                totalOrders: response.pagination?.totalOrders || 0,
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load orders."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [debouncedSearch, status, page]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Update order status
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            setError("");

            await updateOrderStatus(orderId, newStatus);

            await fetchOrders(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getCustomerName = (order) =>
        order.shippingAddress?.fullName ||
        order.user?.name ||
        "Customer";

    const getCustomerEmail = (order) =>
        order.shippingAddress?.email ||
        order.user?.email ||
        "No email available";

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            ADMINISTRATION / ORDERS
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            Manage Orders
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View, track and manage customer orders.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchOrders(false)}
                        disabled={loading || refreshing}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">

                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search order number..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >
                        <option value="">All statuses</option>

                        {statuses.map((item) => (
                            <option key={item} value={item}>
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => fetchOrders()}
                            className="shrink-0 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Orders */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            All Orders
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {pagination.totalOrders} total orders
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            Loading orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package
                                size={36}
                                className="mx-auto mb-3 text-slate-300"
                            />

                            <p className="font-medium text-slate-700">
                                No orders found
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your search or filter.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] text-left">

                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Order</th>
                                        <th className="px-5 py-4">Customer</th>
                                        <th className="px-5 py-4">Date</th>
                                        <th className="px-5 py-4">Amount</th>
                                        <th className="px-5 py-4">Payment</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Update</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <Link
                                                    to={`/admin/orders/${order._id}`}
                                                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {order.orderNumber || "N/A"}
                                                </Link>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {getCustomerName(order)}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {getCustomerEmail(order)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                {formatPrice(order.totalAmount)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm capitalize text-slate-600">
                                                    {order.paymentStatus || "pending"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                        statusStyles[order.orderStatus] ||
                                                        "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {order.orderStatus || "pending"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <select
                                                    value={order.orderStatus || "pending"}
                                                    disabled={
                                                        updatingId !== null ||
                                                        order.orderStatus === "cancelled"
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            order._id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-indigo-500 disabled:bg-slate-100"
                                                >
                                                    {statuses.map((item) => (
                                                        <option
                                                            key={item}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </option>
                                                    ))}
                                                </select>

                                                {updatingId === order._id && (
                                                    <p className="mt-1 text-xs text-indigo-600">
                                                        Updating...
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && orders.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">

                            <p className="text-sm text-slate-500">
                                Page {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((prev) => Math.max(1, prev - 1))
                                    }
                                    className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    type="button"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() =>
                                        setPage((prev) => prev + 1)
                                    }
                                    className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageOrders;
