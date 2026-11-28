import { Minus, Plus, Search, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import {
    addToCart as addProductToCart,
    removeCartItem,
    updateCartItem,
} from "../../services/cart.service";
import { getCategories } from "../../services/category.service";
import { getProducts } from "../../services/product.service";

const Products = () => {
  // URL category parameter
  const { cartItems, applyCartResponse, refreshCart } = useCart();
  const { checkAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "All";

  // States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(categoryFromUrl);
  const [minWattage, setMinWattage] = useState("");
  const [maxWattage, setMaxWattage] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [autoShutOff, setAutoShutOff] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const searchFromUrl = searchParams.get("search") || "";
  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  // Keep category state synchronized with URL changes
  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          search,
          minWattage,
          maxWattage,
          minCapacity,
          autoShutOff,
          sortBy,
        };

        if (category !== "All") {
          params.category = category;
        }

        const response = await getProducts(params);

        setProducts(response.products || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    search,
    category,
    minWattage,
    maxWattage,
    minCapacity,
    autoShutOff,
    sortBy,
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Handle category selection
  const handleCategoryChange = (value) => {
    setCategory(value);

    if (value === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    setMinWattage("");
    setMaxWattage("");
    setMinCapacity("");
    setAutoShutOff(false);
    setSortBy("popular");
    setSearchParams({});
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingProductId(product._id);
      setCartMessage("");
      const response = await addProductToCart(product._id, 1);

      applyCartResponse(response);
      setCartMessage(`${product.name} added to cart successfully!`);
      await refreshCart();
    } catch (error) {
      if (error.response?.status === 401) {
        await checkAuth();
        navigate("/login");
        return;
      }

      setCartMessage(
        error.response?.data?.message || "Unable to add product to cart."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const handleQuantity = async (productId, quantity) => {
    try {
      setAddingProductId(productId);
      setCartMessage("");

      const response =
        quantity < 1
          ? await removeCartItem(productId)
          : await updateCartItem(productId, quantity);

      applyCartResponse(response);
    } catch (error) {
      setCartMessage(
        error.response?.data?.message || "Unable to update cart quantity."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-7xl px-3 py-7 sm:px-6 sm:py-14 lg:px-8">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Our Collection
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Smart Kitchen Appliances
          </h1>

          <p className="mt-2 text-slate-500">
            Explore reliable appliances designed for everyday convenience.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10">
          <Search size={20} className="shrink-0 text-slate-400" />

          <input
            type="text"
            placeholder="Search appliances..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters */}
          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <SlidersHorizontal size={19} />
                </span>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Filters
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Refine your results
                  </p>
                </div>
              </div>

              {(category !== "All" ||
                minWattage ||
                maxWattage ||
                minCapacity ||
                autoShutOff) && (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Category */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Category
                </h3>

                <div className="space-y-1.5">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      category === "All"
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === "All"}
                      onChange={() => handleCategoryChange("All")}
                      className="h-4 w-4 accent-brand-500"
                    />
                    All Categories
                  </label>

                  {categories.map((item) => {
                    const selected =
                      category === item._id || category === item.slug;
                    return (
                      <label
                        key={item._id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                          selected
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selected}
                          onChange={() => handleCategoryChange(item._id)}
                          className="h-4 w-4 accent-brand-500"
                        />
                        {item.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Wattage */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Wattage{" "}
                  <span className="font-medium text-slate-400">(W)</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <label className="relative">
                    <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Min
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minWattage}
                      onChange={(e) => setMinWattage(e.target.value)}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pt-5 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                  </label>

                  <label className="relative">
                    <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Max
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Any"
                      value={maxWattage}
                      onChange={(e) => setMaxWattage(e.target.value)}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pt-5 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    />
                  </label>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Minimum Capacity
                </h3>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2 litres"
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>

              {/* Auto Shut Off */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3.5 py-3 transition hover:border-brand-200 hover:bg-brand-50/40">
                <span className="text-sm font-medium text-slate-700">
                  Auto shut-off available
                </span>
                <input
                  type="checkbox"
                  checked={autoShutOff}
                  onChange={(e) => setAutoShutOff(e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-500"
                />
              </label>

              {/* Clear Filters */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.98]"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Products Section */}
          <section className="lg:col-span-3">
            {/* Loading */}
            {loading && (
              <p className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-500">
                Loading products...
              </p>
            )}

            {/* Error */}
            {!loading && error && (
              <p className="rounded-2xl border border-red-100 bg-red-50 py-10 text-center text-red-600">
                {error}
              </p>
            )}

            {!loading && !error && (
              <>
                {/* Sorting */}
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm text-slate-600">
                    Showing <strong>{products.length}</strong> products
                  </p>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm"
                  >
                    <option value="popular">Sort: Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                {/* Product Grid */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => {
                      const cartItem = cartItems.find((item) =>
                        (item.product?._id || item.product)?.toString() === product._id
                      );
                      const cartQuantity = cartItem?.quantity || 0;

                      return (
                        <div
                          key={product._id}
                          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          {/* Product Image */}
                          <Link to={`/products/${product._id}`}>
                            <img
                              src={
                                product.images?.[0]?.url ||
                                "https://placehold.co/500x400?text=Appliance"
                              }
                              alt={product.name}
                              className="h-52 w-full bg-gradient-to-br from-slate-50 to-stone-100 object-contain p-5"
                            />
                          </Link>

                          <div className="p-3.5 sm:p-4">
                            {/* Category */}
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                              {product.category?.name || "Uncategorized"}
                            </p>

                            {/* Product Name */}
                            <Link to={`/products/${product._id}`}>
                              <h3 className="mt-2 font-bold text-slate-900 hover:text-brand-600">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Specifications */}
                            <div className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
                              <p>
                                Power: {product.specifications?.power ?? "N/A"}W
                              </p>

                              <p>
                                Capacity:{" "}
                                {product.specifications?.capacity ?? "N/A"}
                                {product.specifications?.capacityUnit || ""}
                              </p>

                              <p>
                                Auto Shut-off:{" "}
                                {product.specifications?.safetyFeatures?.some(
                                  (feature) =>
                                    /auto shut.?off/i.test(feature)
                                )
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>

                            {/* Price and Cart */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <span className="text-xl font-bold tracking-tight text-slate-900">
                                ₹{Number(product.price || 0).toLocaleString("en-IN")}
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Quantity Controls */}
                                {cartQuantity > 0 ? (
                                  <div className="flex items-center overflow-hidden rounded-xl border border-brand-500 bg-brand-50 shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantity(product._id, cartQuantity - 1)}
                                      disabled={addingProductId === product._id}
                                      className="flex h-10 w-10 items-center justify-center text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-bold text-brand-700">
                                      {cartQuantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuantity(product._id, cartQuantity + 1)}
                                      disabled={addingProductId === product._id || cartQuantity >= product.stock}
                                      className="flex h-10 w-10 items-center justify-center text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={addingProductId === product._id || product.stock <= 0}
                                    className="flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <ShoppingCart size={16} />
                                    {product.stock <= 0
                                      ? "Out of Stock"
                                      : addingProductId === product._id
                                      ? "Adding..."
                                      : "Add"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center">
                    <h3 className="text-lg font-bold tracking-tight">
                      No products found
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                )}
              </>
            )}
            {cartMessage && (
              <p className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
                {cartMessage}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Products;
