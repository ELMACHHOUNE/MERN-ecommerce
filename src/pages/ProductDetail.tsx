import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toApiURL } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { sanitizeUrl } from "@/lib/utils";

// Local URL allow-list check to make dataflow explicit for static analysis
function isSafeUrl(url: string): boolean {
  if (!url) return false;
  try {
    if (url.startsWith("/")) return true;
    if (/^data:image\//i.test(url)) return true;
    const u = new URL(url, window.location.origin);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  stock?: number;
  category?: string;
  rating?: number;
  reviews?: number;
  features?: string[];
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, ready } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`
        );
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        if (mounted) setProduct(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (mounted) setError(message || t("product.loadingError"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, t]);

  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  if (!ready)
    return (
      <div className="min-h-screen flex items-center justify-center text-blush-pop-900">
        {t("common.loading")}
      </div>
    );
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blush-pop-900">
        {t("common.loading")}
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-blush-pop-900">
        {t("product.notFound")}
      </div>
    );

  const imageUrls = (product.images || [])
    .map((u) => toApiURL(u))
    .filter((u) => isSafeUrl(u));
  const isWishlisted = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    try {
      addItem(
        {
          id: product._id,
          name: product.title,
          price: product.price,
          image: imageUrls[selectedImage],
        },
        quantity
      );
      toast({
        title: t("cart.addedTitle"),
        description: t("cart.addedDesc", { name: product.title }),
        className: "bg-white border-blush-pop-100 text-blush-pop-900",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message === "REQUIRE_AUTH") {
        toast({
          title: t("auth.errorTitle"),
          description: t("auth.loginRequired"),
          variant: "destructive",
        });
        navigate("/auth", { state: { from: `/product/${id}` } });
      } else {
        toast({
          title: t("common.error"),
          description: t("cart.addFailed"),
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product._id,
      name: product.title,
      price: product.price,
      image: imageUrls[0] || "",
      category: product.category,
      rating: product.rating,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-blush-pop-50/30 py-10">
      <main className="flex-1 container mx-auto px-4">
        <div className="bg-white rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-2xl rounded-bl-2xl border border-blush-pop-100 shadow-xl shadow-blush-pop-100/20 p-6 md:p-10 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Section */}
            <div className="space-y-6">
              <div className="aspect-square overflow-hidden rounded-tl-4xl rounded-br-4xl rounded-tr-lg rounded-bl-lg bg-blush-pop-50 relative shadow-inner">
                {imageUrls.length > 0 ? (
                  <img
                    src={(() => {
                      const s = (imageUrls[selectedImage] || "").trim();
                      return s &&
                        (s.startsWith("/") ||
                          /^https?:\/\//i.test(s) ||
                          /^data:image\//i.test(s))
                        ? s
                        : "/cover.webp";
                    })()}
                    alt={`${product.title} - image ${selectedImage + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-blush-pop-300">
                    {t("product.noImage")}
                  </div>
                )}
              </div>

              {imageUrls.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                  {imageUrls.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`h-20 w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-300 ${
                        i === selectedImage
                          ? "border-blush-pop-400 ring-2 ring-blush-pop-100 scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`Show image ${i + 1}`}
                    >
                      <img
                        src={
                          src &&
                          (src.startsWith("/") || /^https?:\/\//i.test(src))
                            ? src
                            : undefined
                        }
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full bg-blush-pop-50 text-blush-pop-600 text-xs font-bold uppercase tracking-widest">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-blush-pop-400 text-blush-pop-400" />
                    <span className="text-sm font-medium text-blush-pop-900">
                      {product.rating || 4.5}
                    </span>
                    <span className="text-xs text-blush-pop-600 ml-1">
                      ({product.reviews || 12} {t("product.reviews")})
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-blush-pop-950 leading-tight">
                  {product.title}
                </h1>

                <p className="text-4xl font-bold text-blush-pop-600 mb-6 font-display">
                  {product.price.toFixed(2)} DH
                </p>
              </div>

              <div className="mb-8 prose prose-blush-pop text-blush-pop-900/80">
                <h3 className="font-bold text-blush-pop-900 mb-2">
                  {t("product.description")}
                </h3>
                <p className="leading-relaxed">{product.description}</p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-blush-pop-900 mb-3">
                    {t("product.features")}
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-blush-pop-700"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blush-pop-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto space-y-6">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-blush-pop-900">
                    {t("product.quantity")}
                  </span>
                  <div className="flex items-center border border-blush-pop-200 rounded-full p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-blush-pop-50 text-blush-pop-700"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center font-medium text-blush-pop-900">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-blush-pop-50 text-blush-pop-700"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-blush-pop-100">
                  <Button
                    className="flex-1 h-14 rounded-full bg-blush-pop-900 hover:bg-blush-pop-800 text-white shadow-lg shadow-blush-pop-900/20 text-lg font-medium transition-all duration-300 hover:scale-[1.02]"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t("product.addToCart")}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-full border-blush-pop-200 text-blush-pop-900 hover:bg-blush-pop-50 hover:text-blush-pop-700 hover:border-blush-pop-300 transition-all duration-300"
                    onClick={handleToggleWishlist}
                  >
                    <Heart
                      className={`h-6 w-6 transition-colors ${
                        isWishlisted
                          ? "fill-blush-pop-500 text-blush-pop-500"
                          : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
