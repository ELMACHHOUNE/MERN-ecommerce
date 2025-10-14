export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
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
    console.warn(
      "[categories api] Falling back to window.location.origin:",
      base
    );
  }

  base = base.toString().trim().replace(/\/+$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

export const API_BASE = resolveApiBase();

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn(
    "[categories api] API_BASE unresolved. Ensure VITE_API_URL or REACT_APP_API_URL set and dev server restarted."
  );
} else {
  // eslint-disable-next-line no-console
  console.info("[categories api] Using API_BASE =", API_BASE);
}

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCategories(): Promise<CategoryDTO[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error("Failed to load categories");
  const data = await res.json();
  return data.map((c: any) => ({
    id: c._id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function createCategory(
  body: { name: string; description?: string },
  token?: string
): Promise<CategoryDTO> {
  const res = await fetch(`${API_BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Create failed");
  return {
    id: data._id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateCategory(
  id: string,
  body: { name?: string; description?: string },
  token?: string
): Promise<CategoryDTO> {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Update failed");
  return {
    id: data._id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function deleteCategory(id: string, token?: string) {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
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
