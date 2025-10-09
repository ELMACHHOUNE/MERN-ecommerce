import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  stock?: number;
  category?: string;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get<Product[]>("/products");
        if (mounted) setProducts(data);
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Products
            </h1>
            <p className="text-lg opacity-90">
              Discover our collection of premium quality items
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {products.length}
              </span>{" "}
              products
            </p>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
