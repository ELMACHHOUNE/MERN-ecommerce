import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { api, toApiURL } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { PriceSortMenu } from "@/components/ui/price-sort";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t, ready } = useTranslation();
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
  const perPage = 16;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

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
        const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      } catch (e: Error | unknown) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to load products");
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

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageProducts = sortedProducts.slice(start, start + perPage);

  const goToPage = (p: number) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(Math.min(Math.max(1, p), totalPages)));
      return next;
    });

  if (!ready)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading translations...
      </div>
    );

  return (
    <>
      {/* Hero Header */}
      <div className="relative bg-primary/5 py-20 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cover.webp')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display text-primary drop-shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            {t("products.title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {t("products.subtitle")}
          </p>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full mt-8" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter & Sort Bar */}
        <div className="flex justify-center mb-10 relative z-40">
          <div className="inline-flex items-center gap-4 md:gap-8 bg-white/80 backdrop-blur-md border border-blush-pop-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-full px-6 py-3">
            {/* Product Counter */}
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blush-pop-100 text-blush-pop-700 font-bold text-sm">
                {sortedProducts.length}
              </span>
              <span className="text-sm font-medium text-blush-pop-900 hidden sm:inline-block">
                {t("products.label")}
              </span>
            </div>

            {/* Vertical Separator */}
            <div className="h-8 w-px bg-blush-pop-100" />

            {/* Sort Menu */}
            <div className="flex items-center">
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
          </div>
        </div>

        {(categoryFilter || categoryNameFilter || searchTerm || sort) && (
          <div className="mb-4 text-sm flex items-center gap-3 flex-wrap">
            {(categoryFilter || categoryNameFilter) && (
              <span className="text-muted-foreground">
                {t("products.filteredBy")}{" "}
                {categoryNameFilter
                  ? `"${categoryNameFilter}"`
                  : t("products.category")}
              </span>
            )}
            {searchTerm && (
              <span className="text-muted-foreground">
                {t("products.searchFor")} "{searchTerm}"
              </span>
            )}
            {sort && (
              <span className="text-muted-foreground">
                {t("products.sortedBy")}{" "}
                {sort === "price-asc"
                  ? t("products.sort.lowToHigh")
                  : t("products.sort.highToLow")}
              </span>
            )}
            <Button
              variant="outline"
              className="px-3 py-1 h-8 rounded-md border-border text-foreground hover:bg-muted/20"
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("category");
                  next.delete("categoryName");
                  next.delete("q");
                  next.delete("search");
                  next.delete("name"); // clear `name` too
                  next.delete("sort"); // clear sort as well
                  next.delete("page");
                  return next;
                })
              }
            >
              {t("products.clear")}
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-muted-foreground">{t("products.loading")}</div>
        )}
        {error && <div className="text-red-600">{error}</div>}

        {!loading &&
          !error &&
          (sortedProducts.length === 0 ? (
            <div className="text-muted-foreground">{t("products.empty")}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageProducts.map((product) => (
                <div
                  key={product._id}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.title || product.name || ""} // support both fields
                    price={product.price}
                    image={toApiURL(product.images?.[0])}
                    category={product.category || ""}
                  />
                </div>
              ))}
            </div>
          ))}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  className={`gap-1 pl-2.5 ${
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                  aria-label={t("products.pagination.prev")}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) goToPage(currentPage - 1);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{t("products.pagination.prev")}</span>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 py-1 text-sm text-muted-foreground">
                  {t("products.pagination.pageOf", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  className={`gap-1 pr-2.5 ${
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                  aria-label={t("products.pagination.next")}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) goToPage(currentPage + 1);
                  }}
                >
                  <span>{t("products.pagination.next")}</span>
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </>
  );
};

export default Products;
