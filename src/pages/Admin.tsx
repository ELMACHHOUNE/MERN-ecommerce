import React, { useState } from "react";
import CategoriesTable from "@/components/admin/CategoriesTable";
import ProductsTable from "@/components/admin/ProductsTable";
import UsersTable from "@/components/admin/UsersTable";
import { useTranslation } from "react-i18next";
import { Package, Users, FolderTree, LayoutDashboard } from "lucide-react";

type Tab = "products" | "categories" | "users";

const Admin: React.FC = () => {
  const [tab, setTab] = useState<Tab>("products");
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[80vh] bg-pink-50/30 rounded-3xl overflow-hidden border border-pink-100 shadow-sm my-8 mx-4 lg:mx-8">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-pink-100 bg-white/80 backdrop-blur-sm flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-pink-50">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-display font-semibold text-lg hidden lg:block text-pink-950">
            {t("admin.sidebar.title")}
          </span>
        </div>
        <nav className="flex flex-col p-4 gap-2">
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              tab === "products"
                ? "bg-pink-100 text-pink-700 font-medium shadow-sm"
                : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
            }`}
            onClick={() => setTab("products")}
          >
            <Package size={20} />
            <span className="hidden lg:block">
              {t("admin.sidebar.products")}
            </span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              tab === "categories"
                ? "bg-pink-100 text-pink-700 font-medium shadow-sm"
                : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
            }`}
            onClick={() => setTab("categories")}
          >
            <FolderTree size={20} />
            <span className="hidden lg:block">
              {t("admin.sidebar.categories")}
            </span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              tab === "users"
                ? "bg-pink-100 text-pink-700 font-medium shadow-sm"
                : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
            }`}
            onClick={() => setTab("users")}
          >
            <Users size={20} />
            <span className="hidden lg:block">{t("admin.sidebar.users")}</span>
          </button>
        </nav>
      </aside>

      {/* Content */}
      <section className="flex-1 p-6 lg:p-10 overflow-y-auto bg-white/50">
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
  <header className="mb-8">
    <h1 className="text-3xl font-display font-bold text-pink-950 mb-2">
      {title}
    </h1>
    {description ? <p className="text-gray-500">{description}</p> : null}
  </header>
);

const ProductsPanel: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={t("admin.products.title")}
        description={t("admin.products.desc")}
      />
      <ProductsTable />
    </div>
  );
};

const CategoriesPanel: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={t("admin.categories.title")}
        description={t("admin.categories.desc")}
      />
      <CategoriesTable />
    </div>
  );
};

const UsersPanel: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={t("admin.users.title")}
        description={t("admin.users.desc")}
      />
      <UsersTable />
    </div>
  );
};

export default Admin;
