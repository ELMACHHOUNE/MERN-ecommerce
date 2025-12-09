import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  rating = 4.5,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fallbackImage =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      addItem({ id, name, price, image });
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message === "REQUIRE_AUTH") {
        toast({
          title: "Login required",
          description: "Please login to add items to cart.",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: `/products/${id}` } });
      }
    }
  };

  return (
    <Card className="group overflow-hidden border border-border bg-card/95 hover:bg-card shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg ring-1 ring-border hover:ring-primary/30">
      <Link to={`/products/${id}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          {/* Use CSS mask to avoid SVG <image> CORS issues and ensure visibility */}
          <img
            src={imgError ? fallbackImage : image}
            alt={name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{
              WebkitMaskImage:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="black"><circle cx="50" cy="50" r="35"/><circle cx="50" cy="18" r="22"/><circle cx="80" cy="28" r="22"/><circle cx="88" cy="58" r="22"/><circle cx="72" cy="86" r="22"/><circle cx="28" cy="86" r="22"/><circle cx="12" cy="58" r="22"/><circle cx="20" cy="28" r="22"/></g></svg>\')',
              maskImage:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="black"><circle cx="50" cy="50" r="35"/><circle cx="50" cy="18" r="22"/><circle cx="80" cy="28" r="22"/><circle cx="88" cy="58" r="22"/><circle cx="72" cy="86" r="22"/><circle cx="28" cy="86" r="22"/><circle cx="12" cy="58" r="22"/><circle cx="20" cy="28" r="22"/></g></svg>\')',
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
          {/* subtle floral overlay */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/10 via-transparent to-transparent opacity-50" />
          {/* decorative ring on hover */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-border/50 group-hover:ring-primary/40 transition-all" />
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-almond-silk-100 text-foreground/70 border border-almond-silk-200 text-xs uppercase tracking-wide">
                {category || t("products.category")}
              </span>
            </div>
            <Link to={`/products/${id}`}>
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                {name}
              </h3>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted
                  ? "fill-accent text-accent"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-primary">
              ${price.toFixed(2)}
            </p>
            <div className="hidden sm:flex items-center gap-0.5 text-vanilla-custard-700">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(rating)
                      ? "fill-vanilla-custard-400 text-vanilla-custard-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
          <Button
            size="sm"
            variant="accent"
            className="gap-1"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {t("cta.shop")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
