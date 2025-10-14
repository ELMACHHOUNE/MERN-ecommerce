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
}

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
  };
}

export async function fetchProducts(): Promise<ProductDTO[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return data.map(mapProduct);
}

export async function createProduct(
  body: {
    title: string;
    price: number;
    description?: string;
    stock?: number;
    category?: string;
    images?: string[];
  },
  token?: string
): Promise<ProductDTO> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Create failed");
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  body: Partial<{
    title: string;
    price: number;
    description: string;
    stock: number;
    category: string;
    images: string[];
  }>,
  token?: string
): Promise<ProductDTO> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
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
