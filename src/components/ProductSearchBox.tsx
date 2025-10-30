import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProductsSuggestions, ProductDTO } from "@/api/products";
import { toApiURL } from "@/lib/api";

export function ProductSearchBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [value, setValue] = useState(
    () => params.get("q") || params.get("search") || params.get("name") || ""
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductDTO[]>([]);
  const blurTimer = useRef<number | null>(null);
  const minChars = 2;

  // keep input synced with URL
  useEffect(() => {
    setValue(
      params.get("q") || params.get("search") || params.get("name") || ""
    );
  }, [params]);

  // fetch suggestions (debounced)
  useEffect(() => {
    const q = value.trim();
    if (q.length < minChars) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let alive = true;
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await searchProductsSuggestions(q, 5);
        if (!alive) return;
        setSuggestions(res);
        setOpen(res.length > 0);
      } catch {
        if (!alive) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [value]);

  // close suggestions on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const buildNextUrl = (q: string) => {
    const next = new URLSearchParams(params);
    if (q) {
      next.set("q", q);
      next.set("name", q); // write `name` for compatibility with server/client expectations
    } else {
      next.delete("q");
      next.delete("name");
    }
    return `/products${next.toString() ? `?${next.toString()}` : ""}`;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(buildNextUrl(q));
    setOpen(false);
  };

  const onFocus = () => {
    if (value.trim().length >= minChars && suggestions.length > 0) {
      setOpen(true);
    }
  };

  const onBlur = () => {
    // delay to allow click selection
    blurTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const onSelectSuggestion = (p: ProductDTO) => {
    if (blurTimer.current) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
    const titleOrName = (p as any).title || (p as any).name || "";
    navigate(buildNextUrl(titleOrName));
    setOpen(false);
  };

  return (
    <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
      <form onSubmit={onSubmit} className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-9 bg-muted/50 dark:bg-muted border-0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <button type="submit" className="sr-only">
          Search
        </button>

        {open && (
          <div className="absolute left-0 right-0 mt-2 z-50 rounded-md border border-border bg-card text-card-foreground shadow-md">
            {loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results
              </div>
            )}
            {!loading && suggestions.length > 0 && (
              <ul className="max-h-80 overflow-auto py-1">
                {suggestions.map((p) => {
                  const titleOrName = (p as any).title || (p as any).name || "";
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => onSelectSuggestion(p)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground text-left"
                      >
                        <img
                          src={toApiURL((p as any).images?.[0]) || ""}
                          alt={titleOrName}
                          className="h-9 w-9 rounded object-cover bg-muted flex-shrink-0"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.visibility = "hidden";
                          }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {titleOrName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            $
                            {(p as any).price?.toFixed?.(2) ?? (p as any).price}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
