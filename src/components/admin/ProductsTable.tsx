import React, { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductDTO,
} from "@/api/products";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Product extends ProductDTO {}

const ProductsTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = (useAuth && useAuth()) || { token: undefined };

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState<string>("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const createMut = useMutation({
    mutationFn: (vars: {
      title: string;
      price: number;
      description?: string;
      stock?: number;
      category?: string;
      images?: string[];
    }) => createProduct(vars, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setTitle("");
      setPrice("");
      setDescription("");
      setStock("");
      setCategory("");
      setImages("");
      toast?.success?.("Product created");
    },
    onError: (e: any) => toast?.error?.(e.message || "Create failed"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: {
      id: string;
      data: Partial<{
        title: string;
        price: number;
        description: string;
        stock: number;
        category: string;
      }>;
    }) => updateProduct(vars.id, vars.data, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast?.success?.("Product updated");
    },
    onError: (e: any) => toast?.error?.(e.message || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast?.success?.("Product deleted");
    },
    onError: (e: any) => toast?.error?.(e.message || "Delete failed"),
  });

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "price",
        header: "Price",
        Cell: ({ cell }) => {
          const v = cell.getValue<number>();
          return typeof v === "number" ? `$${v.toFixed(2)}` : "—";
        },
      },
      { accessorKey: "stock", header: "Stock" },
      {
        accessorKey: "category",
        header: "Category",
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string>() || "—",
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
    const priceNum = Number(price);
    const stockNum = stock.trim() ? Number(stock) : undefined;
    if (!title.trim() || !Number.isFinite(priceNum)) return;
    const imgs =
      images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    createMut.mutate({
      title: title.trim(),
      price: priceNum,
      description: description.trim() || undefined,
      stock: typeof stockNum === "number" && Number.isFinite(stockNum) ? stockNum : undefined,
      category: category.trim() || undefined,
      images: imgs,
    });
  };

  const handleSave = async ({
    values,
    row,
    table,
  }: {
    values: Product;
    row: any;
    table: any;
  }) => {
    const priceNum = Number(values.price);
    const stockNum = Number(values.stock);
    updateMut.mutate(
      {
        id: row.original.id,
        data: {
          title: values.title?.trim(),
          price: Number.isFinite(priceNum) ? priceNum : undefined,
          description: values.description?.trim(),
          stock: Number.isFinite(stockNum) ? stockNum : undefined,
          category: values.category?.trim(),
        },
      },
      {
        onSuccess: () => table.setEditingRow(null),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    deleteMut.mutate(id);
  };

  const table = useMantineReactTable({
    columns,
    data: products,
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
      <form onSubmit={handleCreate} className="grid gap-2 md:grid-cols-6">
        <input
          placeholder="Title"
          className="border rounded px-3 py-2 md:col-span-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          className="border rounded px-3 py-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Stock"
          type="number"
          className="border rounded px-3 py-2"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Category"
          className="border rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Images (comma-separated URLs)"
          className="border rounded px-3 py-2 md:col-span-3"
          value={images}
          onChange={(e) => setImages(e.target.value)}
          disabled={createMut.isPending}
        />
        <input
          placeholder="Description"
          className="border rounded px-3 py-2 md:col-span-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={createMut.isPending}
        />
        <div className="md:col-span-6">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-40"
            disabled={!title.trim() || !price.trim() || createMut.isPending}
          >
            {createMut.isPending ? "Saving..." : "Add product"}
          </button>
        </div>
      </form>
      <MantineReactTable table={table} />
    </div>
  );
};

export default ProductsTable;
