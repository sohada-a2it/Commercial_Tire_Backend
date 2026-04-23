"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "@/lib/navigation";
import SearchSuggestion from "../Search/SearchSuggestion.jsx";
import dataService from "@/services/dataService";
import { CategoryCardSkeleton, ProductCardSkeleton } from "../shared/SkeletonLoader";
import ProductCard from "../Product/ProductCard";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1605650849871-14b8f5b9c8b5?auto=format&fit=crop&w=1200&q=80";
// (commercial tire / automotive workshop feel)

const ProductCatalog = ({ isHomePage = false }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const params = useParams();
  const categorySlug = params?.category;

  useEffect(() => {
    if (categorySlug) fetchCategoryAndProducts();
    else fetchCategories();
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await dataService.getCategories();
      setCategories(data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      const allCategories = await dataService.getCategories();

      const matchedCategory = allCategories.find(
        (c) => nameToSlug(c.name) === categorySlug
      );

      if (!matchedCategory) {
        setError("Category not found");
        return;
      }

      setCurrentCategory(matchedCategory);

      const result = await dataService.getProductsByCategoryId(matchedCategory.id);

      setProducts(result.products || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const nameToSlug = (name) =>
    String(name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const getImage = (img) => {
    if (!img) return DEFAULT_IMAGE;
    if (typeof img === "string") return img;
    if (typeof img === "object") {
      return img.url || img.secure_url || img.src || DEFAULT_IMAGE;
    }
    return DEFAULT_IMAGE;
  };

  const handleCategoryClick = (cat) => {
    navigate(`/products/c/${nameToSlug(cat.name)}/`);
  };

  const handleBack = () => navigate("/products");

  const handleProductClick = (p) => navigate(`/product/${p.id}`);

  /* ================= CATEGORY PAGE ================= */
  if (categorySlug && !loading && currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Back */}
          <button
            onClick={handleBack}
            className="mb-8 text-sm font-medium text-gray-600 hover:text-amber-500 transition"
          >
            ← Back to categories
          </button>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">
              {currentCategory.name}
            </h1>

            <p className="text-gray-500 mt-2 max-w-2xl">
              {currentCategory.description}
            </p>

            {/* AMBER BRAND LINE */}
            <div className="w-28 h-[3px] mt-4 rounded-full bg-amber-500 shadow-sm" />
          </div>

          {/* PRODUCTS */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={getImage(p.image)}
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 group-hover:text-amber-500 transition">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      View details →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🛞</div>
              <p className="text-gray-500">
                No products available in this tire category
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= CATEGORY GRID ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-gray-800">
            Product Categories
          </h1>
          <p className="text-gray-500 mt-2">
            Explore commercial tire & automotive collections
          </p>

          <div className="w-24 h-[3px] bg-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCategoryClick(c)}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* IMAGE */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={getImage(c.image)}
                  onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-500 transition">
                  {c.name}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Explore tire collection →
                </p>
              </div>

              {/* HOVER ACCENT */}
              <div className="h-[3px] w-0 group-hover:w-full bg-amber-500 transition-all duration-300" />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;