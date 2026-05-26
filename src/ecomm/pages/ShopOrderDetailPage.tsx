import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cancelOrder, getOrder } from "../api/orderApi";
import { formatInr, formatOrderDate, orderStatusLabel, orderStatusTone } from "../lib/format";
import { useShopAuth } from "../context/ShopAuthContext";
import { toNumber } from "../lib/money";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CANCELLABLE = new Set(["placed", "created", "packed", "pending"]);

export default function ShopOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useShopAuth();
  const qc = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ["ecomm", "order", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!user && !!orderId,
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelOrder(orderId!),
    onSuccess: () => {
      toast.success("Order cancelled.");
      qc.invalidateQueries({ queryKey: ["ecomm", "order", orderId] });
      qc.invalidateQueries({ queryKey: ["ecomm", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4">
        <p className="text-muted-foreground text-sm">Sign in to view this order.</p>
        <Button asChild>
          <Link to={`/shop/sign-in?next=/shop/orders/${orderId ?? ""}`}>Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!orderId) return null;

  const d = detailQuery.data;
  const status = d?.order_status ?? d?.status;
  const canCancel = !!status && CANCELLABLE.has(String(status).toLowerCase());
  const lines = d?.order_lines ?? [];
  const subtotal = toNumber(d?.total_amount);
  const discount = toNumber(d?.discount_amount);
  const tax = toNumber(d?.tax_amount);
  const payable = toNumber(d?.payable_amount);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link to="/shop/orders">
          <ArrowLeft className="h-4 w-4" />
          All orders
        </Link>
      </Button>

      {detailQuery.isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : detailQuery.isError ? (
        <Card className="p-6 border-destructive/50 text-destructive text-sm">
          {(detailQuery.error as Error).message}
        </Card>
      ) : !d ? null : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Order details</h1>
              <p className="font-mono text-xs text-muted-foreground mt-2">{d.order_no ?? `#${d.id}`}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatOrderDate(d.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={orderStatusTone(status)} className="text-sm">
                {orderStatusLabel(status)}
              </Badge>
              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Cancel this order?")) cancelMut.mutate();
                  }}
                  disabled={cancelMut.isPending}
                >
                  Cancel order
                </Button>
              )}
            </div>
          </div>

          {lines.length > 0 && (
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lines.map((line) => (
                  <div key={line.id} className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-snug">{line.product_name}</p>
                      {line.variant_name && (
                        <p className="text-xs text-muted-foreground">{line.variant_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatInr(toNumber(line.unit_price))} × {line.quantity}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">{formatInr(toNumber(line.final_amount))}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(d.shipping_address_line_1 || d.address) && (
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Delivery</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {d.shipping_name && <p className="font-medium text-foreground">{d.shipping_name}</p>}
                {d.shipping_phone && <p>{d.shipping_phone}</p>}
                <p>{d.shipping_address_line_1 ?? d.address?.line1}</p>
                {(d.shipping_address_line_2 ?? d.address?.line2) && (
                  <p>{d.shipping_address_line_2 ?? d.address?.line2}</p>
                )}
                <p>
                  {d.shipping_city ?? d.address?.city}
                  {d.shipping_state ?? d.address?.state ? `, ${d.shipping_state ?? d.address?.state}` : ""}{" "}
                  {d.shipping_pincode ?? (d.address?.pincode ?? "")}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="grid grid-cols-2 gap-2 max-w-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-right font-medium">{formatInr(subtotal)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-right font-medium">-{formatInr(discount)}</span>
                  </>
                )}
                {tax > 0 && (
                  <>
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-right font-medium">{formatInr(tax)}</span>
                  </>
                )}
                <Separator className="col-span-2" />
                <span className="font-display font-semibold">Total</span>
                <span className="text-right font-bold text-primary text-lg">{formatInr(payable)}</span>
              </div>
              {d.payment_status && (
                <p className="text-xs text-muted-foreground pt-1">Payment: {d.payment_status}</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
