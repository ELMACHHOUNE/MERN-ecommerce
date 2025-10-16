import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryDTO } from "@/api/categories";

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
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
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
            <div className="text-gray-500">No categories found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: CategoryDTO) => (
                <div
                  key={cat.id}
                  className="border rounded-lg overflow-hidden bg-white hover:shadow transition"
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  <div className="p-3">
                    <h2 className="font-medium">{cat.name}</h2>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {cat.description || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
