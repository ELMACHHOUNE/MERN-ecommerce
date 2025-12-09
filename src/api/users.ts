export interface UserDTO {
  id: string;
  email: string;
  fullName?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

function resolveApiBase(): string {
  const env: any = (import.meta as any)?.env || {};
  let base =
    env.VITE_API_URL ||
    env.VITE_API_BASE_URL ||
    env.REACT_APP_API_BASE_URL ||
    "";

  if (!base && typeof window !== "undefined") {
    base = window.location.origin;
  }

  base = base.toString().trim().replace(/\/+$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

export const API_BASE = resolveApiBase();

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUsers(token?: string): Promise<UserDTO[]> {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to load users");
  const data = await res.json();
  return data.map((u: any) => ({
    id: u._id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
}

export async function createUser(
  body: { email: string; fullName?: string; role?: "user" | "admin"; password?: string },
  token?: string
): Promise<UserDTO> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Create failed");
  return {
    id: data._id,
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateUser(
  id: string,
  body: Partial<{ email: string; fullName: string; role: "user" | "admin"; password: string }>,
  token?: string
): Promise<UserDTO> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Update failed");
  return {
    id: data._id,
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function deleteUser(id: string, token?: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
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
