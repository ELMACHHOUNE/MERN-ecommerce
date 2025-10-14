import React, { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { v4 as uuid } from "uuid";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface Props {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoriesTable: React.FC<Props> = ({ categories, setCategories }) => {
  const [newName, setNewName] = useState("");

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
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
    setCategories((prev) => [
      {
        id: uuid(),
        name: newName.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewName("");
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
    setCategories((prev) =>
      prev.map((c) => (c.id === row.original.id ? { ...c, ...values } : c))
    );
    table.setEditingRow(null);
  };

  const handleDelete = (id: string) =>
    setCategories((prev) => prev.filter((c) => c.id !== id));

  const table = useMantineReactTable({
    columns,
    data: categories,
    enableEditing: true,
    editDisplayMode: "row",
    onEditingRowSave: handleSave,
    renderRowActions: ({ row }) => (
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="px-2 py-1 text-xs border rounded"
          onClick={() => table.setEditingRow(row)}
        >
          Edit
        </button>
        <button
          className="px-2 py-1 text-xs border rounded text-red-600"
          onClick={() => handleDelete(row.original.id)}
        >
          Delete
        </button>
      </div>
    ),
    initialState: {
      density: "sm",
      sorting: [{ id: "createdAt", desc: true }],
    },
  });

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          placeholder="New category name"
          className="border rounded px-3 py-2 flex-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-40"
          disabled={!newName.trim()}
        >
          Add
        </button>
      </form>
      <MantineReactTable table={table} />
    </div>
  );
};

export default CategoriesTable;
