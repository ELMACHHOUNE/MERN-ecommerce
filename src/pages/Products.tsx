import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { api, toApiURL } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { PriceSortMenu } from "@/components/ui/price-sort";

type Product = {
  _id: string;
  title: string;
  name?: string; // allow products that use `name` instead of `title`
  description?: string;
  price: number;
  images?: string[];
  stock?: number;
  category?: string;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const categoryNameFilter = searchParams.get("categoryName");
  const searchTerm = (
    searchParams.get("q") ||
    searchParams.get("search") ||
    searchParams.get("name") || // accept `name` as a search key
    ""
  ).trim();
  const sort =
    (searchParams.get("sort") as "price-asc" | "price-desc" | null) || null;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (categoryFilter) params.set("category", categoryFilter);
        if (categoryNameFilter) params.set("categoryName", categoryNameFilter);
        const qs = params.toString();
        const url = qs ? `/api/products?${qs}` : "/api/products";
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${url}`
        );
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [categoryFilter, categoryNameFilter]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter((p) => {
      const t = p.title?.toLowerCase();
      const n = p.name?.toLowerCase();
      return (t && t.includes(q)) || (n && n.includes(q));
    });
  }, [products, searchTerm]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [filteredProducts, sort]);

  return (
    <>
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-lg opacity-90">
            Discover our collection of premium quality items
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {sortedProducts.length}
            </span>{" "}
            products
          </p>
          <PriceSortMenu
            sort={sort}
            onChange={(value) =>
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("sort", value);
                return next;
              })
            }
          />
        </div>

        {(categoryFilter || categoryNameFilter || searchTerm || sort) && (
          <div className="mb-4 text-sm flex items-center gap-3 flex-wrap">
            {(categoryFilter || categoryNameFilter) && (
              <span className="text-gray-600">
                Filtered by{" "}
                {categoryNameFilter ? `"${categoryNameFilter}"` : "category"}
              </span>
            )}
            {searchTerm && (
              <span className="text-gray-600">Search for "{searchTerm}"</span>
            )}
            {sort && (
              <span className="text-gray-600">
                Sorted by{" "}
                {sort === "price-asc"
                  ? "price (Low to High)"
                  : "price (High to Low)"}
              </span>
            )}
            <button
              className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("category");
                  next.delete("categoryName");
                  next.delete("q");
                  next.delete("search");
                  next.delete("name"); // clear `name` too
                  next.delete("sort"); // clear sort as well
                  return next;
                })
              }
            >
              Clear
            </button>
          </div>
        )}

        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading &&
          !error &&
          (sortedProducts.length === 0 ? (
            <div className="text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.title || product.name || ""} // support both fields
                  price={product.price}
                  image={toApiURL(product.images?.[0])}
                  category={product.category || ""}
                />
              ))}
            </div>
          ))}
      </div>
    </>
  );
};

export default Products;
