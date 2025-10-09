import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

type CartItem = {
  productId: string;
  quantity: number /* ...existing fields... */;
};

const Cart = () => {
  const cartItems = [];
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const placeOrder = async () => {
    setError(null);
    setSuccess(null);
    if (!user) {
      setError("Please login first");
      return;
    }
    try {
      setPlacing(true);
      // Build items list expected by backend: [{ productId, quantity }]
      const items = /* map your cart state to */ [] as CartItem[]; // ...existing code to build items...
      const order = await api.post("/orders", { items });
      setSuccess(`Order placed: ${order._id || order.id}`);
      // ...existing code to clear cart...
    } catch (e: any) {
      setError(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products">
              <Button variant="accent" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Cart items will be mapped here */}
          </div>

          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">$0.00</span>
                </div>
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}

              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? "Placing Order..." : "Proceed to Checkout"}
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
