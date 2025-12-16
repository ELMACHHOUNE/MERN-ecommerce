import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(id);
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
    <div className="group relative">
      {/* Card Container with Organic/Petal Shape */}
      <div className="relative bg-white p-2.5 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-2xl rounded-bl-2xl shadow-sm border border-blush-pop-100 transition-all duration-500 hover:shadow-xl hover:shadow-blush-pop-200/40 hover:-translate-y-1">
        {/* Image Area */}
        <div className="relative aspect-4/5 overflow-hidden rounded-tl-4xl rounded-br-4xl rounded-tr-lg rounded-bl-lg bg-blush-pop-50">
          <Link to={`/products/${id}`} className="block w-full h-full">
            <img
              src={imgError ? fallbackImage : image}
              alt={name}
              loading="lazy"
              decoding="async"
              width="400"
              height="500"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          </Link>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist({ id, name, price, image, category, rating });
            }}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-blush-pop-900 hover:bg-white hover:scale-110 transition-all duration-300 shadow-sm z-10 cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? "fill-blush-pop-500 text-blush-pop-500" : ""
              }`}
            />
          </button>

          {/* Add to Cart - Slides up with floral gradient background */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
            <div className="bg-white/90 backdrop-blur-md py-4 px-4 flex justify-center border-t border-blush-pop-100">
              <Button
                onClick={handleAddToCart}
                className="w-full rounded-full bg-blush-pop-900 text-white hover:bg-blush-pop-800 shadow-md h-10 font-medium cursor-pointer"
                aria-label={`Add ${name} to cart`}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t("cta.shop")}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-4 pb-2 px-2 text-center">
          <Link
            to={`/products/${id}`}
            className="block group-hover:text-blush-pop-700 transition-colors"
          >
            <h3 className="font-display text-lg font-bold text-blush-pop-950 line-clamp-1 mb-1">
              {name}
            </h3>
          </Link>

          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="font-bold text-blush-pop-600 text-base">
              {price.toFixed(2)} DH
            </span>
            {category && (
              <>
                <span className="w-1 h-1 rounded-full bg-blush-pop-300" />
                <span className="text-blush-pop-600 uppercase text-[10px] tracking-widest font-medium">
                  {category}
                </span>
              </>
            )}
          </div>

          {/* Rating Stars */}
          <div className="flex justify-center mt-2 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(rating)
                    ? "fill-blush-pop-300 text-blush-pop-300"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
