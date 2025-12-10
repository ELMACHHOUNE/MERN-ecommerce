import { memo, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="group relative overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-md rounded-bl-md bg-white/80 backdrop-blur-sm border border-pink-100 p-4 shadow-sm transition-all hover:shadow-md hover:border-pink-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Image with petal shape */}
        <div className="relative shrink-0">
          {it.image ? (
            <div className="h-24 w-24 overflow-hidden rounded-tl-[1.2rem] rounded-br-[1.2rem] rounded-tr-md rounded-bl-md shadow-sm">
              <img
                src={it.image}
                alt={it.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="h-24 w-24 bg-pink-50 rounded-tl-[1.2rem] rounded-br-[1.2rem] rounded-tr-md rounded-bl-md flex items-center justify-center text-pink-200">
              <ShoppingBag className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-serif text-lg font-medium text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {it.name}
          </h3>
          <p className="text-pink-600 font-medium">{it.price.toFixed(2)} DH</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
          <div className="flex items-center bg-pink-50/50 rounded-full border border-pink-100 p-1">
            <Button
              aria-label={t("cart.decreaseQty")}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white hover:text-pink-600 text-gray-500"
              onClick={() => decrease(it.id)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium text-sm tabular-nums">
              {it.qty}
            </span>
            <Button
              aria-label={t("cart.increaseQty")}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white hover:text-pink-600 text-gray-500"
              onClick={() => increase(it.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            aria-label={t("cart.remove")}
            variant="ghost"
            size="icon"
            onClick={() => remove(it.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
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

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-pink-100 rounded-full"></div>
          <p className="text-muted-foreground font-medium">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="relative mx-auto w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-pink-300" />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-pink-100">
              <span className="text-xl">🌸</span>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            {t("cart.empty")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("cart.emptyDescription") ||
              "Looks like you haven't added any floral arrangements yet."}
          </p>
          <Button
            asChild
            className="rounded-full bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all"
          >
            <Link to="/products">
              {t("cart.startShopping") || "Browse Collection"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2">
              {t("cart.title")}
            </h1>
            <p className="text-muted-foreground">
              {items.length}{" "}
              {items.length === 1 ? t("cart.item") : t("cart.items")}{" "}
              {t("cart.inYourCart")}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={clear}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 hidden sm:flex"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("cart.clear")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
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

            <div className="sm:hidden pt-4 flex justify-center">
              <Button
                variant="ghost"
                onClick={clear}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("cart.clear")}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-xl rounded-bl-xl bg-white border border-pink-100 shadow-xl shadow-pink-100/50 p-6 sm:p-8 overflow-hidden relative">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-50 to-transparent rounded-bl-full -z-10 opacity-50" />

              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
                {t("cart.summary")}
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-medium text-gray-900">
                    {subtotal.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("cart.shipping")}</span>
                  <span className="text-green-600 font-medium">
                    {t("cart.free")}
                  </span>
                </div>
                <div className="h-px bg-pink-100 my-4" />
                <div className="flex justify-between items-end">
                  <span className="font-medium text-lg text-gray-900">
                    {t("cart.total")}
                  </span>
                  <span className="font-serif text-2xl font-bold text-pink-600">
                    {subtotal.toFixed(2)}{" "}
                    <span className="text-lg text-pink-400">DH</span>
                  </span>
                </div>
              </div>

              <Button
                onClick={checkoutViaWhatsApp}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-6 text-lg shadow-lg shadow-green-200 hover:shadow-green-300 transition-all group"
              >
                <span>{t("cart.checkoutWhatsApp")}</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                {t("cart.secureCheckout")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
