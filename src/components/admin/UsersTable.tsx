import React, { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserDTO,
} from "@/api/users";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface User extends UserDTO {}

const roleSet = new Set(["user", "admin"]);

const UsersTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = (useAuth && useAuth()) || { token: undefined };

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", !!token],
    queryFn: () => fetchUsers(token),
  });

  const createMut = useMutation({
    mutationFn: (vars: {
      email: string;
      fullName?: string;
      role?: "user" | "admin";
      password?: string;
    }) => createUser(vars, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEmail("");
      setFullName("");
      setRole("user");
      setPassword("");
      toast?.success?.("User created");
    },
    onError: (e: any) => toast?.error?.(e.message || "Create failed"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: {
      id: string;
      data: Partial<{
        email: string;
        fullName: string;
        role: "user" | "admin";
      }>;
    }) => updateUser(vars.id, vars.data, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast?.success?.("User updated");
    },
    onError: (e: any) => toast?.error?.(e.message || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast?.success?.("User deleted");
    },
    onError: (e: any) => toast?.error?.(e.message || "Delete failed"),
  });

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "fullName",
        header: "Full name",
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string>() || "—",
      },
      {
        accessorKey: "role",
        header: "Role",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
        enableEditing: false,
        size: 180,
      },
    ],
    []
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!em) return;
    const r = (role || "user") as "user" | "admin";
    if (!roleSet.has(r)) return toast?.error?.("Role must be user or admin");
    createMut.mutate({
      email: em,
      fullName: fullName.trim() || undefined,
      role: r,
      password: password.trim() || undefined,
    });
  };

  const handleSave = async ({
    values,
    row,
    table,
  }: {
    values: User;
    row: any;
    table: any;
  }) => {
    const r = (values.role || "user").trim() as "user" | "admin";
    if (!roleSet.has(r)) {
      toast?.error?.("Role must be user or admin");
      return;
    }
    updateMut.mutate(
      {
        id: row.original.id,
        data: {
          email: values.email?.trim(),
          fullName: values.fullName?.trim(),
          role: r,
        },
      },
      {
        onSuccess: () => table.setEditingRow(null),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this user?")) return;
    deleteMut.mutate(id);
  };

  const table = useMantineReactTable({
    columns,
    data: users,
    state: { isLoading },
    enableEditing: true,
    editDisplayMode: "row",
    onEditingRowSave: handleSave,
    renderRowActions: ({ row }) => (
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="px-2 py-1 text-xs border rounded"
          onClick={() => table.setEditingRow(row)}
          disabled={updateMut.isPending}
        >
          Edit
        </button>
        <button
          className="px-2 py-1 text-xs border rounded text-red-600"
          onClick={() => handleDelete(row.original.id)}
          disabled={deleteMut.isPending}
        >
          Delete
        </button>
      </div>
    ),
    initialState: {
      density: "sm",
      sorting: [{ id: "createdAt", desc: true }],
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="grid gap-2 md:grid-cols-5">
        <input
          placeholder="Email"
          className="border rounded px-3 py-2 md:col-span-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Full name"
          className="border rounded px-3 py-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={createMut.isPending}
        />
        <select
          className="border rounded px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as "user" | "admin")}
          disabled={createMut.isPending}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <input
          placeholder="Password (optional)"
          type="password"
          className="border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={createMut.isPending}
        />
        <div className="md:col-span-5">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-40"
            disabled={!email.trim() || createMut.isPending}
          >
            {createMut.isPending ? "Saving..." : "Add user"}
          </button>
        </div>
      </form>
      <MantineReactTable table={table} />
    </div>
  );
};

export default UsersTable;
