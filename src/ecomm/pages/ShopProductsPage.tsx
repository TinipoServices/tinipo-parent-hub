import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories, fetchProducts } from "../api/ecommApi";
import { useCart } from "../context/CartContext";
import { usePincodeForCatalog } from "../hooks/usePincodeForCatalog";
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
        <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <p className="font-medium text-[10px] sm:text-[11px] leading-tight line-clamp-2 px-1 py-1.5 min-h-[2.25rem] flex items-center justify-center">
        {c.name}
      </p>
    </button>
  );
}

function ProductCard({ p, onAdd, detailTo }: { p: Product; onAdd: () => void; detailTo: string }) {
  return (
    <Card className="overflow-hidden border-border shadow-soft hover:shadow-card transition-shadow h-full flex flex-col">
      <Link to={detailTo} className="block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl">
        <div className="aspect-square bg-muted relative">
          <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <Link to={detailTo} className="flex-1 min-w-0 group">
          <h3 className="font-display font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {p.name}
          </h3>
          <p className="text-base sm:text-lg font-bold text-primary mt-1">{formatInr(p.mrp_amount)}</p>
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
  const categoryId = searchParams.get("category") ?? "";
  const search = searchParams.get("q") ?? "";
  const { addItem } = useCart();
  const { profilePin, pincodeForApi, draftPin, setDraftPin, applyGuestPin, productDetailSearch, usesProfilePin } =
    usePincodeForCatalog();

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
    const next = new URLSearchParams(searchParams);
    if (id) next.set("category", id);
    else next.delete("category");
    setSearchParams(next);
  };

  const setSearch = (q: string) => {
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    setSearchParams(next);
  };

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const onAddProduct = (p: Product) => {
    addItem({
      productId: p.id,
      name: p.name,
      image: p.image,
      unitPrice: p.mrp_amount,
      quantity: 1,
    });
    toast.success(`${p.name} added to cart`);
  };

  const gridKey = useMemo(() => `${categoryId}-${search}-${pincodeForApi ?? ""}`, [categoryId, search, pincodeForApi]);

  const onApplyPin = () => {
    const r = applyGuestPin();
    if (!r.ok) toast.error(r.reason);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Shop</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1 max-w-2xl">
          Prices use your delivery PIN when signed in, or enter a PIN below as a guest.
        </p>
      </div>

      {usesProfilePin ? (
        <div className="flex flex-wrap items-center gap-2 text-sm rounded-xl border border-border bg-card px-3 py-2.5 shadow-soft">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground">Showing prices for PIN</span>
          <span className="font-mono font-semibold text-foreground">{profilePin}</span>
          <span className="text-muted-foreground text-xs">(from your account address)</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="shop-pin">PIN code for prices</Label>
            <Input
              id="shop-pin"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit PIN"
              className="h-10 font-mono"
              value={draftPin}
              onChange={(e) => setDraftPin(e.target.value)}
            />
          </div>
          <Button type="button" variant="secondary" className="sm:mb-0.5" onClick={onApplyPin}>
            Apply
          </Button>
        </div>
      )}

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name…"
          className="pl-10 h-10 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </div>

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

      <section className="space-y-3">
        <h2 className="font-display text-lg sm:text-xl font-semibold">Products</h2>
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
