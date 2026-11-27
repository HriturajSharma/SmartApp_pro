
import {
  Coffee,
  CookingPot,
  Flame,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

const getCategoryIcon = (name = "") => {
  const value = name.toLowerCase();

  if (value.includes("breakfast")) return Coffee;
  if (value.includes("heating")) return Flame;
  if (value.includes("accessories")) return Utensils;

  return CookingPot;
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Category fetch error:", error);
        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 text-center">
        <p>Loading categories...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="bg-[#f4f2ed] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">
            Explore our collection
          </p>

          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>

          <p className="mt-3 text-gray-600">
            Find the right appliances for every corner of your home.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-gray-500">
            No categories available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.name);

              return (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl sm:p-7"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition duration-300 group-hover:rotate-[-4deg] group-hover:bg-brand-500 group-hover:text-white">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {category.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {category.description || "Explore our products."}
                  </p>

                  <span className="mt-5 inline-block text-sm font-semibold text-orange-600">
                    Explore Products →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
