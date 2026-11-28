import {
    ArrowRight,
    ChevronLeft,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Truck
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import {
    getCart,
    removeCartItem,
    updateCartItem
} from "../../services/cart.service";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const Cart = () => {
    const { applyCartResponse } = useCart();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await getCart();
            const items = response.cart?.items || [];
            setCart(items);
            applyCartResponse(response);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        try {
            setUpdatingId(productId);

            const response = await updateCartItem(productId, quantity);
            setCart(response.cart?.items || []);
            applyCartResponse(response);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update quantity."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const handleRemove = async (productId) => {
        try {
            setUpdatingId(productId);

            const response = await removeCartItem(productId);
            setCart(response.cart?.items || []);
            applyCartResponse(response);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to remove product."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const subtotal = cart.reduce((total, item) => {
        return total + (item.product?.price || 0) * item.quantity;
    }, 0);

    if (loading) {
        return (
            <div className="py-20 text-center">
                Loading your cart...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f7f5] px-3 py-6 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/products"
                    className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
                >
                    <ChevronLeft size={17} />
                    Continue shopping
                </Link>

                <div className="mb-7 flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
                            Your bag
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Shopping Cart
                        </h1>
                    </div>
                    <div className="hidden items-center gap-2 text-sm sm:flex">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">1</span>
                        <span className="font-semibold text-slate-900">Cart</span>
                        <span className="mx-1 h-px w-8 bg-slate-300" />
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-400">2</span>
                        <span className="text-slate-400">Checkout</span>
                    </div>
                </div>

                {error && (
                    <p className="mb-5 rounded-lg bg-red-50 p-3 text-red-600">
                        {error}
                    </p>
                )}

                {cart.length === 0 ? (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                        <ShoppingBag
                            size={48}
                            className="mx-auto mb-4 text-gray-400"
                        />

                        <h2 className="text-xl font-semibold">
                            Your cart is empty
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Explore our smart kitchen appliances.
                        </p>

                        <Link
                            to="/products"
                            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-white"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">

                        <div className="space-y-4 lg:col-span-2">
                            {cart.map((item) => {
                                const product = item.product;

                                if (!product) return null;

                                const image =
                                    product.images?.[0]?.url ||
                                    "https://placehold.co/200x200?text=Product";

                                return (
                                    <div
                                        key={product._id}
                                        className="group flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:p-5"
                                    >
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:h-28 sm:w-28"
                                        >
                                            <img
                                                src={image}
                                                alt={product.name}
                                                className="h-full w-full rounded-xl object-contain p-2 transition duration-300 group-hover:scale-[1.03]"
                                            />
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {product.brand || "Smart appliance"}
                                            </p>
                                            <Link
                                                to={`/products/${product._id}`}
                                                className="line-clamp-2 font-bold text-slate-900 transition hover:text-brand-600"
                                            >
                                                {product.name}
                                            </Link>
                                            <p className="mt-3 font-bold text-slate-950">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        updatingId === product._id ||
                                                        item.quantity <= 1
                                                    }
                                                    onClick={() =>
                                                        handleQuantity(
                                                            product._id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={15} />
                                                </button>
                                                <span className="min-w-8 text-center text-sm font-bold text-slate-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        updatingId === product._id ||
                                                        item.quantity >= product.stock
                                                    }
                                                    onClick={() =>
                                                        handleQuantity(
                                                            product._id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={15} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={updatingId === product._id}
                                                onClick={() => handleRemove(product._id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                aria-label="Remove product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <aside className="h-fit rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] lg:sticky lg:top-24">
                            <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-emerald-600">Calculated next</span>
                                </div>
                            </div>

                            <div className="my-5 h-px bg-slate-100" />

                            <div className="flex items-end justify-between">
                                <span className="font-bold text-slate-950">Total</span>
                                <div className="text-right">
                                    <p className="text-xl font-extrabold text-slate-950">{formatPrice(subtotal)}</p>
                                    <p className="mt-1 text-[11px] text-slate-400">Taxes included</p>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-brand-600"
                            >
                                Proceed to checkout
                                <ArrowRight size={18} />
                            </Link>

                            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <Truck size={17} className="text-brand-600" />
                                    <span>Safe and reliable delivery</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <ShieldCheck size={17} className="text-brand-600" />
                                    <span>Secure Razorpay checkout</span>
                                </div>
                            </div>
                        </aside>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
