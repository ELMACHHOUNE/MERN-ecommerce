import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryDTO } from "@/api/categories";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

export default function Categories() {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-pink-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-pink-950 mb-4">
            {t("categories.title", "Our Categories")}
          </h1>
          <p className="text-lg text-pink-900/60 max-w-2xl mx-auto">
            {t(
              "categories.subtitle",
              "Explore our delightful collection of floral cupcakes and sweet treats."
            )}
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-pink-100 shadow-sm h-96 animate-pulse"
              >
                <div className="w-full h-56 bg-pink-100/50 rounded-2xl mb-4" />
                <div className="h-8 bg-pink-100/50 rounded-lg w-2/3 mb-3" />
                <div className="h-4 bg-pink-100/50 rounded-lg w-full mb-2" />
                <div className="h-4 bg-pink-100/50 rounded-lg w-4/5" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-600 font-medium">
              {t("categories.error", "Failed to load categories")}
            </p>
            <p className="text-red-400 text-sm mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {categories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-pink-100 shadow-sm">
                <p className="text-pink-900/60 text-lg">
                  {t("categories.empty", "No categories found.")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat: CategoryDTO, index) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${encodeURIComponent(
                      cat.id
                    )}&categoryName=${encodeURIComponent(cat.name)}`}
                    className="group block bg-white rounded-3xl p-3 border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl mb-4 bg-pink-50">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-pink-300">
                          <span className="text-sm font-medium">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-pink-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="px-2 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-display font-bold text-pink-950 group-hover:text-pink-700 transition-colors">
                          {cat.name}
                        </h2>
                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                      <p className="text-pink-900/60 text-sm line-clamp-2 leading-relaxed">
                        {cat.description ||
                          t(
                            "categories.noDesc",
                            "Discover our delicious creations in this category."
                          )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
