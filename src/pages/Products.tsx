import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import productShoes from "@/assets/product-shoes.jpg";
import productTshirt from "@/assets/product-tshirt.jpg";
import productBackpack from "@/assets/product-backpack.jpg";
import productWatch from "@/assets/product-watch.jpg";

const products = [
  { id: 1, name: "Athletic Running Shoes", price: 89.99, image: productShoes, category: "Footwear" },
  { id: 2, name: "Premium Cotton T-Shirt", price: 29.99, image: productTshirt, category: "Clothing" },
  { id: 3, name: "Modern Backpack", price: 59.99, image: productBackpack, category: "Accessories" },
  { id: 4, name: "Luxury Sport Watch", price: 199.99, image: productWatch, category: "Watches" },
  { id: 5, name: "Athletic Running Shoes Pro", price: 109.99, image: productShoes, category: "Footwear" },
  { id: 6, name: "Classic White Tee", price: 24.99, image: productTshirt, category: "Clothing" },
  { id: 7, name: "Travel Backpack", price: 79.99, image: productBackpack, category: "Accessories" },
  { id: 8, name: "Smart Sport Watch", price: 249.99, image: productWatch, category: "Watches" },
];

const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
            <p className="text-lg opacity-90">Discover our collection of premium quality items</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{products.length}</span> products
            </p>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
