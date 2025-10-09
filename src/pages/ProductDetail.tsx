import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import productShoes from "@/assets/product-shoes.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = {
    name: "Athletic Running Shoes",
    price: 89.99,
    image: productShoes,
    category: "Footwear",
    rating: 4.5,
    reviews: 128,
    description: "Experience ultimate comfort and performance with our premium athletic running shoes. Designed for both casual runners and serious athletes, these shoes feature advanced cushioning technology and breathable materials.",
    features: [
      "Advanced cushioning technology",
      "Breathable mesh upper",
      "Durable rubber outsole",
      "Lightweight design",
      "Available in multiple colors"
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold text-primary mb-6">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-accent mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="font-semibold mb-3">Quantity</h2>
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
              <Button variant="accent" size="lg" className="flex-1 gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
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

      <Footer />
    </div>
  );
};

export default ProductDetail;
