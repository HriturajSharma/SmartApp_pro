
import {
    Package,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(price) || 0);

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/products");

            setProducts(response.data?.products || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load products. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Delete product
    const handleDelete = async (productId) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this product?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(productId);

            await api.delete(`/products/${productId}`);

            setProducts((prev) =>
                prev.filter((product) => product._id !== productId)
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to deactivate product."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Search products
    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return products;

        return products.filter((product) =>
            [
                product.name,
                product.brand,
                product.category?.name
            ].some((value) =>
                String(value || "").toLowerCase().includes(term)
            )
        );
    }, [products, search]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            ADMINISTRATION / PRODUCTS
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            Manage Products
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage your appliance inventory.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <Link
                            to="/admin/products/add"
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <Plus size={17} />
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search by product, brand or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center">
                        <p>{error}</p>

                        <button
                            onClick={fetchProducts}
                            className="font-semibold underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Product Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            All Products
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {filteredProducts.length} products found
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            Loading products...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package
                                size={36}
                                className="mx-auto mb-3 text-slate-300"
                            />

                            <p className="font-medium text-slate-700">
                                No products found
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Try another search or add a new product.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Product</th>
                                        <th className="px-5 py-4">Category</th>
                                        <th className="px-5 py-4">Price</th>
                                        <th className="px-5 py-4">Stock</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.map((product) => (
                                        <tr
                                            key={product._id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            product.images?.[0]?.url ||
                                                            "/images/placeholder.png"
                                                        }
                                                        alt={product.name || "Product"}
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src =
                                                                "/images/placeholder.png";
                                                        }}
                                                        className="h-12 w-12 rounded-lg border border-slate-100 object-cover"
                                                    />

                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {product.name || "Unnamed Product"}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {product.brand || "No brand"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {product.category?.name || "Uncategorized"}
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                {formatPrice(product.price)}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {product.stock ?? 0}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        product.isActive
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {product.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/admin/products/edit/${product._id}`}
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                        title="Edit product"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(product._id)
                                                        }
                                                        disabled={
                                                            deletingId === product._id
                                                        }
                                                        className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                        title="Deactivate product"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageProducts;
