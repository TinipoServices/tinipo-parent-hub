import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories, fetchProducts } from "../api/ecommApi";
import { useCart } from "../context/CartContext";
import { formatInr } from "../lib/format";
import type { Category, Product } from "../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function CategoryCard({
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
        "text-left rounded-2xl border-2 overflow-hidden transition-all hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary ring-2 ring-primary/20" : "border-border bg-card",
      )}
    >
      <div className="aspect-[4/3] bg-muted relative">
        <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-display font-semibold text-sm sm:text-base leading-tight line-clamp-2">{c.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{active ? "Selected" : "View products"}</p>
      </div>
    </button>
  );
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: () => void }) {
  return (
    <Card className="overflow-hidden border-border shadow-soft hover:shadow-card transition-shadow h-full flex flex-col">
      <div className="aspect-square bg-muted relative shrink-0">
        <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1 min-h-0">
          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2">{p.name}</h3>
          <p className="text-lg font-bold text-primary mt-2">{formatInr(p.mrp_amount)}</p>
        </div>
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

  const categoriesQuery = useQuery({
    queryKey: ["ecomm", "categories"],
    queryFn: fetchCategories,
  });

  const productsQuery = useQuery({
    queryKey: ["ecomm", "products", categoryId, search],
    queryFn: () =>
      fetchProducts({
        categoryId: categoryId || undefined,
        search: search || undefined,
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

  const searchInputValue = search;

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

  const gridKey = useMemo(() => `${categoryId}-${search}`, [categoryId, search]);

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Shop</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1 max-w-2xl">
          Browse categories (A–Z), filter products, and search by name.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name…"
          className="pl-10 h-11 rounded-xl"
          value={searchInputValue}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold">Categories</h2>
        {categoriesQuery.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={cn(
                "rounded-2xl border-2 p-4 text-left transition-all flex flex-col justify-center min-h-[120px]",
                !categoryId ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:shadow-soft",
              )}
            >
              <span className="font-display font-semibold">All products</span>
              <span className="text-xs text-muted-foreground mt-2">Every category</span>
            </button>
            {categories.map((c) => (
              <CategoryCard key={c.id} c={c} active={categoryId === c.id} onSelect={() => setCategory(c.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold">Products</h2>
        {productsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[360px] rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            No products match your filters. Try another category or search term.
          </Card>
        ) : (
          <div
            key={gridKey}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {products.map((p) => (
              <ProductCard key={p.id} p={p} onAdd={() => onAddProduct(p)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
