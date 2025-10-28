export interface ProductDTO {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  stock?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
  name?: string; // allow backend results that use `name`
}
export type CategoryOption = { label: string; value: string };

function resolveApiBase(): string {
  const env: any = (import.meta as any)?.env || {};
  let base =
    env.VITE_API_URL ||
    env.VITE_API_BASE_URL ||
    env.REACT_APP_API_URL ||
    env.REACT_APP_API_BASE_URL ||
    "";

  if (!base && typeof window !== "undefined") {
    base = window.location.origin;
    // eslint-disable-next-line no-console
    console.warn("[products api] Falling back to window.location.origin:", base);
  }

  base = base.toString().trim().replace(/\/+$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

export const API_BASE = resolveApiBase();

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn(
    "[products api] API_BASE unresolved. Ensure VITE_API_URL or REACT_APP_API_URL set and dev server restarted."
  );
} else {
  // eslint-disable-next-line no-console
  console.info("[products api] Using API_BASE =", API_BASE);
}

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const isFormData = (v: any): v is FormData =>
  typeof FormData !== "undefined" && v instanceof FormData;

function mapProduct(p: any): ProductDTO {
  return {
    id: p._id,
    title: p.title,
    description: p.description,
    price: p.price,
    images: p.images,
    stock: p.stock,
    category: p.category,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    name: p.name,
  };
}

export async function fetchProducts(): Promise<ProductDTO[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return data.map(mapProduct);
}

export async function fetchProductCategories(): Promise<CategoryOption[]> {
  const tryEndpoints = [
    `${API_BASE}/api/categories`,
  ];

  let data: any[] = [];
  for (const url of tryEndpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const arr = Array.isArray(json) ? json : [];
      // prefer the first non-empty response, else try next
      if (arr.length > 0 || url.endsWith("/api/categories")) {
        data = arr;
        break;
      }
    } catch {
      // try next endpoint
    }
  }

  const seen = new Set<string>();
  const out: CategoryOption[] = [];

  for (const c of data) {
    let label = "";
    let value = "";
    if (typeof c === "string") {
      label = c;
      value = c;
    } else if (c && typeof c === "object") {
      const rawValue = c.slug ?? c.id ?? c._id ?? c.name ?? c.title ?? "";
      const rawLabel = c.name ?? c.title ?? c.label ?? c.slug ?? rawValue;
      value = String(rawValue ?? "").trim();
      label = String(rawLabel ?? value).trim();
    } else {
      continue;
    }
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, value });
  }

  return out;
}

// NEW: top-N suggestions by title with server-first, client-fallback
import { api } from "@/lib/api";

export async function searchProductsSuggestions(q: string, limit = 5): Promise<ProductDTO[]> {
  const query = (q || "").trim();
  if (!query) return [];

  const params = new URLSearchParams({
    q: query,
    search: query,
    name: query,
    limit: String(limit),
    _ts: String(Date.now()), // cache-busting
  });

  const tryGet = async (url: string) => {
    try {
      const data = await api.get<any[]>(url);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const normalize = (p: any): ProductDTO => ({
    id: p.id ?? p._id ?? p.slug ?? String(p.name ?? p.title ?? Math.random()),
    title: p.title ?? p.name ?? "",
    description: p.description,
    price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
    images: p.images,
    stock: p.stock,
    category: p.category,
    createdAt: p.createdAt ?? "",
    updatedAt: p.updatedAt ?? "",
    name: p.name,
  });

  const lc = query.toLowerCase();
  const matches = (t: string) => t.toLowerCase().includes(lc);
  const score = (t: string) => {
    const lt = t.toLowerCase();
    if (lt.startsWith(lc)) return 0;
    const idx = lt.indexOf(lc);
    return idx >= 0 ? idx + 1 : Number.POSITIVE_INFINITY;
  };

  // Single endpoint to avoid hitting /products/:id
  const raw = await tryGet(`/products?${params.toString()}`);
  if (!raw.length) return [];

  const norm = raw.map(normalize);
  const filtered = norm.filter(p => matches(p.title || p.name || ""));
  filtered.sort((a, b) => score(a.title || a.name || "") - score(b.title || b.name || ""));
  return filtered.slice(0, limit);
}

export async function createProduct(
  body:
    | {
        title: string;
        price: number;
        description?: string;
        stock?: number;
        category?: string;
        images?: string[];
      }
    | FormData,
  token?: string
): Promise<ProductDTO> {
  const isFD = isFormData(body);
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: isFD ? { ...authHeaders(token) } : { "Content-Type": "application/json", ...authHeaders(token) },
    body: isFD ? (body as FormData) : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Create failed");
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  body:
    | Partial<{
        title: string;
        price: number;
        description: string;
        stock: number;
        category: string;
        images: string[];
      }>
    | FormData,
  token?: string
): Promise<ProductDTO> {
  const isFD = isFormData(body);
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: isFD ? { ...authHeaders(token) } : { "Content-Type": "application/json", ...authHeaders(token) },
    body: isFD ? (body as FormData) : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Update failed");
  return mapProduct(data);
}

export async function deleteProduct(id: string, token?: string) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    let msg = "Delete failed";
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}
