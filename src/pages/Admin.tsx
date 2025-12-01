import React, { useState } from "react";
import CategoriesTable from "@/components/admin/CategoriesTable";
import ProductsTable from "@/components/admin/ProductsTable";
import UsersTable from "@/components/admin/UsersTable";

type Tab = "products" | "categories" | "users";

const Admin: React.FC = () => {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className="flex min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-4 font-semibold text-lg">Admin</div>
        <nav className="flex flex-col">
          <button
            className={`text-left px-4 py-2 hover:bg-muted ${
              tab === "products" ? "bg-accent/20 font-medium" : ""
            }`}
            onClick={() => setTab("products")}
          >
            Products management
          </button>
          <button
            className={`text-left px-4 py-2 hover:bg-muted ${
              tab === "categories" ? "bg-accent/20 font-medium" : ""
            }`}
            onClick={() => setTab("categories")}
          >
            Categories management
          </button>
          <button
            className={`text-left px-4 py-2 hover:bg-muted ${
              tab === "users" ? "bg-accent/20 font-medium" : ""
            }`}
            onClick={() => setTab("users")}
          >
            User management
          </button>
        </nav>
      </aside>

      {/* Content */}
      <section className="flex-1 p-6">
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "users" && <UsersPanel />}
      </section>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <header className="mb-4">
    <h1 className="text-2xl font-semibold">{title}</h1>
    {description ? (
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    ) : null}
  </header>
);

const ProductsPanel: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="Products"
        description="Create, edit, and delete products."
      />
      <ProductsTable />
    </div>
  );
};

const CategoriesPanel: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="Categories"
        description="Organize products into categories."
      />
      <CategoriesTable />
    </div>
  );
};

const UsersPanel: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="Users"
        description="Manage user accounts and roles."
      />
      <UsersTable />
    </div>
  );
};

export default Admin;
