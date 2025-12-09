import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

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
    } catch (error: any) {
      if (error.message === "REQUIRE_AUTH") {
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
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={imgError ? fallbackImage : image}
            alt={name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* subtle floral overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-50" />
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-almond-silk-100 text-foreground/70 border border-almond-silk-200 text-xs uppercase tracking-wide">
                {category || "Uncategorized"}
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
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
