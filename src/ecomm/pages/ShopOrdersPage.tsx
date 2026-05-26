import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { listOrders } from "../api/orderApi";
import { formatInr, formatOrderDate, orderStatusLabel, orderStatusTone } from "../lib/format";
import { useShopAuth } from "../context/ShopAuthContext";
import { toNumber } from "../lib/money";
import { ChevronRight } from "lucide-react";

export default function ShopOrdersPage() {
  const { user } = useShopAuth();

  const ordersQuery = useQuery({
    queryKey: ["ecomm", "orders"],
    queryFn: listOrders,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Order history</h1>
        <p className="text-muted-foreground text-sm">Sign in to see your past orders.</p>
        <Button asChild>
          <Link to="/shop/sign-in?next=/shop/orders">Sign in</Link>
        </Button>
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Order history</h1>
        <p className="text-muted-foreground text-sm mt-1">Latest orders first.</p>
      </div>

      {ordersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <Card className="p-6 border-destructive/50 text-destructive text-sm">
          {(ordersQuery.error as Error).message}
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center border-dashed text-muted-foreground">
          No orders yet.{" "}
          <Link to="/shop/products" className="text-primary font-medium hover:underline">
            Start shopping
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const status = o.order_status ?? o.status;
            const payable = toNumber(o.payable_amount ?? o.total_amount);
            return (
              <li key={String(o.id)}>
                <Card className="border-border hover:shadow-card transition-shadow overflow-hidden">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {o.order_no ?? `#${o.id}`}
                        </span>
                        <Badge variant={orderStatusTone(status)}>{orderStatusLabel(status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatOrderDate(o.created_at)}</p>
                      <p className="font-display font-bold text-lg text-primary">{formatInr(payable)}</p>
                      {(o.total_items ?? o.line_count) != null && (
                        <p className="text-xs text-muted-foreground">{o.total_items ?? o.line_count} items</p>
                      )}
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto shrink-0" asChild>
                      <Link to={`/shop/orders/${encodeURIComponent(String(o.id))}`}>
                        Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
