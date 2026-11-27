
import {
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await getCart();
            setCart(response.cart?.items || []);
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
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Shopping Cart
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Review your selected appliances.
                    </p>
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
                                        className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                                    >
                                        <img
                                            src={image}
                                            alt={product.name}
                                            className="h-28 w-full rounded-lg object-cover sm:w-28"
                                        />

                                        <div className="flex-1">
                                            <Link
                                                to={`/products/${product._id}`}
                                                className="font-semibold text-gray-900 hover:text-blue-600"
                                            >
                                                {product.name}
                                            </Link>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {product.brand}
                                            </p>

                                            <p className="mt-2 font-semibold">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
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
                                                className="rounded-md border p-2 disabled:opacity-40"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <span className="min-w-6 text-center">
                                                {item.quantity}
                                            </span>

                                            <button
                                                disabled={updatingId === product._id}
                                                onClick={() =>
                                                    handleQuantity(
                                                        product._id,
                                                        item.quantity + 1
                                                    )
                                                }
                                                className="rounded-md border p-2 disabled:opacity-40"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            disabled={updatingId === product._id}
                                            onClick={() =>
                                                handleRemove(product._id)
                                            }
                                            className="self-start text-red-500 hover:text-red-700 sm:self-center"
                                            aria-label="Remove product"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="h-fit rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold">
                                Order Summary
                            </h2>

                            <div className="mt-5 flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            <div className="mt-3 flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>

                            <hr className="my-5" />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            <Link
                                to="/checkout"
                                className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/products"
                                className="mt-4 block text-center text-sm text-gray-500 hover:text-black"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
