import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "/cover.webp";
import { useEffect, useState } from "react";
import { api, toApiURL } from "@/lib/api";

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
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load");
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
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-primary drop-shadow-md">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight font-display">
              Keni Sweet Flowers
            </h1>
            <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90">
              Cupcakes Floraux à Kénitra — commande 72h à l'avance. DM pour
              commander, ou appelez le{" "}
              <span className="font-semibold">0659444784</span>.
            </p>
            <div className="flex gap-3 md:gap-4 flex-wrap">
              <Link to="/products">
                <Button variant="accent" size="lg" className="gap-2">
                  Voir les Cupcakes
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="bg-primary-foreground/10 border-primary-foreground text-primary hover:bg-primary-foreground/30"
              >
                Informations & Commandes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  On orders over $50
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  100% secure transactions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <HeadphonesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Always here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nos Créations Florales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos compositions gourmandes et florales, réalisées sur
              commande pour vos moments spéciaux.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {products.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.title}
                    price={product.price}
                    image={toApiURL(product.images?.[0])}
                    category={product.category || ""}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link to="/products">
                  <Button variant="outline" size="lg" className="gap-2">
                    Voir toutes les créations
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            Prêt(e) à commander ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Commande 72h à l'avance. Contactez-nous en DM ou au
            <span className="font-semibold"> 0659444784</span>.
          </p>
          <Link to="/auth">
            <Button variant="accent" size="lg" className="gap-2">
              Créer un compte
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Index;
