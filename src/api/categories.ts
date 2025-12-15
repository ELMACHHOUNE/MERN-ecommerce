export type CategoryDTO = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = import.meta.env.VITE_API_URL;
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toClient(cat: any): CategoryDTO {
  const id = cat._id || cat.id;
  const rawImage = cat.imageUrl || "";
  const imageUrl =
    rawImage && !/^https?:\/\//i.test(rawImage) && !/^data:/i.test(rawImage)
      ? `${API_ORIGIN}${rawImage}`
      : rawImage || "";
  return { id, name: cat.name, description: cat.description, slug: cat.slug, imageUrl, createdAt: cat.createdAt, updatedAt: cat.updatedAt };
}

export async function fetchCategories(): Promise<CategoryDTO[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(toClient);
}

export async function createCategory(
  payload: FormData | { name: string; description?: string; image?: File },
  token?: string
): Promise<CategoryDTO> {
  const body =
    payload instanceof FormData
      ? payload
      : (() => {
          const fd = new FormData();
          fd.append("name", payload.name);
          if (payload.description) fd.append("description", payload.description);
          if ((payload as any).image) fd.append("image", (payload as any).image);
          return fd;
        })();

  const res = await fetch(`${API_BASE}/api/categories`, {
    method: "POST",
    headers: { ...authHeaders(token) },
    body, // let browser set multipart boundaries
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Create failed");
  const data = await res.json();
  return toClient(data);
}

export async function updateCategory(
  id: string,
  payload: FormData | { name?: string; description?: string; image?: File },
  token?: string
): Promise<CategoryDTO> {
  const body =
    payload instanceof FormData
      ? payload
      : (() => {
          const fd = new FormData();
          if (payload.name != null) fd.append("name", payload.name);
          if (payload.description != null) fd.append("description", payload.description);
          if ((payload as any).image) fd.append("image", (payload as any).image);
          return fd;
        })();

  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token) },
    body,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Update failed");
  const data = await res.json();
  return toClient(data);
}

export async function deleteCategory(id: string, token?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Delete failed");
}
