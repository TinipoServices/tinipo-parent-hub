import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../context/CartContext";
import { useShopAuth } from "../context/ShopAuthContext";
import { confirmOrder } from "../api/ecommApi";
import { formatInr } from "../lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function ShopCheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useShopAuth();
  const { lines, subtotal, setLineQuantity, removeLine, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const addressComplete =
    user &&
    user.address.line1.trim() &&
    user.address.city.trim() &&
    user.address.state.trim() &&
    user.address.pincode.trim();

  const handleConfirm = async () => {
    if (!user || !addressComplete) {
      toast.error("Please sign in with a complete delivery address.");
      return;
    }
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      await confirmOrder({
        lines: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
        address: user.address,
        payment_mode: "COD",
      });
      clear();
      await queryClient.invalidateQueries({ queryKey: ["ecomm", "orders"] });
      toast.success("Order placed (COD).");
      navigate("/shop/orders");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Sign in to checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We need your account and delivery address to confirm a cash-on-delivery order.
            </p>
            <Button asChild className="w-full">
              <Link to="/shop/sign-in?next=/shop/checkout">Go to sign in</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/shop/products">Continue shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!addressComplete) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Complete your address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Add a full delivery address before placing an order.</p>
            <Button asChild className="w-full">
              <Link to="/shop/sign-in?next=/shop/checkout">Update address</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground text-sm">Add items from the shop — your cart count updates in the header.</p>
        <Button asChild>
          <Link to="/shop/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground text-sm mt-1">Review items, delivery address, and confirm with COD.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {lines.map((line) => (
            <Card key={line.productId} className="overflow-hidden border-border">
              <CardContent className="p-4 sm:p-5 flex gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-muted shrink-0 overflow-hidden">
                  <img src={line.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold leading-snug line-clamp-2">{line.name}</h3>
                    <p className="text-primary font-bold mt-1">{formatInr(line.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setLineQuantity(line.productId, line.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium tabular-nums">{line.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setLineQuantity(line.productId, line.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      onClick={() => removeLine(line.productId)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="border-border shadow-card lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="font-display text-lg">Deliver to</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{user.name}</p>
              <p>{user.phone}</p>
              <p>
                {user.address.line1}
                {user.address.line2 ? `, ${user.address.line2}` : ""}
              </p>
              <p>
                {user.address.city}, {user.address.state} {user.address.pincode}
              </p>
              <Button variant="link" className="h-auto p-0 text-primary" asChild>
                <Link to="/shop/sign-in?next=/shop/checkout">Edit</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatInr(subtotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="font-display font-bold text-lg">Total</span>
                <span className="font-display font-bold text-2xl text-primary">{formatInr(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Payment: Cash on delivery (COD).</p>
              <Button className="w-full" size="lg" disabled={submitting} onClick={handleConfirm}>
                {submitting ? "Placing order…" : "Confirm order (COD)"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
