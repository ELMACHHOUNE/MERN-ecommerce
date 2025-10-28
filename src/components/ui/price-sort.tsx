import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

type SortValue = "price-asc" | "price-desc" | null;

type PriceSortMenuProps = {
  sort: SortValue;
  onChange: (value: Exclude<SortValue, null>) => void;
  label?: string;
};

export function PriceSortMenu({
  sort,
  onChange,
  label = "Filters",
}: PriceSortMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

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
        {label}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-md z-10">
          <div className="px-3 py-2 text-sm text-gray-600 border-b">
            Sort by price
          </div>
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
              sort === "price-asc" ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              onChange("price-asc");
              setOpen(false);
            }}
          >
            Low to High
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
              sort === "price-desc" ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              onChange("price-desc");
              setOpen(false);
            }}
          >
            High to Low
          </button>
        </div>
      )}
    </div>
  );
}
