import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
}: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${id}`}>
        <div className="aspect-square overflow-hidden bg-secondary">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {category || "Uncategorized"}
            </p>
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
          <p className="text-lg font-bold text-primary">${price.toFixed(2)}</p>
          <Button size="sm" variant="accent" className="gap-1">
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
