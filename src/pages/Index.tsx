import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "/cover.webp";
import { useEffect, useState } from "react";
import { api, toApiURL } from "@/lib/api";
import { useTranslation } from "react-i18next";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  stock?: number;
  category?: string;
};

const Index = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverSrc, setCoverSrc] = useState<string>("/cover.webp");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (mounted) setError(msg || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative  min-h-[60vh] md:min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={coverSrc}
            onError={() => setCoverSrc(heroBanner)}
            alt="flour cover"
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
            sizes="100vw"
          />
          {/* Subtle brand tint for text contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-background/60 via-background/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-primary drop-shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight font-display">
              {t("hero.title")}
            </h1>
            <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-3 md:gap-4 flex-wrap">
              <Link to="/products">
                <Button variant="accent" size="lg" className="gap-2">
                  {t("cta.shop")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="bg-primary-foreground/10 border-primary-foreground text-primary hover:bg-primary-foreground/30"
              >
                {t("cta.info")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  {t("features.freeShipping.desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300 delay-100">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {t("features.securePayment")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("features.securePayment.desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300 delay-200">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <HeadphonesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("features.support")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("features.support.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("section.featured")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("section.featured.desc")}
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">Loading products...</div>
          )}

          {error && (
            <div className="text-center py-12 text-destructive">
              Error: {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No products available
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              {/* Floral panel wrapper for featured grid */}
              <div className="rounded-2xl bg-card/95 border border-border ring-1 ring-border/60 shadow-lg shadow-primary/10 p-4 sm:p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map((product) => (
                    <div
                      key={product._id}
                      className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                    >
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        name={product.title}
                        price={product.price}
                        image={toApiURL(product.images?.[0])}
                        category={product.category || ""}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center animate-in fade-in slide-in-from-bottom-1 duration-300">
                <Link to="/products">
                  <Button variant="accent" size="lg" className="gap-2">
                    {t("button.viewAll")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display animate-in fade-in slide-in-from-bottom-2 duration-500">
            {t("ctaSection.title")}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {t("ctaSection.desc")}
          </p>
          <Link to="/auth">
            <Button
              variant="accent"
              size="lg"
              className="gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              {t("ctaSection.createAccount")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Index;
