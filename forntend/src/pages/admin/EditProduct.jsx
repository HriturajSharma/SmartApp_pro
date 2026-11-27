
import { ArrowLeft, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const initialForm = {
    name: "",
    brand: "",
    description: "",
    category: "",
    price: "",
    mrp: "",
    stock: "",
    power: "",
    capacity: "",
    capacityUnit: "L",
    warrantyMonths: "",
    isFeatured: false,
    isActive: true,
    images: "",
    safetyFeatures: "",
    certifications: "",
    safetyPrecautions: "",
    usageInstructions: ""
};

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState(initialForm);
    const [imageMetadata, setImageMetadata] = useState([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [productResponse, categoryResponse] =
                await Promise.all([
                    api.get(`/products/${id}`),
                    api.get("/categories")
                ]);

            const product = productResponse.data?.product;

            if (!product) {
                throw new Error("Product not found.");
            }

            setCategories(categoryResponse.data?.categories || []);

            const images = product.images || [];

            setImageMetadata(images);

            setForm({
                name: product.name || "",
                brand: product.brand || "",
                description: product.description || "",
                category:
                    product.category?._id ||
                    product.category ||
                    "",
                price: product.price ?? "",
                mrp: product.mrp ?? "",
                stock: product.stock ?? "",
                power: product.specifications?.power ?? "",
                capacity: product.specifications?.capacity ?? "",
                capacityUnit:
                    product.specifications?.capacityUnit || "L",
                warrantyMonths: product.warrantyMonths ?? "",
                isFeatured: product.isFeatured ?? false,
                isActive: product.isActive ?? true,

                images: images
                    .map((image) => image.url)
                    .join("\n"),

                safetyFeatures: (
                    product.specifications?.safetyFeatures || []
                ).join(", "),

                certifications: (
                    product.specifications?.certifications || []
                ).join(", "),

                safetyPrecautions: (
                    product.safetyPrecautions || []
                ).join("\n"),

                usageInstructions: (
                    product.usageInstructions || []
                )
                    .map((item) => item.instruction)
                    .join("\n")
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load product."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;

        setError("");

        const price = Number(form.price);
        const mrp = Number(form.mrp);
        const stock = Number(form.stock);
        const power = Number(form.power);
        const capacity = Number(form.capacity);
        const warrantyMonths = Number(form.warrantyMonths);

        // Required fields
        if (
            !form.name.trim() ||
            !form.brand.trim() ||
            !form.description.trim() ||
            !form.category
        ) {
            setError("Please fill all required fields.");
            return;
        }

        // Numeric validation
        if (
            [
                form.price,
                form.mrp,
                form.stock,
                form.power,
                form.capacity,
                form.warrantyMonths
            ].some((value) => value === "") ||
            ![
                price,
                mrp,
                stock,
                power,
                capacity,
                warrantyMonths
            ].every(Number.isFinite)
        ) {
            setError("Please enter valid values in all numeric fields.");
            return;
        }

        if (
            price < 0 ||
            mrp < price ||
            stock < 0 ||
            power <= 0 ||
            capacity <= 0 ||
            warrantyMonths < 0
        ) {
            setError(
                "Please enter valid numbers. MRP must be greater than or equal to selling price."
            );
            return;
        }

        // Image validation
        const imageUrls = form.images
            .split("\n")
            .map((url) => url.trim())
            .filter(Boolean);

        const invalidImage = imageUrls.some((url) => {
            try {
                const parsedUrl = new URL(url);
                return !["http:", "https:"].includes(parsedUrl.protocol);
            } catch {
                return true;
            }
        });

        if (invalidImage) {
            setError("Please enter valid HTTP or HTTPS image URLs.");
            return;
        }

        if (imageUrls.length === 0) {
            setError("Please add at least one product image.");
            return;
        }

        // Preserve existing image metadata by matching URL.
        const images = imageUrls.map((url) => {
            const existingImage = imageMetadata.find(
                (image) => image.url === url
            );

            return {
                url,
                public_id: existingImage?.public_id || ""
            };
        });

        const payload = {
            name: form.name.trim(),
            brand: form.brand.trim(),
            description: form.description.trim(),
            category: form.category,

            price,
            mrp,
            stock,
            warrantyMonths,

            isFeatured: form.isFeatured,
            isActive: form.isActive,

            images,

            specifications: {
                power,
                capacity,
                capacityUnit: form.capacityUnit,

                safetyFeatures: form.safetyFeatures
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),

                certifications: form.certifications
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            },

            safetyPrecautions: form.safetyPrecautions
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),

            usageInstructions: form.usageInstructions
                .split("\n")
                .map((instruction, index) => ({
                    step: index + 1,
                    instruction: instruction.trim()
                }))
                .filter((item) => item.instruction)
        };

        try {
            setSaving(true);

            await api.put(`/products/${id}`, payload);

            navigate("/admin/products");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update product."
            );
        } finally {
            setSaving(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-700";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Loading product...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">

                <Link
                    to="/admin/products"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
                >
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>

                <div className="mb-6">
                    <p className="text-sm font-medium text-indigo-600">
                        ADMINISTRATION / PRODUCTS
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Edit Product
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Update appliance information and specifications.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {error}

                        <button
                            type="button"
                            onClick={loadData}
                            className="ml-3 font-semibold underline"
                        >
                            Reload
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
                >
                    {/* Basic Information */}
                    <section className="space-y-4">
                        <h2 className="font-semibold text-slate-800">
                            Basic Information
                        </h2>

                        <div>
                            <label className={labelClass}>Product Name *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Brand *</label>
                            <input
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Description *</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Category *</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            >
                                <option value="">Select category</option>

                                {categories.map((category) => (
                                    <option
                                        key={category._id}
                                        value={category._id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <hr />

                    {/* Pricing */}
                    <section className="space-y-4">
                        <h2 className="font-semibold text-slate-800">
                            Pricing & Inventory
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                ["price", "Selling Price"],
                                ["mrp", "MRP"],
                                ["stock", "Stock"]
                            ].map(([name, label]) => (
                                <div key={name}>
                                    <label className={labelClass}>
                                        {label} {name !== "stock" && "(₹)"} *
                                    </label>

                                    <input
                                        type="number"
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr />

                    {/* Specifications */}
                    <section className="space-y-4">
                        <h2 className="font-semibold text-slate-800">
                            Technical Specifications
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className={labelClass}>Power (Watts) *</label>
                                <input
                                    type="number"
                                    name="power"
                                    value={form.power}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Capacity *</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="any"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Capacity Unit *</label>
                                <select
                                    name="capacityUnit"
                                    value={form.capacityUnit}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    {["L", "kg", "ml", "cups"].map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Warranty (Months) *
                            </label>
                            <input
                                type="number"
                                name="warrantyMonths"
                                value={form.warrantyMonths}
                                onChange={handleChange}
                                min="0"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Safety Features</label>
                            <textarea
                                name="safetyFeatures"
                                value={form.safetyFeatures}
                                onChange={handleChange}
                                placeholder="Separate items with commas"
                                rows={3}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Certifications</label>
                            <textarea
                                name="certifications"
                                value={form.certifications}
                                onChange={handleChange}
                                placeholder="Separate items with commas"
                                rows={3}
                                className={inputClass}
                            />
                        </div>
                    </section>

                    <hr />

                    {/* Images and Instructions */}
                    <section className="space-y-4">
                        <h2 className="font-semibold text-slate-800">
                            Images & Instructions
                        </h2>

                        <div>
                            <label className={labelClass}>
                                Product Image URLs
                            </label>
                            <textarea
                                name="images"
                                value={form.images}
                                onChange={handleChange}
                                placeholder="One image URL per line"
                                rows={4}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Safety Precautions
                            </label>
                            <textarea
                                name="safetyPrecautions"
                                value={form.safetyPrecautions}
                                onChange={handleChange}
                                placeholder="One precaution per line"
                                rows={4}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Usage Instructions
                            </label>
                            <textarea
                                name="usageInstructions"
                                value={form.usageInstructions}
                                onChange={handleChange}
                                placeholder="One instruction per line"
                                rows={5}
                                className={inputClass}
                            />
                        </div>
                    </section>

                    <hr />

                    {/* Status */}
                    <section className="space-y-3">
                        <h2 className="font-semibold text-slate-800">
                            Product Status
                        </h2>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={form.isFeatured}
                                onChange={handleChange}
                            />
                            Featured product
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                            />
                            Active product
                        </label>
                    </section>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        <Save size={18} />
                        {saving ? "Updating..." : "Update Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
