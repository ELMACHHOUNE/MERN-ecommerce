import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, subtotal, updateQty, removeItem, clear, checkoutViaWhatsApp } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-4 border rounded p-3"
            >
              {it.image && (
                <img
                  src={it.image}
                  alt={it.name}
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-muted-foreground">
                  {it.price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQty(it.id, it.qty - 1)}
                >
                  -
                </Button>
                <span className="w-8 text-center">{it.qty}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQty(it.id, it.qty + 1)}
                >
                  +
                </Button>
              </div>
              <Button variant="ghost" onClick={() => removeItem(it.id)}>
                Remove
              </Button>
            </div>
          ))}
          <Button variant="ghost" onClick={clear}>
            Clear cart
          </Button>
        </div>

        <div className="border rounded p-4 h-fit">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">{subtotal.toFixed(2)}</span>
          </div>
          <Button className="w-full" onClick={checkoutViaWhatsApp}>
            Pay via WhatsApp
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You will be redirected to WhatsApp to complete the order and
            payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
