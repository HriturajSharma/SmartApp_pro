
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
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-6xl">

                <h1 className="mb-2 text-3xl font-bold">
                    Checkout
                </h1>

                <p className="mb-8 text-gray-500">
                    Enter your delivery details.
                </p>

                {error && (
                    <p className="mb-5 rounded-lg bg-red-50 p-3 text-red-600">
                        {error}
                    </p>
                )}

                {items.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center">
                        <h2 className="text-xl font-semibold">
                            Your cart is empty
                        </h2>

                        <Link
                            to="/products"
                            className="mt-5 inline-block rounded-lg bg-black px-6 py-3 text-white"
                        >
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 rounded-xl bg-white p-6 shadow-sm lg:col-span-2"
                        >
                            <h2 className="text-xl font-semibold">
                                Shipping Information
                            </h2>

                            {[
                                ["fullName", "Full Name", "text"],
                                ["phone", "Mobile Number", "tel"],
                                ["email", "Email Address", "email"],
                                ["address", "Full Address", "text"],
                                ["city", "City", "text"],
                                ["state", "State", "text"],
                                ["pincode", "PIN Code", "text"]
                            ].map(([name, label, type]) => (
                                <div key={name}>
                                    <label
                                        htmlFor={name}
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        {label}
                                    </label>

                                    <input
                                        id={name}
                                        name={name}
                                        type={type}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required
                                        maxLength={
                                            name === "phone" ? 10 :
                                            name === "pincode" ? 6 :
                                            undefined
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                                    />
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={submitting || items.length === 0}
                                className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
                            >
                                {submitting
                                    ? "Processing..."
                                    : "Pay with Razorpay"}
                            </button>
                        </form>

                        <div className="h-fit rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold">
                                Order Summary
                            </h2>

                            <div className="mt-5 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.product?._id}
                                        className="flex justify-between gap-3 text-sm"
                                    >
                                        <span className="text-gray-600">
                                            {item.product?.name} × {item.quantity}
                                        </span>

                                        <span className="font-medium">
                                            {formatPrice(
                                                (item.product?.price || 0) *
                                                item.quantity
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-5" />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            <p className="mt-3 text-xs text-gray-500">
                                Shipping and final charges will be calculated
                                before payment.
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
