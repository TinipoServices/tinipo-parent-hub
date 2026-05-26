import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductDetail, productGallery } from "../api/ecommApi";
import { useCart } from "../context/CartContext";
import { useLocation as useShopLocation } from "../context/LocationContext";
import { formatInr } from "../lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ShopProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { location } = useShopLocation();
  const pincodeForApi = location?.pincode;
  const { addItem } = useCart();
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const detailQuery = useQuery({
    queryKey: ["ecomm", "product", productId, pincodeForApi ?? ""],
    queryFn: () => fetchProductDetail(productId!, pincodeForApi),
    enabled: !!productId,
  });

  const p = detailQuery.data;
  const gallery = useMemo(() => (p ? productGallery(p) : []), [p]);

  const mainSrc = gallery[activeIdx] ?? gallery[0];

  useEffect(() => {
    setActiveIdx(0);
    setQty(1);
  }, [p?.id]);

  const goPrev = () => setActiveIdx((i) => (i <= 0 ? gallery.length - 1 : i - 1));
  const goNext = () => setActiveIdx((i) => (i >= gallery.length - 1 ? 0 : i + 1));

  const addToCart = () => {
    if (!p) return;
    const sell = Number(
      p?.price?.selling_price ??
      p?.price?.mrp ??
      0
    );
    void addItem({
      productId: String(p.id),
      name: p.name,
      media_url: p.media_url,
      image: p.media_url,
      unitPrice: sell,
      quantity: qty,
    });
    toast.success(`${qty} × ${p.name} added to cart`);
    setQty(1);
  };

  if (!productId) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link to="/shop/products">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </Button>

      {location && (
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Prices for <span className="font-medium text-foreground">{location.city || location.pincode}</span>
        </div>
      )}

      {detailQuery.isLoading ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl max-w-xl mx-auto w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : detailQuery.isError ? (
        <Card className="p-6 border-destructive/50 text-destructive text-sm">
          {(detailQuery.error as Error).message}
        </Card>
      ) : !p ? null : (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 items-start">
          <div className="space-y-3 max-w-xl mx-auto w-full lg:mx-0">
            <div className="relative aspect-square rounded-2xl border border-border bg-muted overflow-hidden shadow-card">
              {mainSrc ? (
                <img src={mainSrc} alt="" className="absolute inset-0 w-full h-full object-contain bg-background" />
              ) : null}
              {gallery.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-md h-9 w-9"
                    onClick={goPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-md h-9 w-9"
                    onClick={goNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      "shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden bg-muted transition-all",
                      i === activeIdx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5 min-w-0">
            {/* <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">{p.name}</h1>
              {(() => {
                const sell = Number(p?.price?.selling_price ?? p.price.mrp);
                const hasDiscount = p.price.selling_price != null && p.price.selling_price < p.price.mrp;
                const pct = hasDiscount ? Math.round(((p.price.mrp - sell) / p.price.mrp) * 100) : 0;
                return (
                  <div className="mt-3 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-bold text-primary">{formatInr(sell)}</span>
                      {hasDiscount && (
                        <>
                          <span className="text-base text-muted-foreground line-through">{formatInr(p.price.mrp)}</span>
                          <span className="text-sm font-bold text-emerald-600">{pct}% off</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
                  </div>
                );
              })()}
            </div> */}

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {p?.name}
              </h1>

              {(() => {
                const mrp = Number(p?.price?.mrp ?? 0);

                const sellingPrice =
                  p?.price?.selling_price != null
                    ? Number(p.price.selling_price)
                    : null;

                const sell = sellingPrice ?? mrp;

                const hasDiscount =
                  sellingPrice != null &&
                  sellingPrice < mrp;

                const pct =
                  hasDiscount && mrp > 0
                    ? Math.round(((mrp - sell) / mrp) * 100)
                    : 0;

                return (
                  <div className="mt-3 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-bold text-primary">
                        {formatInr(sell)}
                      </span>

                      {hasDiscount && (
                        <>
                          <span className="text-base text-muted-foreground line-through">
                            {formatInr(mrp)}
                          </span>

                          <span className="text-sm font-bold text-emerald-600">
                            {pct}% off
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Inclusive of all taxes
                    </p>
                  </div>
                );
              })()}
            </div>

            <Card className="border-border">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <h2 className="font-display font-semibold text-base">About this item</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {p.product.description ?? "No description available for this product yet."}
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 border border-border rounded-xl px-2 py-1 bg-card">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty((q) => q + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="gap-2 min-w-[200px]" onClick={addToCart}>
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
