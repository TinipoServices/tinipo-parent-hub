import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchOrderDetail } from "../api/ecommApi";
import { formatInr, formatOrderDate, orderStatusLabel } from "../lib/format";
import { useShopAuth } from "../context/ShopAuthContext";
import { ArrowLeft } from "lucide-react";

export default function ShopOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useShopAuth();

  const detailQuery = useQuery({
    queryKey: ["ecomm", "order", orderId],
    queryFn: () => fetchOrderDetail(orderId!),
    enabled: !!user && !!orderId,
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

  if (!orderId) {
    return null;
  }

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
      ) : !detailQuery.data ? null : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Order details</h1>
              <p className="font-mono text-xs text-muted-foreground mt-2">{detailQuery.data.id}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatOrderDate(detailQuery.data.created_at)}</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {orderStatusLabel(detailQuery.data.status)}
            </Badge>
          </div>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailQuery.data.lines.map((line) => (
                <div key={`${line.product_id}-${line.mrp}`} className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted shrink-0 overflow-hidden">
                    <img src={line.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-snug">{line.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatInr(line.mrp)} × {line.quantity}
                    </p>
                  </div>
                  <p className="font-semibold shrink-0">{formatInr(line.mrp * line.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Delivery &amp; payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="text-muted-foreground">
                <p>{detailQuery.data.address.line1}</p>
                {detailQuery.data.address.line2 ? <p>{detailQuery.data.address.line2}</p> : null}
                <p>
                  {detailQuery.data.address.city}, {detailQuery.data.address.state}{" "}
                  {detailQuery.data.address.pincode}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 max-w-sm">
                <span className="text-muted-foreground">Order amount</span>
                <span className="text-right font-medium">{formatInr(detailQuery.data.order_price_amount)}</span>
                <span className="text-muted-foreground">Discount</span>
                <span className="text-right font-medium">{formatInr(detailQuery.data.discount_amount)}</span>
                <span className="text-muted-foreground">Payable</span>
                <span className="text-right font-bold text-primary text-lg">
                  {formatInr(detailQuery.data.payable_amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Paid: {detailQuery.data.is_paid ? "Yes" : "No"} · Mode: {detailQuery.data.payment_mode}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
