
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {
    name: "",
    description: ""
};

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get("/categories");
            setCategories(response.data.categories || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load categories"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const openEditForm = (category) => {
        setEditingId(category._id);
        setForm({
            name: category.name || "",
            description: category.description || ""
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
                await api.put(`/categories/${editingId}`, form);
            } else {
                await api.post("/categories", form);
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);

            await fetchCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save category"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/categories/${id}`);
            await fetchCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete category"
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Manage Categories
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Create and organize appliance categories.
                        </p>
                    </div>

                    <button
                        onClick={openAddForm}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Add Category
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
                        className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800">
                                {editingId ? "Edit Category" : "New Category"}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-slate-500 hover:text-red-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Category name"
                                required
                                className="rounded-lg border p-3"
                            />

                            <input
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Category description"
                                className="rounded-lg border p-3"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Category"}
                        </button>
                    </form>
                )}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <p className="p-8 text-center text-slate-500">
                            Loading categories...
                        </p>
                    ) : categories.length === 0 ? (
                        <p className="p-8 text-center text-slate-500">
                            No categories found. Add your first category.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600">
                                    <tr>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4">Created</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {categories.map(category => (
                                        <tr key={category._id}>
                                            <td className="p-4 font-semibold text-slate-800">
                                                {category.name}
                                            </td>

                                            <td className="p-4 text-slate-500">
                                                {category.description || "—"}
                                            </td>

                                            <td className="p-4 text-slate-500">
                                                {new Date(
                                                    category.createdAt
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditForm(category)}
                                                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={17} />
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

export default ManageCategories;
