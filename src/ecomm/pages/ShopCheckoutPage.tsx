import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "../context/CartContext";
import { useShopAuth } from "../context/ShopAuthContext";
import { useLocation as useShopLocation } from "../context/LocationContext";
import { listAddresses } from "../api/addressApi";
import { createOrder } from "../api/orderApi";
import { formatInr } from "../lib/format";
import { Minus, Plus, Trash2, MapPin, AlertTriangle, Wallet, Banknote } from "lucide-react";
import { AddressBook } from "../components/AddressBook";
import { loadRazorpayScript, openRazorpayCheckout, getRazorpayKeyId } from "../lib/razorpay";
import { isPinServiceable } from "../lib/serviceablePincodes";

export default function ShopCheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useShopAuth();
  const { openModal } = useShopLocation();
  const { lines, subtotal, setLineQuantity, removeLine, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"COD" | "ONLINE">("COD");
  const [editingAddresses, setEditingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const addressesQuery = useQuery({
    queryKey: ["ecomm", "addresses"],
    queryFn: listAddresses,
    enabled: !!user,
  });

  const addresses = addressesQuery.data ?? [];
  const selectedAddress =
    addresses.find((a) => Number(a.id) === selectedAddressId) ??
    addresses.find((a) => a.is_default) ??
    addresses[0];

  useEffect(() => {
    if (selectedAddressId == null && addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      if (def?.id != null) setSelectedAddressId(Number(def.id));
    }
    void loadRazorpayScript();
  }, [addresses, selectedAddressId]);

  const deliveryPin =
    selectedAddress?.pincode == null ? "" : String(selectedAddress.pincode).replace(/\D/g, "");
  const serviceable = isPinServiceable(deliveryPin);

  const addressComplete =
    !!selectedAddress &&
    !!String(selectedAddress.line1 ?? "").trim() &&
    !!String(selectedAddress.city ?? "").trim() &&
    !!String(selectedAddress.state ?? "").trim() &&
    deliveryPin.length === 6;

  const placeOrder = async (extra?: { payment_id?: string }) => {
    if (!user || !selectedAddress || selectedAddress.id == null) {
      toast.error("Please sign in and pick a delivery address.");
      return;
    }
    if (!addressComplete) {
      toast.error("Selected address is missing details.");
      return;
    }
    if (!serviceable) {
      toast.error(`PIN ${deliveryPin} isn't serviceable yet.`);
      return;
    }
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder({ address_id: Number(selectedAddress.id) });
      await clear();
      await queryClient.invalidateQueries({ queryKey: ["ecomm", "orders"] });
      toast.success(
        paymentMode === "COD"
          ? "Order placed (Cash on delivery)."
          : `Payment received${extra?.payment_id ? ` (${extra.payment_id})` : ""}. Order confirmed.`,
      );
      navigate("/shop/orders");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (paymentMode === "COD") {
      await placeOrder();
      return;
    }
    if (!getRazorpayKeyId()) {
      toast.error("Online payment unavailable — VITE_RAZORPAY_KEY_ID isn't set.");
      return;
    }
    if (!user || !selectedAddress) return;
    setSubmitting(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Could not load Razorpay.");
      const result = await openRazorpayCheckout({
        amountInPaise: Math.round(subtotal * 100),
        name: "Tinipo",
        description: `${lines.length} item${lines.length === 1 ? "" : "s"}`,
        prefill: { name: user.name, contact: String(user.phone_no ?? user.phone ?? "") },
        notes: { pincode: deliveryPin },
      });
      await placeOrder({ payment_id: result.razorpay_payment_id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed.");
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
              We need your account and a delivery address to place the order.
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

  if (lines.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Your cart is empty</h1>
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
        <p className="text-muted-foreground text-sm mt-1">Review items, choose address & payment, then confirm.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {lines.map((line) => (
            <Card key={line.productId} className="overflow-hidden border-border">
              <CardContent className="p-4 sm:p-5 flex gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-muted shrink-0 overflow-hidden">
                  <img src={line.media_url || line.image || ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold leading-snug line-clamp-2">{line.name}</h3>
                    <p className="text-primary font-bold mt-1">{formatInr(line.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setLineQuantity(line.productId, line.quantity - 1)} aria-label="Decrease quantity">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium tabular-nums">{line.quantity}</span>
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setLineQuantity(line.productId, line.quantity + 1)} aria-label="Increase quantity">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeLine(line.productId)} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {editingAddresses && (
            <Card className="border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="font-display text-lg">Change address</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setEditingAddresses(false)}>Done</Button>
              </CardHeader>
              <CardContent>
                <AddressBook
                  selectable
                  selectedId={selectedAddressId}
                  onSelect={(id) => setSelectedAddressId(id)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-border shadow-card lg:sticky lg:top-24">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Deliver to
              </CardTitle>
              <Button size="sm" variant="link" className="h-auto p-0" onClick={() => setEditingAddresses((v) => !v)}>
                {editingAddresses ? "Hide" : "Change"}
              </Button>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              {selectedAddress ? (
                <>
                  <p className="font-medium text-foreground">
                    {user.name}{selectedAddress.label ? ` · ${selectedAddress.label}` : ""}
                  </p>
                  <p>{String(user.phone_no ?? user.phone ?? "")}</p>
                  <p>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}</p>
                  <p>{selectedAddress.city}, {selectedAddress.state} {deliveryPin}</p>
                </>
              ) : (
                <p>No address selected. <button type="button" className="text-primary underline" onClick={() => setEditingAddresses(true)}>Add one</button> to continue.</p>
              )}
              {selectedAddress && !serviceable && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-amber-900 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    PIN {deliveryPin || "—"} isn't serviceable.{" "}
                    <button type="button" onClick={openModal} className="underline font-semibold">Pick another</button>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMode} onValueChange={(v) => setPaymentMode(v as "COD" | "ONLINE")} className="grid gap-2">
                <Label htmlFor="pm-cod" className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="COD" id="pm-cod" />
                  <Banknote className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cash on delivery</span>
                </Label>
                {getRazorpayKeyId() ? (
                  <Label htmlFor="pm-online" className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value="ONLINE" id="pm-online" />
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Pay online (Razorpay)</span>
                  </Label>
                ) : (
                  <p className="mt-2 text-xs text-amber-700">
                    Add <code className="font-mono">VITE_RAZORPAY_KEY_ID</code> as a build secret to enable online payments.
                  </p>
                )}
              </RadioGroup>
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
              <Button className="w-full" size="lg" disabled={submitting || !addressComplete || !serviceable} onClick={handleConfirm}>
                {submitting
                  ? paymentMode === "ONLINE" ? "Processing payment…" : "Placing order…"
                  : paymentMode === "COD" ? "Place order (COD)" : `Pay ${formatInr(subtotal)} & confirm`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
