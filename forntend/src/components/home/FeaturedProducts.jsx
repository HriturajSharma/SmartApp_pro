
import { ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { addToCart } from "../../services/cart.service";

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products", {
                    params: { featured: true }
                });

                const productList = response.data.products || [];

                setProducts(
                    productList.filter(product => product.isActive)
                );
            } catch (error) {
                console.error("Featured products error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
        try {
            setAddingId(productId);
            setMessage("");

            await addToCart(productId, 1);

            setMessage("Product added to cart successfully!");
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/login");
                return;
            }

            setMessage(
                error.response?.data?.message ||
                "Unable to add product to cart."
            );
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <section className="px-4 py-12 text-center">
                Loading featured products...
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                        Our Collection
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Featured Appliances
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Discover appliances designed for everyday living.
                    </p>
                </div>

                <Link
                    to="/products"
                    className="font-semibold text-brand-600 hover:text-brand-700"
                >
                    View All Products →
                </Link>
            </div>

            {message && (
                <p className="mb-5 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
                    {message}
                </p>
            )}

            {products.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
                    No featured products available.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map(product => (
                        <article
                            key={product._id}
                            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <Link to={`/products/${product._id}`}>
                                <div className="relative h-56 bg-gradient-to-br from-slate-50 to-stone-100">
                                    <img
                                        src={product.images?.[0]?.url}
                                        alt={product.name}
                                        className="h-full w-full object-contain p-5"
                                    />

                                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
                                        Featured
                                    </span>
                                </div>
                            </Link>

                            <div className="p-5">
                                <p className="text-xs font-medium text-slate-500">
                                    {product.brand}
                                </p>

                                <Link to={`/products/${product._id}`}>
                                    <h3 className="mt-1 min-h-12 font-semibold text-slate-900 hover:text-indigo-600">
                                        {product.name}
                                    </h3>
                                </Link>

                                <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                                    <Star size={15} fill="currentColor" />
                                    <span className="text-slate-500">
                                        Appliance
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900">
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </p>

                                        {product.mrp > product.price && (
                                            <p className="text-xs text-slate-400 line-through">
                                                ₹{Number(product.mrp).toLocaleString("en-IN")}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product._id)}
                                        disabled={
                                            addingId === product._id ||
                                            product.stock <= 0
                                        }
                                        className="flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ShoppingCart size={16} />
                                        {product.stock <= 0
                                            ? "Out of Stock"
                                            : addingId === product._id
                                                ? "Adding..."
                                                : "Add"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default FeaturedProducts;
