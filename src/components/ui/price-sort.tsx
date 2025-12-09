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
        variant="outline"
        className="gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {computedLabel}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border rounded-md shadow-md z-10">
          <div className="px-3 py-2 text-sm text-muted-foreground border-b">
            {t("products.sortedBy")}
          </div>
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/20 ${
              sort === "price-asc" ? "bg-muted/30" : ""
            }`}
            onClick={() => {
              onChange("price-asc");
              setOpen(false);
            }}
          >
            {t("products.sort.lowToHigh")}
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/20 ${
              sort === "price-desc" ? "bg-muted/30" : ""
            }`}
            onClick={() => {
              onChange("price-desc");
              setOpen(false);
            }}
          >
            {t("products.sort.highToLow")}
          </button>
        </div>
      )}
    </div>
  );
}
