import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star, Check, X } from "lucide-react";
import { useShopAuth } from "../context/ShopAuthContext";
import type { CustomerAddress } from "../types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const empty = (): CustomerAddress => ({
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
});

function validate(a: CustomerAddress): string | null {
  if (!a.line1.trim()) return "Address line 1 is required.";
  if (!a.city.trim()) return "City is required.";
  if (!a.state.trim()) return "State is required.";
  if (!/^\d{6}$/.test(a.pincode.replace(/\D/g, ""))) return "PIN code must be 6 digits.";
  return null;
}

export function AddressBook({
  selectable,
  selectedId,
  onSelect,
}: {
  selectable?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress } = useShopAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomerAddress>(empty());
  const [creating, setCreating] = useState(false);

  if (!user) return null;
  const addresses = user.addresses ?? [user.address];

  const startEdit = (a: CustomerAddress) => {
    setEditingId(a.id ?? null);
    setCreating(false);
    setDraft({ ...a });
  };

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setDraft(empty());
  };

  const cancel = () => {
    setEditingId(null);
    setCreating(false);
    setDraft(empty());
  };

  const save = () => {
    const err = validate(draft);
    if (err) {
      toast.error(err);
      return;
    }
    if (creating) {
      addAddress(draft);
      toast.success("Address added.");
    } else if (editingId) {
      updateAddress(editingId, draft);
      toast.success("Address updated.");
    }
    cancel();
  };

  const Form = (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ab-label">Label</Label>
          <Input
            id="ab-label"
            placeholder="Home, Office, Mom's place…"
            value={draft.label ?? ""}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ab-l1">Address line 1</Label>
          <Input id="ab-l1" value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ab-l2">Address line 2 (optional)</Label>
          <Input id="ab-l2" value={draft.line2 ?? ""} onChange={(e) => setDraft({ ...draft, line2: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-city">City</Label>
          <Input id="ab-city" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-state">State</Label>
          <Input id="ab-state" value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-pin">PIN code</Label>
          <Input
            id="ab-pin"
            inputMode="numeric"
            maxLength={6}
            value={draft.pincode}
            onChange={(e) => setDraft({ ...draft, pincode: e.target.value.replace(/\D/g, "") })}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" onClick={save} className="gap-1.5">
          <Check className="h-4 w-4" />
          {creating ? "Add address" : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={cancel} className="gap-1.5">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-base">Saved addresses</h3>
        {!creating && (
          <Button size="sm" variant="outline" onClick={startCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add new
          </Button>
        )}
      </div>

      {creating && Form}

      <div className="space-y-2">
        {addresses.map((a) => {
          const isEditing = editingId && a.id === editingId;
          if (isEditing) return <div key={a.id}>{Form}</div>;
          const isSelected = selectable && selectedId === a.id;
          return (
            <Card
              key={a.id}
              className={cn(
                "border transition-all",
                isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
                selectable && "cursor-pointer hover:border-primary/40",
              )}
              onClick={selectable ? () => a.id && onSelect?.(a.id) : undefined}
            >
              <CardContent className="p-3 sm:p-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm">{a.label || "Address"}</span>
                    {a.is_default && (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0 gap-1 text-[10px]">
                        <Star className="h-3 w-3 fill-current" /> Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    <br />
                    {a.city}, {a.state} {a.pincode}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {!a.is_default && a.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultAddress(a.id!);
                        }}
                      >
                        Make default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(a);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    {addresses.length > 1 && a.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAddress(a.id!);
                          toast.success("Address removed.");
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}