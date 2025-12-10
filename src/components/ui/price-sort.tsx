import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

type SortValue = "price-asc" | "price-desc" | null;

type PriceSortMenuProps = {
  sort: SortValue;
  onChange: (value: Exclude<SortValue, null>) => void;
  label?: string;
};

export function PriceSortMenu({ sort, onChange, label }: PriceSortMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const computedLabel = label ?? t("products.sortedBy");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        className="gap-2 text-blush-pop-900 hover:text-blush-pop-700 hover:bg-blush-pop-50 font-medium"
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {computedLabel}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-blush-pop-100 rounded-xl shadow-lg shadow-blush-pop-100/50 z-20 overflow-hidden">
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-blush-pop-400 bg-blush-pop-50/50 border-b border-blush-pop-50">
            {t("products.sortedBy")}
          </div>
          <div className="p-1">
            <button
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                sort === "price-asc"
                  ? "bg-blush-pop-50 text-blush-pop-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => {
                onChange("price-asc");
                setOpen(false);
              }}
            >
              {t("products.sort.lowToHigh")}
            </button>
            <button
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                sort === "price-desc"
                  ? "bg-blush-pop-50 text-blush-pop-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => {
                onChange("price-desc");
                setOpen(false);
              }}
            >
              {t("products.sort.highToLow")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
