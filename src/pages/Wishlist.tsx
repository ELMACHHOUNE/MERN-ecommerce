import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { items } = useWishlist();
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-blush-pop-50 flex items-center justify-center">
            <Heart className="h-10 w-10 text-blush-pop-300" />
          </div>
          <h1 className="text-2xl font-bold text-blush-pop-900">
            {t("wishlist.emptyTitle") || "Your wishlist is empty"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("wishlist.emptySubtitle") ||
              "Explore our collection and find something you love!"}
          </p>
          <Button
            asChild
            className="mt-4 bg-blush-pop-900 hover:bg-blush-pop-800 rounded-full px-8"
          >
            <Link to="/products">{t("cta.shop") || "Start Shopping"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-blush-pop-500 fill-blush-pop-500" />
        <h1 className="text-3xl font-bold text-blush-pop-900 font-display">
          {t("wishlist.title") || "My Wishlist"}
        </h1>
        <span className="ml-auto text-sm text-muted-foreground bg-blush-pop-50 px-3 py-1 rounded-full">
          {items.length} {t("products.label") || "Items"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <ProductCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
