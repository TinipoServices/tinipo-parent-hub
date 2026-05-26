import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories, fetchProducts } from "../api/ecommApi";
import { useCart } from "../context/CartContext";
import { useLocation as useShopLocation } from "../context/LocationContext";
import { formatInr } from "../lib/format";
import type { Product } from "../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { readPrice } from "../lib/money";

function ProductRow({ p, onAdd, detailTo }: { p: Product; onAdd: () => void; detailTo: string }) {
  const { mrp, sell, hasDiscount, discountPct } = readPrice(p.price ?? undefined);
  return (
    <Card className="overflow-hidden border-border shadow-soft hover:shadow-card transition-shadow flex flex-col">
      <Link to={detailTo} className="block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-xl">
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
      <CardContent className="p-2.5 sm:p-3 flex flex-col flex-1 gap-2">
        <Link to={detailTo} className="flex-1 min-w-0 group">
          <h3 className="font-display font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {p.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-primary">{formatInr(sell)}</span>
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through">{formatInr(mrp)}</span>
            )}
          </div>
        </Link>
        <Button className="w-full" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ShopCategoryPage() {
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subcategoryId = searchParams.get("subcategory") ?? "";
  const { addItem } = useCart();
  const { location } = useShopLocation();
  const pincodeForApi = location?.pincode;

  const categoriesQuery = useQuery({
    queryKey: ["ecomm", "categories", pincodeForApi ?? ""],
    queryFn: () => fetchCategories(pincodeForApi),
  });

  // const productsQuery = useQuery({
  //   queryKey: ["ecomm", "products", categoryId, "", pincodeForApi ?? ""],
  //   queryFn: () =>
  //     fetchProducts({
  //       categoryId: categoryId || undefined,
  //       pincode: pincodeForApi,
  //     }),
  //   enabled: !!categoryId,
  // });

  const productsQuery = useQuery({
    queryKey: [
      "ecomm",
      "products",
      categoryId,
      subcategoryId,
      pincodeForApi ?? "",
    ],
  
    queryFn: () =>
      fetchProducts({
        categoryId: subcategoryId || categoryId || undefined,
        pincode: pincodeForApi,
      }),
  
    enabled: !!categoryId,
  });

  const categories = categoriesQuery.data ?? [];
  const activeCategory = categories.find(
    (c) => Number(c.id) === Number(categoryId)
  );
  const subcategories = activeCategory?.subcategories ?? [];


  // const allProducts = productsQuery.data ?? [];
  // const products = useMemo(
  //   () => (subcategoryId ? allProducts.filter((p) => p.subcategory_id === subcategoryId) : allProducts),
  //   [allProducts, subcategoryId],
  // );

  const products = productsQuery.data ?? [];

  const setSubcategory = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("subcategory", id);
    else next.delete("subcategory");
    setSearchParams(next);
  };

  const activeSub = subcategories.find((s) => s.id === subcategoryId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2 h-8" asChild>
          <Link to="/shop/products">
            <ArrowLeft className="h-4 w-4" />
            Shop
          </Link>
        </Button>
        <span>/</span>
        <span className="font-medium text-foreground">{activeCategory?.name ?? "Category"}</span>
        {activeSub && (
          <>
            <span>/</span>
            <span className="font-medium text-foreground">{activeSub.name}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[140px_1fr] gap-3 sm:gap-4">
        {/* Sidebar: subcategories */}
        <aside className="bg-muted/40 rounded-xl border border-border overflow-hidden self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {categoriesQuery.isLoading ? (
            <div className="p-2 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col">
              <li>
                <button
                  type="button"
                  onClick={() => setSubcategory("")}
                  className={cn(
                    "w-full text-center py-3 px-2 text-[11px] sm:text-xs font-semibold border-l-4 transition-colors",
                    !subcategoryId
                      ? "border-primary bg-background text-primary"
                      : "border-transparent text-muted-foreground hover:bg-background/60",
                  )}
                >
                  All
                </button>
              </li>
              {subcategories.map((s) => {
                const active = subcategoryId === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSubcategory(s.id)}
                      className={cn(
                        "w-full flex flex-col items-center gap-1 py-3 px-1.5 border-l-4 transition-colors",
                        active
                          ? "border-primary bg-background"
                          : "border-transparent hover:bg-background/60",
                      )}
                    >
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-muted overflow-hidden">
                        {s.media_url ? (
                          <img src={s.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] sm:text-[11px] leading-tight line-clamp-2 text-center",
                          active ? "text-primary font-semibold" : "text-foreground/80",
                        )}
                      >
                        {s.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right: products */}
        <section className="min-w-0 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="font-display text-lg sm:text-xl font-bold">
              {activeSub?.name ?? activeCategory?.name ?? "Products"}
            </h1>
            <span className="text-xs text-muted-foreground">{products.length} items</span>
          </div>
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[240px] rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              No products available in this section yet.
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  p={p}
                  detailTo={`/shop/products/${encodeURIComponent(p.id)}`}
                  onAdd={() => {
                    const { sell } = readPrice(p.price ?? undefined);
                    void addItem({
                      productId: String(p.id),
                      name: p.name,
                      media_url: p.media_url,
                      image: p.media_url,
                      unitPrice: sell,
                      quantity: 1,
                    });
                    toast.success(`${p.name} added to cart`);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}