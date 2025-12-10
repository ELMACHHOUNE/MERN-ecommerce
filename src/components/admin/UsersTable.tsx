import React, { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
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
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, User as UserIcon, Shield } from "lucide-react";

export type User = UserDTO;

const roleSet = new Set(["user", "admin"]);

const UsersTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = useAuth();
  const { t } = useTranslation();

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
      toast.success(t("admin.toast.created"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
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
      toast.success(t("admin.toast.updated"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("admin.toast.deleted"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: "email", header: t("admin.form.email") },
      {
        accessorKey: "fullName",
        header: t("admin.form.fullName"),
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string>() || "—",
      },
      {
        accessorKey: "role",
        header: t("admin.form.role"),
        editVariant: "select",
        editSelectOptions: ["user", "admin"],
        Cell: ({ cell }) => {
          const role = cell.getValue<string>();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("admin.table.created"),
        Cell: ({ cell }) => (
          <span className="text-gray-500 text-sm">
            {new Date(cell.getValue<string>()).toLocaleDateString()}
          </span>
        ),
        enableEditing: false,
        size: 180,
      },
    ],
    [t]
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!em) return;
    const r = (role || "user") as "user" | "admin";
    if (!roleSet.has(r)) return toast.error("Role must be user or admin");
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
    row: MRT_Row<User>;
    table: MRT_TableInstance<User>;
  }) => {
    const r = (values.role || "user").trim() as "user" | "admin";
    if (!roleSet.has(r)) {
      toast.error("Role must be user or admin");
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
    if (!confirm(t("admin.confirmDelete"))) return;
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
      <div className="flex gap-2">
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          onClick={() => table.setEditingRow(row)}
          disabled={updateMut.isPending}
          title={t("admin.table.edit")}
        >
          <Edit size={18} />
        </button>
        <button
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          onClick={() => handleDelete(row.original.id)}
          disabled={deleteMut.isPending}
          title={t("admin.table.delete")}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
    initialState: {
      density: "comfortable",
      sorting: [{ id: "createdAt", desc: true }],
    },
    muiTablePaperProps: {
      elevation: 0,
      className: "border border-pink-100 rounded-2xl overflow-hidden shadow-sm",
    },
    muiTableHeadCellProps: {
      className: "bg-pink-50/50 text-pink-900 font-semibold",
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-2xl border border-pink-100 shadow-sm space-y-4"
      >
        <h3 className="font-medium text-pink-900 mb-2 flex items-center gap-2">
          <Plus size={18} /> {t("admin.table.add")}
        </h3>
        <div className="grid gap-4 md:grid-cols-12 items-start">
          <div className="md:col-span-4">
            <input
              placeholder={t("admin.form.email")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-3">
            <input
              placeholder={t("admin.form.fullName")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-2">
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              disabled={createMut.isPending}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <input
              placeholder={t("admin.form.password")}
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
              disabled={!email.trim() || createMut.isPending}
            >
              {createMut.isPending
                ? t("admin.form.saving")
                : t("admin.table.add")}
            </button>
          </div>
        </div>
      </form>
      <MantineReactTable table={table} />
    </div>
  );
};

export default UsersTable;
