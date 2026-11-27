
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    images: [{ url: "", public_id: "" }],
    safetyFeatures: [""],
    certifications: [""],
    safetyPrecautions: [""],
    usageInstructions: [{ step: 1, instruction: "" }]
};

const AddProduct = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories");

                if (active) {
                    setCategories(response.data?.categories || []);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load categories."
                    );
                }
            } finally {
                if (active) setFetchingCategories(false);
            }
        };

        fetchCategories();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) =>
                i === index ? value : item
            )
        }));
    };

    const addArrayItem = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], value]
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.map((image, i) =>
                i === index ? { ...image, url: value } : image
            )
        }));
    };

    const handleInstructionChange = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            usageInstructions: prev.usageInstructions.map((item, i) =>
                i === index ? { ...item, instruction: value } : item
            )
        }));
    };

    const addInstruction = () => {
        setFormData((prev) => ({
            ...prev,
            usageInstructions: [
                ...prev.usageInstructions,
                {
                    step: prev.usageInstructions.length + 1,
                    instruction: ""
                }
            ]
        }));
    };

    const removeInstruction = (index) => {
        setFormData((prev) => ({
            ...prev,
            usageInstructions: prev.usageInstructions
                .filter((_, i) => i !== index)
                .map((item, i) => ({
                    ...item,
                    step: i + 1
                }))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        const price = Number(formData.price);
        const mrp = Number(formData.mrp);
        const stock = Number(formData.stock);
        const power = Number(formData.power);
        const capacity = Number(formData.capacity);
        const warrantyMonths = Number(formData.warrantyMonths);

        // Required field validation
        if (
            !formData.name.trim() ||
            !formData.brand.trim() ||
            !formData.description.trim() ||
            !formData.category
        ) {
            setError("Please fill all required basic information.");
            return;
        }

        if (fetchingCategories || categories.length === 0) {
            setError("Please wait for categories to load or create a category first.");
            return;
        }

        // Numeric validation
        if (
            formData.price === "" ||
            formData.mrp === "" ||
            formData.stock === "" ||
            formData.power === "" ||
            formData.capacity === "" ||
            formData.warrantyMonths === "" ||
            ![
                price, mrp, stock, power, capacity, warrantyMonths
            ].every(Number.isFinite)
        ) {
            setError("Please enter valid numbers in all numeric fields.");
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
                "Enter valid values. MRP must be greater than or equal to selling price."
            );
            return;
        }

        // Image validation
        const imageUrls = formData.images
            .map((image) => image.url.trim())
            .filter(Boolean);

        if (imageUrls.length === 0) {
            setError("Please add at least one product image URL.");
            return;
        }

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

        const payload = {
            name: formData.name.trim(),
            brand: formData.brand.trim(),
            description: formData.description.trim(),
            category: formData.category,
            price,
            mrp,
            stock,
            specifications: {
                power,
                capacity,
                capacityUnit: formData.capacityUnit,
                safetyFeatures: formData.safetyFeatures
                    .map((item) => item.trim())
                    .filter(Boolean),
                certifications: formData.certifications
                    .map((item) => item.trim())
                    .filter(Boolean)
            },
            warrantyMonths,
            images: formData.images
                .filter((image) => image.url.trim())
                .map((image) => ({
                    url: image.url.trim(),
                    public_id: image.public_id
                })),
            safetyPrecautions: formData.safetyPrecautions
                .map((item) => item.trim())
                .filter(Boolean),
            usageInstructions: formData.usageInstructions
                .filter((item) => item.instruction.trim())
                .map((item, index) => ({
                    step: index + 1,
                    instruction: item.instruction.trim()
                })),
            isFeatured: formData.isFeatured,
            isActive: formData.isActive
        };

        try {
            setLoading(true);

            await api.post("/products", payload);

            navigate("/admin/products");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create product."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-700";

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">

                <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                    <ArrowLeft size={18} />
                    Back to products
                </button>

                <div className="mb-8">
                    <p className="text-sm font-medium text-indigo-600">
                        ADMINISTRATION / PRODUCTS
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Add New Product
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Add appliance information and specifications.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Basic Information
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Product Name *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Brand *</label>
                                <input
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                    disabled={fetchingCategories}
                                >
                                    <option value="">
                                        {fetchingCategories
                                            ? "Loading categories..."
                                            : "Select category"}
                                    </option>

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

                            <div className="sm:col-span-2">
                                <label className={labelClass}>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={inputClass}
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Pricing & Inventory
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-3">
                            {[
                                ["price", "Selling Price (₹)"],
                                ["mrp", "MRP (₹)"],
                                ["stock", "Stock Quantity"]
                            ].map(([name, label]) => (
                                <div key={name}>
                                    <label className={labelClass}>{label} *</label>
                                    <input
                                        type="number"
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Specifications */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Appliance Specifications
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <div>
                                <label className={labelClass}>Power (Watts) *</label>
                                <input
                                    type="number"
                                    name="power"
                                    value={formData.power}
                                    onChange={handleChange}
                                    min="1"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Capacity *</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="any"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Capacity Unit *</label>
                                <select
                                    name="capacityUnit"
                                    value={formData.capacityUnit}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    <option value="L">Litre (L)</option>
                                    <option value="ml">Millilitre (ml)</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="cups">Cups</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Dynamic fields */}
                    {[
                        ["safetyFeatures", "Safety Features"],
                        ["certifications", "Safety Certifications"],
                        ["safetyPrecautions", "Safety Precautions"]
                    ].map(([field, title]) => (
                        <section
                            key={field}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <h2 className="mb-5 text-lg font-semibold text-slate-900">
                                {title}
                            </h2>

                            <div className="space-y-3">
                                {formData[field].map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            value={item}
                                            onChange={(e) =>
                                                handleArrayChange(
                                                    field,
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                            placeholder={`Enter ${title.toLowerCase()}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeArrayItem(field, index)
                                            }
                                            disabled={formData[field].length === 1}
                                            className="rounded-xl border border-slate-200 p-3 text-red-500 disabled:opacity-40"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => addArrayItem(field, "")}
                                className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600"
                            >
                                <Plus size={16} />
                                Add {title}
                            </button>
                        </section>
                    ))}

                    {/* Usage Instructions */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Usage Instructions
                        </h2>

                        <div className="space-y-3">
                            {formData.usageInstructions.map((item, index) => (
                                <div key={index} className="flex gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-600">
                                        {index + 1}
                                    </span>

                                    <input
                                        value={item.instruction}
                                        onChange={(e) =>
                                            handleInstructionChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                        placeholder={`Instruction ${index + 1}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeInstruction(index)}
                                        disabled={formData.usageInstructions.length === 1}
                                        className="rounded-xl border border-slate-200 p-3 text-red-500 disabled:opacity-40"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addInstruction}
                            className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600"
                        >
                            <Plus size={16} />
                            Add Instruction
                        </button>
                    </section>

                    {/* Images */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-lg font-semibold text-slate-900">
                            Product Images
                        </h2>

                        <p className="mb-5 text-sm text-slate-500">
                            Enter publicly accessible image URLs.
                        </p>

                        {formData.images.map((image, index) => (
                            <div key={index} className="mb-3 flex gap-2">
                                <input
                                    value={image.url}
                                    onChange={(e) =>
                                        handleImageChange(index, e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="https://example.com/product.jpg"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeArrayItem("images", index)
                                    }
                                    disabled={formData.images.length === 1}
                                    className="rounded-xl border border-slate-200 p-3 text-red-500 disabled:opacity-40"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                addArrayItem("images", {
                                    url: "",
                                    public_id: ""
                                })
                            }
                            className="mt-2 flex items-center gap-2 text-sm font-semibold text-indigo-600"
                        >
                            <Plus size={16} />
                            Add Image URL
                        </button>
                    </section>

                    {/* Warranty */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Warranty & Visibility
                        </h2>

                        <div className="mb-5 max-w-xs">
                            <label className={labelClass}>
                                Warranty (Months) *
                            </label>

                            <input
                                type="number"
                                name="warrantyMonths"
                                value={formData.warrantyMonths}
                                onChange={handleChange}
                                min="0"
                                className={inputClass}
                                required
                            />
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="h-4 w-4 accent-indigo-600"
                                />
                                Featured Product
                            </label>

                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 accent-indigo-600"
                                />
                                Active Product
                            </label>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/products")}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || fetchingCategories}
                            className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Saving Product..." : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
