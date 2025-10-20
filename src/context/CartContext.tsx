import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { API_BASE } from "@/api/products";
import { useAuth } from "./AuthContext";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
};

type AddItemInput = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: AddItemInput, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  checkoutViaWhatsApp: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "bb_cart";
const CART_ID_KEY = "bb_cart_id";
const WHATSAPP_NUMBER =
  (import.meta as any)?.env?.VITE_WHATSAPP_NUMBER || "+212649455082";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function getCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function setCartId(id: string) {
  try {
    localStorage.setItem(CART_ID_KEY, id);
  } catch {}
}

async function syncCartServer(items: CartItem[]) {
  try {
    const cartId = getCartId();
    const res = await fetch(`${API_BASE}/api/cart/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId,
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          image: it.image,
          qty: it.qty,
        })),
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.cartId && data.cartId !== cartId) setCartId(data.cartId);
  } catch {}
}

async function fetchCartServer(id: string): Promise<CartItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cart/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map((it: any) => ({
      id: String(it.id),
      name: String(it.name),
      price: Number(it.price),
      image: String(it.image || ""),
      qty: Number(it.qty || 1),
    }));
  } catch {
    return null;
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    saveCart(items);
  }, [items]);

  useEffect(() => {
    const id = getCartId();
    if (!id) return;
    if (items.length > 0) return;
    (async () => {
      const serverItems = await fetchCartServer(id);
      if (serverItems && serverItems.length > 0) {
        setItems(serverItems);
      }
    })();
  }, []);

  useEffect(() => {
    if (items.length > 0 && !getCartId()) {
      syncCartServer(items);
    }
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    if (!isAuthenticated) {
      throw new Error("REQUIRE_AUTH");
    }

    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      let next: CartItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      } else {
        next = [...prev, { ...item, qty }];
      }
      setTimeout(() => syncCartServer(next), 0);
      return next;
    });
  };

  const updateQty: CartContextValue["updateQty"] = (id, qty) => {
    setItems((prev) => {
      let next: CartItem[];
      if (qty <= 0) next = prev.filter((p) => p.id !== id);
      else next = prev.map((p) => (p.id === id ? { ...p, qty } : p));
      setTimeout(() => syncCartServer(next), 0);
      return next;
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setTimeout(() => syncCartServer(next), 0);
      return next;
    });
  };

  const clear = () => {
    setItems((prev) => {
      const next: CartItem[] = [];
      setTimeout(() => syncCartServer(next), 0);
      return next;
    });
  };

  const count = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  const checkoutViaWhatsApp = () => {
    const phone = String(WHATSAPP_NUMBER).replace(/[^\d]/g, "");
    const lines = [
      "Hello, I'd like to place an order:",
      ...items.map((it) => `• ${it.name} x${it.qty} - ${it.price.toFixed(2)}`),
      `Total: ${subtotal.toFixed(2)}`,
    ];
    const msg = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.open(url, "_blank");
  };

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    addItem,
    updateQty,
    removeItem,
    clear,
    checkoutViaWhatsApp,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
