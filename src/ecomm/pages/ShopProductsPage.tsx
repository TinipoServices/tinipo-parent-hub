import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories, fetchProducts } from "../api/ecommApi";
import { useCart } from "../context/CartContext";
import { useLocation as useShopLocation } from "../context/LocationContext";
import { formatInr } from "../lib/format";
import type { Category, Product } from "../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function CategoryPill({
  c,
  active,
  onSelect,
}: {
  c: Category;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "snap-start shrink-0 w-[4.75rem] sm:w-[5.25rem] text-center rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden",
        active ? "border-primary ring-2 ring-primary/25 bg-primary/5" : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className="h-11 sm:h-12 w-full bg-muted relative">
        <img src={c.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <p className="font-medium text-[10px] sm:text-[11px] leading-tight line-clamp-2 px-1 py-1.5 min-h-[2.25rem] flex items-center justify-center">
        {c.name}
      </p>
    </button>
  );
}

function ProductCard({ p, onAdd, detailTo }: { p: Product; onAdd: () => void; detailTo: string }) {
  const sell = p.price.selling_price ?? p.price.mrp;
  const hasDiscount = p.price.selling_price != null && p.price.selling_price < p.price.mrp;
  const discountPct = hasDiscount ? Math.round(((p.price.mrp - sell) / p.price.mrp) * 100) : 0;
  return (
    <Card className="overflow-hidden border-border shadow-soft hover:shadow-card transition-shadow h-full flex flex-col">
      <Link to={detailTo} className="block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl">
        <div className="aspect-square bg-muted relative">
          <img src={p.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {discountPct}% OFF
            </span>
          )}
          {p.is_best_seller && (
            <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> Best
            </span>
          )}
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <Link to={detailTo} className="flex-1 min-w-0 group">
          <h3 className="font-display font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {p.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-primary">{formatInr(sell)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{formatInr(p.price.mrp)}</span>
            )}
          </div>
        </Link>
        <Button className="w-full" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ShopProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category") ?? "";
  const subcategoryId = searchParams.get("subcategory") ?? "";
  const search = searchParams.get("q") ?? "";
  const { addItem } = useCart();
  const { location, openModal } = useShopLocation();
  const pincodeForApi = location?.pincode;
  const productDetailSearch = "";

  const categoriesQuery = useQuery({
    queryKey: ["ecomm", "categories", pincodeForApi ?? ""],
    queryFn: () => fetchCategories(pincodeForApi),
  });

  const productsQuery = useQuery({
    queryKey: ["ecomm", "products", categoryId, search, pincodeForApi ?? ""],
    queryFn: () =>
      fetchProducts({
        categoryId: categoryId || undefined,
        search: search || undefined,
        pincode: pincodeForApi,
      }),
  });

  const setCategory = (id: string) => {
    if (id) {
      navigate(`/shop/c/${encodeURIComponent(id)}`);
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    next.delete("subcategory");
    setSearchParams(next);
  };

  const setSubcategory = (id: string) => {
    if (categoryId) {
      const qs = id ? `?subcategory=${encodeURIComponent(id)}` : "";
      navigate(`/shop/c/${encodeURIComponent(categoryId)}${qs}`);
    }
  };

  const categories = categoriesQuery.data ?? [];
  const allProducts = productsQuery.data ?? [];
  const products = subcategoryId
    ? allProducts.filter((p) => p.subcategory_id === subcategoryId)
    : allProducts;
  const bestSellers = allProducts.filter((p) => p.is_best_seller).slice(0, 8);
  const activeCategory = categories.find((c) => c.id === categoryId);
  const subcategories = activeCategory?.subcategories ?? [];

  const onAddProduct = (p: Product) => {
    addItem({
      productId: p.id,
      name: p.name,
      media_url: p.media_url,
      unitPrice: p.price.selling_price ?? p.price.mrp,
      quantity: 1,
    });
    toast.success(`${p.name} added to cart`);
  };

  const gridKey = useMemo(
    () => `${categoryId}-${subcategoryId}-${search}-${pincodeForApi ?? ""}`,
    [categoryId, subcategoryId, search, pincodeForApi],
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Shop</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {search ? <>Results for <span className="font-semibold text-foreground">"{search}"</span></> : "Curated kids' essentials, delivered."}
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className={cn(
            "flex items-center gap-2 text-sm rounded-xl px-3 py-2 border shadow-soft transition-colors",
            location?.serviceable === false
              ? "border-amber-400/60 bg-amber-50 text-amber-900 hover:bg-amber-100"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          {location?.serviceable === false ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <MapPin className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium truncate max-w-[220px]">
            {location ? location.formatted_address : "Choose delivery location"}
          </span>
        </button>
      </div>

      {location && !location.serviceable && (
        <Card className="p-3 border-amber-300/60 bg-amber-50 text-amber-900 text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
          <span>
            We don't deliver to PIN <strong>{location.pincode}</strong> yet. Browse freely — we'll let you know once we
            launch in your area.
          </span>
        </Card>
      )}

      <section className="space-y-2">
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categories</h2>
        {categoriesQuery.isLoading ? (
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.75rem] w-[4.75rem] shrink-0 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 -mx-1 px-1 scroll-smooth [scrollbar-width:thin]">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={cn(
                "snap-start shrink-0 w-[4.75rem] sm:w-[5.25rem] rounded-xl border-2 flex flex-col items-center justify-center min-h-[4.75rem] text-[10px] sm:text-[11px] font-semibold px-1 text-center transition-all",
                !categoryId ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40",
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <CategoryPill key={c.id} c={c} active={categoryId === c.id} onSelect={() => setCategory(c.id)} />
            ))}
          </div>
        )}
      </section>

      {subcategories.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {activeCategory?.name} subcategories
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubcategory("")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                !subcategoryId ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40",
              )}
            >
              All {activeCategory?.name}
            </button>
            {subcategories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubcategory(s.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  subcategoryId === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {!categoryId && !search && bestSellers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg sm:text-xl font-semibold">Best sellers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                detailTo={`/shop/products/${encodeURIComponent(p.id)}${productDetailSearch}`}
                onAdd={() => onAddProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg sm:text-xl font-semibold">
          {categoryId ? activeCategory?.name ?? "Products" : "All products"}
        </h2>
        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[280px] sm:h-[320px] rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            No products match your filters. Try another category or search term.
          </Card>
        ) : (
          <div
            key={gridKey}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                detailTo={`/shop/products/${encodeURIComponent(p.id)}${productDetailSearch}`}
                onAdd={() => onAddProduct(p)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
