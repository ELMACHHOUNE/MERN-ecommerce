import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// If your AuthContext exposes a hook, prefer it; else fallback to localStorage.
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; // add

const Profile = () => {
  const auth =
    (typeof useAuth === "function" ? (useAuth as any)() : null) || {};
  const token: string | null = auth?.token ?? localStorage.getItem("token");
  const setUser = auth?.setUser ?? (() => {});
  const currentUser = auth?.user; // add
  const queryClient = useQueryClient();

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // init from AuthContext so UI is ready instantly
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || ""); // change
  const [email, setEmail] = useState<string>(currentUser?.email || ""); // change
  const [password, setPassword] = useState("");
  const [dirty, setDirty] = useState(false); // add

  // Background fetch (no blocking UI)
  const { data, error, isFetching } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { headers: { ...authHeader } });
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!token,
    // keepPreviousData: true, // optional
  });

  // Sync form when auth.user changes (only if user hasn't edited and no server data yet)
  useEffect(() => {
    if (!dirty && currentUser && !data) {
      setFullName(currentUser.fullName || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser, data, dirty]);

  // Sync form when server data arrives (overwrite unless user already edited)
  useEffect(() => {
    if (data && !dirty) {
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setPassword("");
    }
  }, [data, dirty]);

  const mutation = useMutation({
    mutationFn: async (payload: {
      fullName: string;
      email: string;
      password?: string;
    }) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
      try {
        setUser?.(updated);
        // keep client in sync across reloads if your AuthContext reads from localStorage
        localStorage.setItem("user", JSON.stringify(updated));
      } catch {}
      setDirty(false); // reset
      toast.success("Profile updated"); // add
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to update profile"); // add
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in."); // change
      return;
    }
    const payload: any = { fullName: fullName?.trim(), email: email?.trim() };
    if (password?.trim()) payload.password = password.trim();
    mutation.mutate(payload);
  };

  // Always render the form; show lightweight status info
  return (
    <div className="container mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
      {isFetching && (
        <div className="text-xs text-muted-foreground mb-2">
          Refreshing profile…
        </div>
      )}
      {error && (
        <div className="text-xs text-red-600 mb-2">
          Couldn't refresh latest profile. You can still edit and save.
        </div>
      )}
      {!token && (
        <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-2 rounded mb-3">
          You are not logged in. Editing is disabled.
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setDirty(true); // add
              setFullName(e.target.value);
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="Full name"
            required
            disabled={!token || mutation.isPending}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setDirty(true); // add
              setEmail(e.target.value);
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            required
            disabled={!token || mutation.isPending}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            Password (leave blank to keep current)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setDirty(true); // add
              setPassword(e.target.value);
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="New password"
            disabled={!token || mutation.isPending}
          />
        </div>
        <button
          type="submit"
          disabled={!token || mutation.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
