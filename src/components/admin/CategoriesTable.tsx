import React, { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryDTO,
} from "@/api/categories";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext"; // assuming this returns { user, token }
import { toast } from "sonner"; // if you use toast

export interface Category extends CategoryDTO {}

const CategoriesTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = (useAuth && useAuth()) || { token: undefined }; // adjust if token path different
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
      toast?.success?.("Category created");
    },
    onError: (e: any) => toast?.error?.(e.message || "Create failed"),
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
      toast?.success?.("Category updated");
    },
    onError: (e: any) => toast?.error?.(e.message || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast?.success?.("Category deleted");
    },
    onError: (e: any) => toast?.error?.(e.message || "Delete failed"),
  });

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "imageUrl",
        header: "Image",
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          const src = cell.getValue<string>();
          return src ? (
            <img
              src={src}
              alt="Category"
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ) : (
            <span>—</span>
          );
        },
        size: 70,
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "description",
        header: "Description",
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string>() || "—",
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
    row: any;
    table: any;
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
    if (!confirm("Delete this category?")) return;
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
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        <div>
          <input
            id={`cat-img-${row.original.id}`}
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
            className="px-2 py-1 text-xs border rounded"
            onClick={() =>
              document.getElementById(`cat-img-${row.original.id}`)?.click()
            }
            disabled={updateMut.isPending}
          >
            Change image
          </button>
        </div>
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
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-2 md:flex-row md:items-center"
      >
        <input
          placeholder="New category name"
          className="border rounded px-3 py-2 flex-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Description (optional)"
          className="border rounded px-3 py-2 flex-1"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files?.[0] || null)}
          disabled={createMut.isPending}
          className="text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-40"
          disabled={!newName.trim() || createMut.isPending}
        >
          {createMut.isPending ? "Saving..." : "Add"}
        </button>
      </form>
      <MantineReactTable table={table} />
    </div>
  );
};

export default CategoriesTable;
