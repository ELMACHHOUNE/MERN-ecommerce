import React, { useMemo, useState, useRef } from "react";
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
  fetchProductCategories,
  type CategoryOption,
} from "@/api/products";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { toApiURL } from "@/lib/api";

export interface Product extends ProductDTO {}

const ProductsTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = (useAuth && useAuth()) || { token: undefined };

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState<string>("");
  const [category, setCategory] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: categoryOptions = [], isLoading: catsLoading } = useQuery({
    queryKey: ["productCategoryOptions"],
    queryFn: fetchProductCategories,
  });

  const createMut = useMutation({
    mutationFn: (formData: FormData) => createProduct(formData, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setTitle("");
      setPrice("");
      setDescription("");
      setStock("");
      setCategory("");
      setImageFiles(null);
      toast?.success?.("Product created");
    },
    onError: (e: any) => toast?.error?.(e.message || "Create failed"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: {
      id: string;
      data:
        | Partial<{
            title: string;
            price: number;
            description: string;
            stock: number;
            category: string;
          }>
        | FormData;
    }) => updateProduct(vars.id, vars.data as any, token),
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
        editVariant: "select",
        editSelectOptions: categoryOptions, // normalized {label,value}[]
        Cell: ({ cell }) => cell.getValue<string>() || "—",
      },
      {
        accessorKey: "description",
        header: "Description",
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string>() || "—",
      },
      {
        accessorKey: "images",
        header: "Images",
        enableColumnFilter: false,
        enableEditing: false,
        Cell: ({ cell }) => {
          const imgs = (cell.getValue<string[]>() || []) as string[];
          const first = imgs[0];
          const src = first ? toApiURL(first) : "";
          return first ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={src}
                alt=""
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <span className="text-xs text-muted-foreground">
                {imgs.length > 1 ? `+${imgs.length - 1}` : ""}
              </span>
            </div>
          ) : (
            "—"
          );
        },
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
        enableEditing: false,
        size: 180,
      },
    ],
    [categoryOptions]
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = stock.trim() ? Number(stock) : undefined;
    if (!title.trim() || !Number.isFinite(priceNum)) return;

    const files = imageFiles ? Array.from(imageFiles) : [];
    if (files.length < 1 || files.length > 5) {
      toast?.error?.("Please select between 1 and 5 images");
      return;
    }
    if (files.some((f) => !f.type.startsWith("image/"))) {
      toast?.error?.("Only image files are allowed");
      return;
    }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("price", String(priceNum));
    if (description.trim()) fd.append("description", description.trim());
    if (typeof stockNum === "number" && Number.isFinite(stockNum))
      fd.append("stock", String(stockNum));
    if (category.trim()) fd.append("category", category.trim());
    files.forEach((f) => fd.append("images", f));

    createMut.mutate(fd);
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

  const openReplaceImages = (id: string) => {
    setReplaceId(id);
    replaceInputRef.current?.click();
  };

  const onReplaceImagesChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!replaceId) return;
    if (files.length < 1 || files.length > 5) {
      toast?.error?.("Please select between 1 and 5 images");
      e.currentTarget.value = "";
      return;
    }
    if (files.some((f) => !f.type.startsWith("image/"))) {
      toast?.error?.("Only image files are allowed");
      e.currentTarget.value = "";
      return;
    }
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    updateMut.mutate(
      { id: replaceId, data: fd },
      {
        onSuccess: () => {
          setReplaceId(null);
          if (replaceInputRef.current) replaceInputRef.current.value = "";
        },
        onError: () => {
          if (replaceInputRef.current) replaceInputRef.current.value = "";
        },
      }
    );
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
          className="px-2 py-1 text-xs border rounded"
          onClick={() => openReplaceImages(row.original.id)}
          disabled={updateMut.isPending}
        >
          Images
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
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onReplaceImagesChange}
      />
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
        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={createMut.isPending || catsLoading}
        >
          <option value="">
            {catsLoading ? "Loading..." : "Select category"}
          </option>
          {categoryOptions
            .filter(
              (opt): opt is CategoryOption =>
                !!opt &&
                typeof opt.value === "string" &&
                opt.value.trim().length > 0
            )
            .map((opt) => {
              const val = String(opt.value);
              const lbl = String(opt.label ?? opt.value);
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
        </select>
        <input
          type="file"
          accept="image/*"
          multiple
          className="border rounded px-3 py-2 md:col-span-3"
          onChange={(e) => setImageFiles(e.target.files)}
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
            disabled={
              !title.trim() ||
              !price.trim() ||
              !imageFiles ||
              imageFiles.length < 1 ||
              createMut.isPending
            }
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
