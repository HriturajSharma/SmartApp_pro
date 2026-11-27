
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {
    title: "",
    subtitle: "",
    image: "",
    link: "",
    isActive: true
};

const ManageBanners = () => {
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.get("/banners");
            setBanners(response.data.banners || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load banners"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setError("");
        setShowForm(true);
    };

    const openEditForm = (banner) => {
        setEditingId(banner._id);
        setForm({
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            image: banner.image || "",
            link: banner.link || "",
            isActive: banner.isActive ?? true
        });
        setError("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setSaving(true);

            if (editingId) {
                await api.put(`/banners/${editingId}`, form);
            } else {
                await api.post("/banners", form);
            }

            setShowForm(false);
            setForm({ ...emptyForm });
            setEditingId(null);
            await fetchBanners();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to save banner"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;

        try {
            await api.delete(`/banners/${id}`);
            await fetchBanners();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to delete banner"
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Manage Banners
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage promotional banners on your storefront.
                        </p>
                    </div>

                    <button
                        onClick={openAddForm}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Add Banner
                    </button>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="mb-8 space-y-4 rounded-xl border bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800">
                                {editingId ? "Edit Banner" : "New Banner"}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Banner title"
                            required
                            className="w-full rounded-lg border p-3"
                        />

                        <textarea
                            name="subtitle"
                            value={form.subtitle}
                            onChange={handleChange}
                            placeholder="Banner subtitle"
                            rows={2}
                            className="w-full rounded-lg border p-3"
                        />

                        <input
                            name="image"
                            type="url"
                            value={form.image}
                            onChange={handleChange}
                            placeholder="Banner image URL"
                            required
                            className="w-full rounded-lg border p-3"
                        />

                        {form.image && (
                            <img
                                src={form.image}
                                alt="Banner preview"
                                className="h-40 w-full rounded-lg object-cover"
                            />
                        )}

                        <input
                            name="link"
                            type="text"
                            value={form.link}
                            onChange={handleChange}
                            placeholder="Optional link, e.g. /products"
                            className="w-full rounded-lg border p-3"
                        />

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                            />
                            Active banner
                        </label>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Banner"}
                        </button>
                    </form>
                )}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <p className="text-slate-500">Loading banners...</p>
                    ) : banners.length === 0 ? (
                        <p className="text-slate-500">
                            No banners found. Add your first banner.
                        </p>
                    ) : (
                        banners.map(banner => (
                            <article
                                key={banner._id}
                                className="overflow-hidden rounded-xl border bg-white shadow-sm"
                            >
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="h-44 w-full bg-slate-100 object-cover"
                                />

                                <div className="space-y-3 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                {banner.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {banner.subtitle}
                                            </p>
                                        </div>

                                        <span className={`rounded-full px-2 py-1 text-xs ${
                                            banner.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {banner.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="flex justify-end gap-2 border-t pt-3">
                                        <button
                                            onClick={() => openEditForm(banner)}
                                            className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                                            title="Edit banner"
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                            title="Delete banner"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBanners;
