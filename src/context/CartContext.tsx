import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
  useRef,
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const { isAuthenticated, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user's cart when they log in
  useEffect(() => {
    const loadUserCart = async () => {
      if (!user?.id) {
        // User logged out - clear cart
        if (isInitialized) {
          setItems([]);
          saveCart([]);
          localStorage.removeItem(CART_ID_KEY);
        }
        setIsInitialized(true);
        return;
      }

      // User logged in - fetch their cart
      try {
        const res = await fetch(`${API_BASE}/api/cart/user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            const userItems = data.items.map((it: any) => ({
              id: String(it.id),
              name: String(it.name),
              price: Number(it.price),
              image: String(it.image || ""),
              qty: Number(it.qty || 1),
            }));
            setItems(userItems);
            saveCart(userItems);
            if (data.cartId) setCartId(data.cartId);
          }
        }
      } catch (e) {
        console.error("Failed to load user cart:", e);
      }

      setIsInitialized(true);
    };

    loadUserCart();
  }, [user?.id, isInitialized]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      saveCart(items);
    }
  }, [items, isInitialized]);

  const syncToServer = useCallback(
    async (itemsToSync: CartItem[]) => {
      if (!user?.id) {
        console.log("Skipping cart sync - no user logged in");
        return;
      }

      if (isSyncing) {
        console.log("Sync already in progress, skipping");
        return;
      }

      setIsSyncing(true);

      try {
        console.log("Syncing cart to server:", {
          userId: user.id,
          itemCount: itemsToSync.length,
        });

        const res = await fetch(`${API_BASE}/api/cart/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            items: itemsToSync.map((it) => ({
              id: it.id,
              name: it.name,
              price: it.price,
              image: it.image,
              qty: it.qty,
            })),
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Cart sync failed:", res.status, errorData);
          return;
        }

        const data = await res.json();
        console.log("Cart sync successful:", data);
        if (data?.cartId) setCartId(data.cartId);
      } catch (e) {
        console.error("Failed to sync cart:", e);
      } finally {
        setIsSyncing(false);
      }
    },
    [user?.id, isSyncing]
  );

  const debouncedSync = useCallback(
    (itemsToSync: CartItem[]) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncToServer(itemsToSync);
      }, 500);
    },
    [syncToServer]
  );

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
      debouncedSync(next);
      return next;
    });
  };

  const updateQty: CartContextValue["updateQty"] = (id, qty) => {
    setItems((prev) => {
      let next: CartItem[];
      if (qty <= 0) next = prev.filter((p) => p.id !== id);
      else next = prev.map((p) => (p.id === id ? { ...p, qty } : p));
      debouncedSync(next);
      return next;
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      debouncedSync(next);
      return next;
    });
  };

  const clear = () => {
    setItems([]);
    debouncedSync([]);
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
