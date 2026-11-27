import { ChevronLeft, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCart } from "../../services/cart.service";
import {
    createOrder,
    createPaymentOrder,
    verifyPayment
} from "../../services/order.service";

import { useCart } from "../../context/CartContext";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price || 0);

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), {
                once: true
            });

            existingScript.addEventListener("error", () => resolve(false), {
                once: true
            });

            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await getCart();
                setItems(response.cart?.items || []);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Unable to load cart."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const subtotal = items.reduce(
        (total, item) =>
            total + (item.product?.price || 0) * item.quantity,
        0
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (items.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (!/^\d{6}$/.test(formData.pincode)) {
            setError("Enter a valid 6-digit PIN code.");
            return;
        }

        try {
            setSubmitting(true);

            // 1. Load Razorpay
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded || !window.Razorpay) {
                throw new Error(
                    "Unable to load Razorpay. Please try again."
                );
            }

            // 2. Create order in MongoDB
            const orderResponse = await createOrder({
                shippingAddress: formData,
                paymentMethod: "razorpay"
            });

            if (!orderResponse.success) {
                throw new Error("Unable to create order.");
            }

            const order = orderResponse.order;

            // 3. Create Razorpay payment order
            const paymentResponse = await createPaymentOrder(order._id);

            if (!paymentResponse.success) {
                throw new Error("Unable to initialize payment.");
            }

            // 4. Configure Razorpay
            const options = {
                key: paymentResponse.key,
                amount: paymentResponse.amount,
                currency: paymentResponse.currency,
                name: "Smart Appliances",
                description: `Order ${order.orderNumber}`,
                order_id: paymentResponse.razorpayOrderId,

                prefill: {
                    name: formData.fullName,
                    email: formData.email,
                    contact: formData.phone
                },

                theme: {
                    color: "#111827"
                },

                handler: async (paymentResult) => {
                    try {
                        setError("");
                        setSubmitting(true);

                        // 5. Verify payment on backend
                        const verification = await verifyPayment(
                            order._id,
                            paymentResult
                        );

                        if (!verification.success) {
                            throw new Error(
                                "Payment verification failed."
                            );
                        }

                        // 6. Refresh shared cart
                        await refreshCart();

                        // 7. Navigate to success page
                        navigate("/order-success", {
                            state: {
                                order: verification.order
                            }
                        });
                    } catch (err) {
                        setError(
                            err.response?.data?.message ||
                            err.message ||
                            "Payment verification failed. Please contact support."
                        );
                    } finally {
                        setSubmitting(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setSubmitting(false);
                        setError(
                            "Payment window closed. Your order is still pending."
                        );
                    }
                }
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                setSubmitting(false);

                setError(
                    response.error?.description ||
                    "Payment failed. Please try again."
                );
            });

            razorpay.open();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to process checkout."
            );

            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                Loading checkout...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f7f5] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/cart"
                    className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
                >
                    <ChevronLeft size={17} />
                    Back to cart
                </Link>

                <div className="mb-7 flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
                            Secure checkout
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Checkout
                        </h1>
                    </div>
                    <div className="hidden items-center gap-2 text-sm sm:flex">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">1</span>
                        <span className="text-slate-400">Cart</span>
                        <span className="mx-1 h-px w-8 bg-slate-300" />
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">2</span>
                        <span className="font-semibold text-slate-900">Checkout</span>
                    </div>
                </div>

                {error && (
                    <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-12 text-center shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
                        <Link
                            to="/products"
                            className="mt-5 inline-block rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white"
                        >
                            Shop now
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-5">
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] sm:p-7 lg:col-span-3"
                        >
                            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                                    <MapPin size={19} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-950">Delivery Information</h2>
                                    <p className="mt-0.5 text-xs text-slate-400">Where should we deliver your order?</p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                { [
                                    ["fullName", "Full Name", "text", "e.g. Rahul Sharma"],
                                    ["phone", "Mobile Number", "tel", "10-digit mobile number"],
                                    ["email", "Email Address", "email", "name@example.com"],
                                    ["address", "Full Address", "text", "House, street and landmark"],
                                    ["city", "City", "text", "City"],
                                    ["state", "State", "text", "State"],
                                    ["pincode", "PIN Code", "text", "6-digit PIN code"]
                                ].map(([name, label, type, placeholder]) => (
                                    <div key={name} className={name === "address" ? "sm:col-span-2" : ""}>
                                        <label htmlFor={name} className="mb-2 block text-sm font-bold text-slate-700">
                                            {label}
                                        </label>
                                        <input
                                            id={name}
                                            name={name}
                                            type={type}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            required
                                            maxLength={name === "phone" ? 10 : name === "pincode" ? 6 : undefined}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || items.length === 0}
                                className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <LockKeyhole size={17} />
                                {submitting ? "Processing..." : `Pay ${formatPrice(subtotal)} securely`}
                            </button>
                        </form>

                        <aside className="h-fit rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] sm:p-6 lg:col-span-2 lg:sticky lg:top-24">
                            <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>

                            <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
                                {items.map((item) => {
                                    const product = item.product;
                                    const image = product?.images?.[0]?.url;
                                    return (
                                        <div key={product?._id} className="flex items-center gap-3">
                                            <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100">
                                                {image && (
                                                    <img src={image} alt={product.name} className="h-full w-full rounded-xl object-contain p-1.5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-semibold text-slate-800">{product?.name}</p>
                                                <p className="mt-1 text-xs text-slate-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="shrink-0 text-sm font-bold text-slate-900">
                                                {formatPrice((product?.price || 0) * item.quantity)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="my-5 h-px bg-slate-100" />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-emerald-600">Free</span>
                                </div>
                            </div>

                            <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">
                                <span className="font-bold text-slate-950">Total</span>
                                <span className="text-xl font-extrabold text-slate-950">{formatPrice(subtotal)}</span>
                            </div>

                            <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                <ShieldCheck size={18} className="shrink-0 text-brand-600" />
                                <span>Protected by secure Razorpay payment processing</span>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
