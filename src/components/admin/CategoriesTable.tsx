import React, { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
} from "mantine-react-table";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryDTO,
} from "@/api/categories";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";

export type Category = CategoryDTO;

const CategoriesTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = useAuth();
  const { t } = useTranslation();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMut = useMutation({
    mutationFn: (form: FormData) => createCategory(form, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
      setNewDesc("");
      setNewImage(null);
      toast.success(t("admin.toast.created"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const updateMut = useMutation({
    mutationFn: (vars: {
      id: string;
      name?: string;
      description?: string;
      imageFile?: File;
    }) => {
      const fd = new FormData();
      if (vars.name != null) fd.append("name", vars.name);
      if (vars.description != null) fd.append("description", vars.description);
      if (vars.imageFile) fd.append("image", vars.imageFile);
      return updateCategory(vars.id, fd, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("admin.toast.updated"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("admin.toast.deleted"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "imageUrl",
        header: t("admin.table.image"),
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell, row }) => {
          const src = cell.getValue<string>();
          return src ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-pink-100 shadow-sm group">
              <img
                src={src}
                alt={row.original.name || "Category"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center text-pink-300">
              <ImageIcon size={20} />
            </div>
          );
        },
        Edit: ({ row }) => (
          <div className="flex items-center gap-2">
            <input
              id={`edit-cat-img-${row.original.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                updateMut.mutate({ id: row.original.id, imageFile: file });
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium bg-white border border-pink-200 text-pink-700 rounded-lg hover:bg-pink-50 transition-colors"
              onClick={() =>
                document
                  .getElementById(`edit-cat-img-${row.original.id}`)
                  ?.click()
              }
              disabled={updateMut.isPending}
            >
              {t("admin.table.changeImage")}
            </button>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: t("admin.table.name"),
        muiTableBodyCellProps: {
          className: "font-medium text-gray-900",
        },
      },
      {
        accessorKey: "description",
        header: t("admin.table.description"),
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <span className="text-gray-500 text-sm line-clamp-2">
            {cell.getValue<string>() || "—"}
          </span>
        ),
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
        size: 120,
      },
    ],
    [updateMut, t]
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const fd = new FormData();
    fd.append("name", newName.trim());
    if (newDesc.trim()) fd.append("description", newDesc.trim());
    if (newImage) fd.append("image", newImage);
    createMut.mutate(fd);
  };

  const handleSave = async ({
    values,
    row,
    table,
  }: {
    values: Category;
    row: MRT_Row<Category>;
    table: MRT_TableInstance<Category>;
  }) => {
    updateMut.mutate(
      {
        id: row.original.id,
        name: values.name?.trim(),
        description: values.description?.trim(),
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
    data: categories,
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
          aria-label={t("admin.table.edit")}
        >
          <Edit size={18} />
        </button>
        <button
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          onClick={() => handleDelete(row.original.id)}
          disabled={deleteMut.isPending}
          title={t("admin.table.delete")}
          aria-label={t("admin.table.delete")}
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
          <div className="md:col-span-3">
            <input
              placeholder={t("admin.form.name")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-4">
            <input
              placeholder={t("admin.form.description")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-3">
            <label className="flex items-center gap-2 w-full border border-gray-200 border-dashed rounded-xl px-4 py-2.5 cursor-pointer hover:bg-pink-50/50 hover:border-pink-300 transition-all text-gray-500 text-sm">
              <ImageIcon size={16} />
              <span className="truncate">
                {newImage ? newImage.name : t("admin.form.images")}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                disabled={createMut.isPending}
                className="hidden"
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
              disabled={!newName.trim() || createMut.isPending}
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

export default CategoriesTable;
