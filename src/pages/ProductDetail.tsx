import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, toApiURL } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/products/${id}`
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

  if (!ready) return <div>{t("common.loading")}</div>;
  if (loading) return <div>{t("common.loading")}</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>{t("product.notFound")}</div>;

  const imageUrls = (product.images || []).map((u) => toApiURL(u));

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[selectedImage]}
                  alt={`${product.title} - image ${selectedImage + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  {t("product.noImage")}
                </div>
              )}
            </div>
            {imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {imageUrls.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 rounded-md overflow-hidden border shrink-0 ${
                      i === selectedImage
                        ? "border-accent ring-2 ring-accent"
                        : "border-transparent"
                    }`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews || 0} {t("product.reviews")})
                </span>
              </div>

              <p className="text-3xl font-bold text-primary mb-6">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">{t("product.description")}</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">{t("product.features")}</h2>
              <ul className="space-y-2">
                {product.features?.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="text-accent mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-3">{t("product.quantity")}</h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="accent"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {t("product.addToCart")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? "fill-accent text-accent" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
