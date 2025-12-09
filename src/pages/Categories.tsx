import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryDTO } from "@/api/categories";
import { Link } from "react-router-dom";

export default function Categories() {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
        Categories
      </h1>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              <div className="h-40 bg-muted/40" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted/40 rounded w-2/3" />
                <div className="h-3 bg-muted/40 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-red-600">
          Failed to load categories
          {(error as any)?.message ? `: ${(error as any).message}` : ""}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {categories.length === 0 ? (
            <div className="text-muted-foreground">No categories found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: CategoryDTO) => (
                <Link
                  key={(cat as any).id ?? (cat as any)._id}
                  to={`/products?category=${encodeURIComponent(
                    String((cat as any).id ?? (cat as any)._id ?? "")
                  )}&categoryName=${encodeURIComponent(cat.name)}`}
                  className="border rounded-lg overflow-hidden bg-card hover:shadow transition block animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                  <div className="p-3">
                    <h2 className="font-medium">{cat.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {cat.description || "—"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
