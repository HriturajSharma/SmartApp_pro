
import {
    ArrowUpRight,
    Bell,
    ChartNoAxesCombined,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Download,
    Image,
    LayoutDashboard,
    Menu,
    Package,
    Search,
    Settings,
    ShoppingBag,
    Tags,
    Truck,
    Users,
    
    X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api";

const navigation = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Categories", path: "/admin/categories", icon: Tags },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Banners", path: "/admin/banners", icon: Image }
];

const formatCurrency = (value = 0) =>
    `₹${Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    })}`;

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

const statusStyles = {
    pending: "bg-amber-50 text-amber-700",
    paid: "bg-indigo-50 text-indigo-700",
    shipped: "bg-blue-50 text-blue-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700"
};

const Dashboard = () => {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        let active = true;

        const fetchDashboard = async () => {
            try {
                const response = await api.get("/admin/dashboard");

                if (active) {
                    setDashboardData(response.data);
                }
            } catch (err) {
                if (!active) return;

                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    navigate("/login");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDashboard();

        return () => {
            active = false;
        };
    }, [navigate]);

    const stats = dashboardData?.stats || {};
    const recentOrders = dashboardData?.recentOrders || [];
    const monthlyRevenue = dashboardData?.monthlyRevenue || [];
    const topProducts = dashboardData?.topProducts || [];

    const dashboardStats = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            icon: CircleDollarSign,
            description: "Revenue from paid orders",
            color: "bg-violet-50 text-violet-600"
        },
        {
            title: "Total Orders",
            value: Number(stats.totalOrders || 0).toLocaleString("en-IN"),
            icon: ShoppingBag,
            description: "All customer orders",
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Total Customers",
            value: Number(stats.totalCustomers || 0).toLocaleString("en-IN"),
            icon: Users,
            description: "Registered customers",
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Total Products",
            value: Number(stats.totalProducts || 0).toLocaleString("en-IN"),
            icon: Package,
            description: "Active store products",
            color: "bg-amber-50 text-amber-600"
        }
    ];

    const chartData = useMemo(() => {
        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];

        return months.map((month, index) => ({
            month,
            revenue:
                monthlyRevenue.find(
                    (item) => Number(item._id) === index + 1
                )?.revenue || 0
        }));
    }, [monthlyRevenue]);

    const maxRevenue = Math.max(
        ...chartData.map((item) => item.revenue),
        1
    );

    const filteredOrders = recentOrders.filter((order) => {
        const term = search.toLowerCase();

        return (
            order.orderNumber?.toLowerCase().includes(term) ||
            order.shippingAddress?.fullName?.toLowerCase().includes(term) ||
            order.user?.name?.toLowerCase().includes(term)
        );
    });

    const exportReport = () => {
        const rows = [
            ["Order Number", "Customer", "Date", "Amount", "Status"],
            ...recentOrders.map((order) => [
                order.orderNumber,
                order.shippingAddress?.fullName || order.user?.name || "Customer",
                order.createdAt ? formatDate(order.createdAt) : "",
                order.totalAmount,
                order.orderStatus
            ])
        ];

        const csv = rows
            .map((row) =>
                row.map((value) =>
                    `"${String(value ?? "").replace(/"/g, '""')}"`
                ).join(",")
            )
            .join("\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "recent-orders-report.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center p-5">
                <div className="bg-white rounded-2xl border p-8 text-center max-w-md w-full">
                    <p className="text-red-600 font-medium mb-4">
                        {error || "Dashboard data unavailable."}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8fc] text-slate-800">

            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <h1 className="font-bold text-lg">
                        APPLIANCE<span className="text-indigo-600">HUB</span>
                    </h1>
                </div>
                <Bell size={20} />
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#111827] text-white flex flex-col transition-transform duration-300 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">
                            APPLIANCE<span className="text-indigo-400">HUB</span>
                        </h1>
                        <p className="text-[10px] tracking-[3px] text-slate-400 mt-1">
                            ADMINISTRATION
                        </p>
                    </div>
                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-5 py-7">
                    <p className="text-[10px] font-bold tracking-[2px] text-slate-500 mb-4">
                        WORKSPACE
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/admin"}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`
                                    }
                                >
                                    <Icon size={19} />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-5">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                        <div className="flex items-center gap-2 text-indigo-300 mb-2">
                            <ChartNoAxesCombined size={18} />
                            <span className="text-xs font-semibold">Store Analytics</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-5">
                            Manage products, monitor orders and grow your store.
                        </p>
                    </div>

                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-3 py-3 text-sm text-slate-400 hover:text-white"
                    >
                        <Settings size={18} />
                        Back to Store
                    </NavLink>

                    <div className="border-t border-white/10 pt-5 mt-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                            A
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium">Administrator</p>
                            <p className="text-xs text-slate-500">Store Manager</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="lg:ml-[260px] min-h-screen">

                {/* Topbar */}
                <header className="hidden lg:flex h-20 bg-white border-b border-slate-100 px-8 items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Dashboard Overview</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Monitor your store performance
                        </p>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-2.5 text-slate-400"
                                size={17}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search recent orders..."
                                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none w-64 focus:border-indigo-300"
                            />
                        </div>

                        <button className="relative p-2 text-slate-500 hover:text-indigo-600">
                            <Bell size={21} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        <div className="flex items-center gap-3 border-l pl-5">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                A
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Admin User</p>
                                <p className="text-xs text-slate-400">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-5 md:p-8 max-w-[1600px] mx-auto">

                    {/* Heading */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs text-slate-400 mb-2">
                                WORKSPACE / DASHBOARD
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Welcome back, Admin
                            </h1>
                            <p className="text-sm text-slate-500 mt-2">
                                Here's what's happening with your store today.
                            </p>
                        </div>

                        <button
                            onClick={exportReport}
                            className="flex items-center justify-center gap-2 bg-[#111827] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                        >
                            <Download size={17} />
                            Export Recent Orders
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
                        {dashboardStats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.title}
                                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                                            <Icon size={22} />
                                        </div>
                                        <ArrowUpRight size={18} className="text-slate-300" />
                                    </div>

                                    <p className="text-sm text-slate-500 mt-5">
                                        {stat.title}
                                    </p>
                                    <h3 className="text-2xl font-bold tracking-tight mt-1">
                                        {stat.value}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {stat.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Analytics */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-7">

                        {/* Revenue */}
                        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 md:p-7 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="font-bold text-lg">Revenue Analytics</h2>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Monthly paid revenue · Current year
                                    </p>
                                </div>
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg">
                                    {new Date().getFullYear()}
                                </span>
                            </div>

                            <div className="mt-7 mb-6">
                                <h3 className="text-3xl font-bold">
                                    {formatCurrency(stats.totalRevenue)}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    All-time paid revenue
                                </p>
                            </div>

                            <div className="h-48 flex items-end gap-2 sm:gap-4 border-b border-l border-slate-100 px-2">
                                {chartData.map((item) => (
                                    <div
                                        key={item.month}
                                        className="flex-1 h-full flex flex-col justify-end items-center gap-2 group"
                                    >
                                        <div
                                            title={`${item.month}: ${formatCurrency(item.revenue)}`}
                                            style={{
                                                height: `${Math.max(
                                                    (item.revenue / maxRevenue) * 100,
                                                    2
                                                )}%`
                                            }}
                                            className="w-full max-w-9 rounded-t-md bg-indigo-500/80 group-hover:bg-indigo-700 transition"
                                        />
                                        <span className="text-[10px] text-slate-400 -mb-6">
                                            {item.month}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm">
                            <h2 className="font-bold text-lg">Order Summary</h2>
                            <p className="text-xs text-slate-400 mt-1 mb-7">
                                Current order distribution
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        title: "Pending",
                                        subtitle: "Awaiting processing",
                                        count: stats.pendingOrders,
                                        icon: Clock3,
                                        color: "bg-amber-50 text-amber-600"
                                    },
                                    {
                                        title: "Shipped",
                                        subtitle: "On the way",
                                        count: stats.shippedOrders,
                                        icon: Truck,
                                        color: "bg-blue-50 text-blue-600"
                                    },
                                    {
                                        title: "Delivered",
                                        subtitle: "Successfully completed",
                                        count: stats.deliveredOrders,
                                        icon: CheckCircle2,
                                        color: "bg-emerald-50 text-emerald-600"
                                    }
                                ].map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.title} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                                                    <Icon size={19} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{item.title}</p>
                                                    <p className="text-xs text-slate-400">{item.subtitle}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold">
                                                {Number(item.count || 0).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <NavLink
                                to="/admin/orders"
                                className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition"
                            >
                                View All Orders <ArrowUpRight size={16} />
                            </NavLink>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-7">
                        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-lg">Recent Orders</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Latest customer transactions
                                </p>
                            </div>
                            <NavLink
                                to="/admin/orders"
                                className="text-sm text-indigo-600 font-semibold hover:text-indigo-800"
                            >
                                View All Orders
                            </NavLink>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-slate-50 text-xs text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Order ID</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr
                                                key={order._id}
                                                className="hover:bg-slate-50/70"
                                            >
                                                <td className="px-6 py-4 text-sm font-semibold">
                                                    {order.orderNumber}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {order.shippingAddress?.fullName ||
                                                        order.user?.name ||
                                                        "Customer"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {order.items?.[0]?.product?.name ||
    order.items?.[0]?.name ||
    "Product"}
                                                    {order.items?.length > 1 &&
                                                        ` +${order.items.length - 1} more`}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {order.createdAt
                                                        ? formatDate(order.createdAt)
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold">
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                                                        statusStyles[order.orderStatus] ||
                                                        "bg-slate-100 text-slate-600"
                                                    }`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <NavLink
                                                        to="/admin/orders"
                                                        className="text-slate-400 hover:text-indigo-600"
                                                        title="View orders"
                                                    >
                                                        <ArrowUpRight size={18} />
                                                    </NavLink>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-sm text-slate-400">
                                                No matching orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-lg">Top Selling Products</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Best performing products by units sold
                                </p>
                            </div>
                            <NavLink
                                to="/admin/products"
                                className="text-sm text-indigo-600 font-semibold"
                            >
                                View Products
                            </NavLink>
                        </div>

                        {topProducts.length === 0 ? (
                            <p className="text-sm text-slate-400 py-8 text-center">
                                No product sales available yet.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {topProducts.map((product, index) => {
                                    const maxSold = Math.max(
                                        ...topProducts.map((item) => item.sold || 0),
                                        1
                                    );

                                    return (
                                        <div
                                            key={product._id || index}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold truncate">
                                                         {product.name || product.productName || product._id}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {product.sold} units sold
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold whitespace-nowrap">
                                                        {formatCurrency(product.revenue)}
                                                    </p>
                                                </div>

                                                <div className="h-1.5 rounded-full bg-slate-100 mt-3 overflow-hidden">
                                                    <div
                                                        style={{
                                                            width: `${(product.sold / maxSold) * 100}%`
                                                        }}
                                                        className="h-full rounded-full bg-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <footer className="text-center text-xs text-slate-400 py-8">
                        © {new Date().getFullYear()} ApplianceHub. All rights reserved.
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
