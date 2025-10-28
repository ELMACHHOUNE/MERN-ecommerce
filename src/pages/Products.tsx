import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { api, toApiURL } from "@/lib/api";
import { useSearchParams } from "react-router-dom";

type Product = {
  _id: string;
  title: string;
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
    ""
  ).trim();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // strip client-only params before hitting the API
        const serverParams = new URLSearchParams(searchParams);
        serverParams.delete("q");
        serverParams.delete("search");
        serverParams.delete("categoryName");
        const qs = serverParams.toString();
        const url = qs ? `/products?${qs}` : "/products";
        const data = await api.get<Product[]>(url);
        if (mounted) setProducts(data);
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter((p) => p.title?.toLowerCase().includes(q));
  }, [products, searchTerm]);

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
              {filteredProducts.length}
            </span>{" "}
            products
          </p>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {(categoryFilter || categoryNameFilter || searchTerm) && (
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
            <button
              className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("category");
                  next.delete("categoryName");
                  next.delete("q");
                  next.delete("search");
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
          (filteredProducts.length === 0 ? (
            <div className="text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.title}
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
