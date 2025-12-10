import React, { useMemo, useState, useRef } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
} from "mantine-react-table";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductCategories,
  type ProductDTO,
} from "@/api/products";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { toApiURL } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from "lucide-react";

export type Product = ProductDTO;

const ProductsTable: React.FC = () => {
  const qc = useQueryClient();
  const { token } = useAuth();
  const { t } = useTranslation();

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
      toast.success(t("admin.toast.created"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
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
    }) => updateProduct(vars.id, vars.data, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(t("admin.toast.updated"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(t("admin.toast.deleted"));
    },
    onError: (e: Error) => toast.error(e.message || t("admin.toast.error")),
  });

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      { accessorKey: "title", header: t("admin.form.title") },
      {
        accessorKey: "price",
        header: t("admin.form.price"),
        Cell: ({ cell }) => {
          const v = cell.getValue<number>();
          return typeof v === "number" ? `$${v.toFixed(2)}` : "—";
        },
      },
      { accessorKey: "stock", header: t("admin.form.stock") },
      {
        accessorKey: "category",
        header: t("admin.form.category"),
        enableColumnFilter: false,
        editVariant: "select",
        editSelectOptions: categoryOptions,
        Cell: ({ cell }) => cell.getValue<string>() || "—",
      },
      {
        accessorKey: "description",
        header: t("admin.form.description"),
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <span className="text-gray-500 text-sm line-clamp-2">
            {cell.getValue<string>() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "images",
        header: t("admin.form.images"),
        enableColumnFilter: false,
        enableEditing: false,
        Cell: ({ cell }) => {
          const imgs = (cell.getValue<string[]>() || []) as string[];
          const first = imgs[0];
          const src = first ? toApiURL(first) : "";
          return first ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-pink-100 shadow-sm group">
              <img
                src={src}
                alt="Product"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center text-pink-300">
              <ImageIcon size={20} />
            </div>
          );
        },
        size: 120,
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
    [categoryOptions, t]
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = stock.trim() ? Number(stock) : undefined;
    if (!title.trim() || !Number.isFinite(priceNum)) return;

    const files = imageFiles ? Array.from(imageFiles) : [];
    if (files.length < 1 || files.length > 5) {
      toast.error("Please select 1-5 images");
      return;
    }
    if (files.some((f) => !f.type.startsWith("image/"))) {
      toast.error("Only image files allowed");
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
    row: MRT_Row<Product>;
    table: MRT_TableInstance<Product>;
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
    if (!confirm(t("admin.confirmDelete"))) return;
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
      toast.error("Please select 1-5 images");
      return;
    }
    if (files.some((f) => !f.type.startsWith("image/"))) {
      toast.error("Only image files allowed");
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
          setReplaceId(null);
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
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          onClick={() => openReplaceImages(row.original.id)}
          disabled={updateMut.isPending}
          title={t("admin.table.changeImage")}
        >
          <Upload size={18} />
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
      {/* Hidden input for replacing images */}
      <input
        type="file"
        multiple
        accept="image/*"
        ref={replaceInputRef}
        className="hidden"
        onChange={onReplaceImagesChange}
      />

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
              placeholder={t("admin.form.title")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-2">
            <input
              placeholder={t("admin.form.price")}
              type="number"
              step="0.01"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-2">
            <input
              placeholder={t("admin.form.stock")}
              type="number"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-3">
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={createMut.isPending || catsLoading}
            >
              <option value="">{t("admin.form.selectCategory")}</option>
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 w-full border border-gray-200 border-dashed rounded-xl px-4 py-2.5 cursor-pointer hover:bg-pink-50/50 hover:border-pink-300 transition-all text-gray-500 text-sm justify-center">
              <ImageIcon size={16} />
              <span className="truncate">
                {imageFiles
                  ? `${imageFiles.length} files`
                  : t("admin.form.images")}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(e.target.files)}
                disabled={createMut.isPending}
                className="hidden"
              />
            </label>
          </div>
          <div className="md:col-span-12">
            <textarea
              placeholder={t("admin.form.description")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all min-h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMut.isPending}
            />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
              disabled={!title.trim() || createMut.isPending}
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

export default ProductsTable;
