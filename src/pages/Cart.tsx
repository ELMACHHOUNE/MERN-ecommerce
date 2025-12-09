import { memo, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
// Using tailwindcss-animate for lightweight motion

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

const CartItemRow = memo(function CartItemRow({
  it,
  decrease,
  increase,
  remove,
  t,
}: {
  it: CartItem;
  decrease: (id: string) => void;
  increase: (id: string) => void;
  remove: (id: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="cart-item animate-in fade-in slide-in-from-bottom-1 duration-300 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl bg-card/95 border border-border ring-1 ring-border/60 p-3 sm:p-4 shadow-sm">
      {it.image && (
        <img
          src={it.image}
          alt={it.name}
          className="h-20 w-20 sm:h-16 sm:w-16 object-cover rounded-xl"
        />
      )}
      <div className="flex-1">
        <div className="font-medium text-foreground line-clamp-2">
          {it.name}
        </div>
        <div className="text-sm text-muted-foreground">
          ${it.price.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button
          aria-label={t("cart.decreaseQty")}
          variant="outline"
          size="icon"
          onClick={() => decrease(it.id)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium">{it.qty}</span>
        <Button
          aria-label={t("cart.increaseQty")}
          variant="outline"
          size="icon"
          onClick={() => increase(it.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        aria-label={t("cart.remove")}
        variant="ghost"
        onClick={() => remove(it.id)}
        className="text-destructive hover:text-destructive sm:ml-auto"
      >
        <Trash2 className="h-4 w-4 mr-2" /> {t("cart.remove")}
      </Button>
    </div>
  );
});

const Cart = () => {
  const { items, subtotal, updateQty, removeItem, clear, checkoutViaWhatsApp } =
    useCart();
  const { t, ready } = useTranslation();

  const decrease = useCallback(
    (id: string) => {
      const item = items.find((x) => x.id === id);
      if (!item) return;
      updateQty(id, Math.max(1, item.qty - 1));
    },
    [items, updateQty]
  );

  const increase = useCallback(
    (id: string) => {
      const item = items.find((x) => x.id === id);
      if (!item) return;
      updateQty(id, item.qty + 1);
    },
    [items, updateQty]
  );

  const remove = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  // Motion handled via CSS utility classes for performance and simplicity

  if (!ready) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="rounded-2xl bg-card/95 border border-border ring-1 ring-border/60 shadow-md shadow-primary/10 p-6 md:p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h1 className="text-2xl font-bold mb-2">{t("cart.title")}</h1>
          <p className="text-muted-foreground">{t("cart.empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-primary">
        {t("cart.title")}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((it) => (
            <CartItemRow
              key={it.id}
              it={it as CartItem}
              decrease={decrease}
              increase={increase}
              remove={remove}
              t={t}
            />
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
            >
              {t("cart.clear")}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-card/95 border border-border ring-1 ring-border/60 p-4 sm:p-5 h-fit shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="font-medium text-foreground">
              {t("cart.subtotal")}
            </span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <Button className="w-full" onClick={checkoutViaWhatsApp}>
            {t("cart.payWhatsapp")}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            {t("cart.redirectNote")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
