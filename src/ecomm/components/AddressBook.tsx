import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star, Check, X, MapPin, Search } from "lucide-react";
import { useShopAuth } from "../context/ShopAuthContext";
import type { AddressInput, CustomerAddress } from "../types";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress as apiUpdateAddress,
} from "../api/addressApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { loadGoogleMaps, getGoogleMapsApiKey } from "../lib/googleMaps";
import { extractFromComponents, extractPincodeFromComponents } from "../lib/serviceablePincodes";

/* eslint-disable @typescript-eslint/no-explicit-any */

const empty = (): AddressInput => ({
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone_no: "",
});

function validate(a: AddressInput): string | null {
  if (!a.line1 || !String(a.line1).trim()) return "Address line 1 is required.";
  if (!a.city || !String(a.city).trim()) return "City is required.";
  if (!a.state || !String(a.state).trim()) return "State is required.";
  const pin = String(a.pincode ?? "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(pin)) return "PIN code must be 6 digits.";
  return null;
}

function PlaceSearch({ onPick }: { onPick: (patch: Partial<AddressInput>) => void }) {
  const hasKey = !!getGoogleMapsApiKey();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<{ place_id: string; description: string; main_text: string; secondary_text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const autoRef = useRef<any>(null);
  const tokenRef = useRef<any>(null);
  const placesRef = useRef<any>(null);

  useEffect(() => {
    if (!hasKey) return;
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || !g) return;
      autoRef.current = new g.maps.places.AutocompleteService();
      tokenRef.current = new g.maps.places.AutocompleteSessionToken();
      placesRef.current = new g.maps.places.PlacesService(document.createElement("div"));
    });
    return () => {
      cancelled = true;
    };
  }, [hasKey]);

  useEffect(() => {
    if (!q.trim() || !autoRef.current) {
      setItems([]);
      return;
    }
    setLoading(true);
    const h = setTimeout(() => {
      autoRef.current.getPlacePredictions(
        { input: q.trim(), componentRestrictions: { country: "in" }, sessionToken: tokenRef.current },
        (preds: any[] | null) => {
          setLoading(false);
          setItems(
            (preds ?? []).map((p) => ({
              place_id: p.place_id,
              description: p.description,
              main_text: p.structured_formatting?.main_text ?? p.description,
              secondary_text: p.structured_formatting?.secondary_text ?? "",
            })),
          );
        },
      );
    }, 220);
    return () => clearTimeout(h);
  }, [q]);

  if (!hasKey) {
    return (
      <p className="text-xs text-muted-foreground">
        Set <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to enable address search.
      </p>
    );
  }

  const pick = (place_id: string) => {
    if (!placesRef.current) return;
    placesRef.current.getDetails(
      { placeId: place_id, fields: ["address_components", "formatted_address", "geometry"] },
      (place: any, status: string) => {
        if (status !== "OK" || !place) {
          toast.error("Couldn't resolve that place.");
          return;
        }
        const pin = extractPincodeFromComponents(place.address_components);
        onPick({
          line1: extractFromComponents(place.address_components, "route") || place.formatted_address || "",
          line2: extractFromComponents(place.address_components, "sublocality_level_1"),
          city:
            extractFromComponents(place.address_components, "locality") ||
            extractFromComponents(place.address_components, "administrative_area_level_2"),
          state: extractFromComponents(place.address_components, "administrative_area_level_1"),
          pincode: pin ?? "",
          latitude: place.geometry?.location?.lat?.() ?? null,
          longitude: place.geometry?.location?.lng?.() ?? null,
          full_address: place.formatted_address,
        });
        setQ("");
        setItems([]);
      },
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search address (Google)"
          className="pl-8 h-9"
        />
      </div>
      {(loading || items.length > 0) && (
        <ul className="border rounded-lg max-h-56 overflow-auto divide-y">
          {loading && <li className="px-3 py-2 text-xs text-muted-foreground">Searching…</li>}
          {items.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => pick(s.place_id)}
                className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-start gap-2 text-xs"
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="min-w-0">
                  <span className="block font-medium truncate">{s.main_text}</span>
                  <span className="block text-muted-foreground line-clamp-1">{s.secondary_text}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AddressBook({
  selectable,
  selectedId,
  onSelect,
}: {
  selectable?: boolean;
  selectedId?: number | string | null;
  onSelect?: (id: number) => void;
}) {
  const { user, syncAddresses } = useShopAuth();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<AddressInput>(empty());
  const [creating, setCreating] = useState(false);

  const addressesQuery = useQuery({
    queryKey: ["ecomm", "addresses"],
    queryFn: listAddresses,
    enabled: !!user,
  });

  useEffect(() => {
    if (addressesQuery.data) syncAddresses(addressesQuery.data);
  }, [addressesQuery.data, syncAddresses]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["ecomm", "addresses"] });

  const createMut = useMutation({
    mutationFn: (input: AddressInput) => createAddress(input),
    onSuccess: () => {
      toast.success("Address added.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: AddressInput }) => apiUpdateAddress(id, patch),
    onSuccess: () => {
      toast.success("Address updated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      toast.success("Address removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;

  const addresses = addressesQuery.data ?? [];

  const startEdit = (a: CustomerAddress) => {
    setEditingId(a.id != null ? Number(a.id) : null);
    setCreating(false);
    setDraft({
      label: a.label ?? "",
      line1: a.line1 ?? "",
      line2: a.line2 ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      pincode: a.pincode == null ? "" : String(a.pincode),
      phone_no: a.phone_no == null ? "" : String(a.phone_no),
      landmark: a.landmark ?? "",
      latitude: a.latitude ?? null,
      longitude: a.longitude ?? null,
      full_address: a.full_address ?? "",
      is_default: a.is_default ?? false,
    });
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

  const save = async () => {
    const err = validate(draft);
    if (err) {
      toast.error(err);
      return;
    }
    if (creating) {
      await createMut.mutateAsync(draft);
    } else if (editingId != null) {
      await updateMut.mutateAsync({ id: editingId, patch: draft });
    }
    cancel();
  };

  const setDefault = async (a: CustomerAddress) => {
    if (a.id == null) return;
    await updateMut.mutateAsync({ id: Number(a.id), patch: { is_default: true } });
  };

  const Form = (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:p-4">
      <PlaceSearch onPick={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ab-label">Label</Label>
          <Input
            id="ab-label"
            placeholder="Home, Office, Mom's place…"
            value={(draft.label as string) ?? ""}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ab-l1">Address line 1</Label>
          <Input id="ab-l1" value={(draft.line1 as string) ?? ""} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ab-l2">Address line 2 (optional)</Label>
          <Input id="ab-l2" value={(draft.line2 as string) ?? ""} onChange={(e) => setDraft({ ...draft, line2: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-city">City</Label>
          <Input id="ab-city" value={(draft.city as string) ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-state">State</Label>
          <Input id="ab-state" value={(draft.state as string) ?? ""} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-pin">PIN code</Label>
          <Input
            id="ab-pin"
            inputMode="numeric"
            maxLength={6}
            value={String(draft.pincode ?? "")}
            onChange={(e) => setDraft({ ...draft, pincode: e.target.value.replace(/\D/g, "") })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ab-phone">Phone (optional)</Label>
          <Input
            id="ab-phone"
            inputMode="numeric"
            value={String(draft.phone_no ?? "")}
            onChange={(e) => setDraft({ ...draft, phone_no: e.target.value.replace(/\D/g, "") })}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" onClick={save} className="gap-1.5" disabled={createMut.isPending || updateMut.isPending}>
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

      {addressesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading addresses…</p>
      ) : addresses.length === 0 && !creating ? (
        <Card className="border-dashed border-border p-4 text-sm text-muted-foreground">
          No addresses yet. Tap <strong>Add new</strong> to add one.
        </Card>
      ) : (
        <div className="space-y-2">
          {addresses.map((a) => {
            const id = a.id != null ? Number(a.id) : null;
            const isEditing = editingId != null && id === editingId;
            if (isEditing) return <div key={String(id)}>{Form}</div>;
            const isSelected = selectable && id != null && Number(selectedId) === id;
            return (
              <Card
                key={String(id)}
                className={cn(
                  "border transition-all",
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
                  selectable && "cursor-pointer hover:border-primary/40",
                )}
                onClick={selectable && id != null ? () => onSelect?.(id) : undefined}
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
                      {!a.is_default && id != null && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            void setDefault(a);
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
                      {id != null && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-destructive gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this address?")) deleteMut.mutate(id);
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
      )}
    </div>
  );
}
