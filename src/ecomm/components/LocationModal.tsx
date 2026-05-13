/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Search, Locate, AlertTriangle, CheckCircle2 } from "lucide-react";
import { loadGoogleMaps, getGoogleMapsApiKey } from "../lib/googleMaps";
import {
  extractFromComponents,
  extractPincodeFromComponents,
  isPinServiceable,
} from "../lib/serviceablePincodes";
import { useLocation } from "../context/LocationContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export function LocationModal() {
  const { isModalOpen, closeModal, setLocation } = useLocation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [manualPin, setManualPin] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const sessionTokenRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const hasKey = !!getGoogleMapsApiKey();

  useEffect(() => {
    if (!isModalOpen) {
      setQuery("");
      setSuggestions([]);
      setManualPin("");
      setWarning(null);
      return;
    }
    if (!hasKey) return;
    let cancelled = false;
    void loadGoogleMaps().then((g) => {
      if (cancelled || !g) return;
      autocompleteServiceRef.current = new g.maps.places.AutocompleteService();
      sessionTokenRef.current = new g.maps.places.AutocompleteSessionToken();
      const dummy = document.createElement("div");
      placesServiceRef.current = new g.maps.places.PlacesService(dummy);
    });
    return () => {
      cancelled = true;
    };
  }, [isModalOpen, hasKey]);

  useEffect(() => {
    if (!query.trim() || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query.trim(),
          componentRestrictions: { country: "in" },
          sessionToken: sessionTokenRef.current,
        },
        (preds: any[] | null) => {
          setLoading(false);
          setSuggestions(
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
    return () => clearTimeout(handle);
  }, [query]);

  const pickPlace = (place_id: string, fallbackDescription: string) => {
    if (!placesServiceRef.current) return;
    setResolving(true);
    placesServiceRef.current.getDetails(
      { placeId: place_id, fields: ["address_components", "formatted_address", "geometry"] },
      (place: any, status: string) => {
        setResolving(false);
        if (status !== "OK" || !place) {
          toast.error("Couldn't resolve that location.");
          return;
        }
        const pin = extractPincodeFromComponents(place.address_components);
        if (!pin) {
          setWarning(
            "We couldn't find a 6-digit PIN for this place — try a more specific address or enter the PIN manually.",
          );
          return;
        }
        const final = setLocation({
          pincode: pin,
          formatted_address: place.formatted_address ?? fallbackDescription,
          city: extractFromComponents(place.address_components, "locality"),
          state: extractFromComponents(place.address_components, "administrative_area_level_1"),
        });
        toast[final.serviceable ? "success" : "warning"](
          final.serviceable
            ? `Delivering to ${final.city || pin}.`
            : `Sorry — we don't deliver to ${pin} yet. You can still browse.`,
        );
      },
    );
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const d = manualPin.replace(/\D/g, "");
    if (d.length !== 6) {
      setWarning("Enter a valid 6-digit PIN.");
      return;
    }
    const final = setLocation({
      pincode: d,
      formatted_address: `PIN ${d}, India`,
    });
    toast[final.serviceable ? "success" : "warning"](
      final.serviceable ? `Delivering to PIN ${d}.` : `PIN ${d} is not serviceable yet.`,
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported in this browser.");
      return;
    }
    if (!hasKey) {
      toast.error("Google Maps key required for current-location lookup.");
      return;
    }
    setResolving(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const g = await loadGoogleMaps();
        if (!g) {
          setResolving(false);
          toast.error("Maps SDK failed to load.");
          return;
        }
        const geocoder = new g.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
          (results: any[] | null, status: string) => {
            setResolving(false);
            if (status !== "OK" || !results?.length) {
              toast.error("Could not detect your address.");
              return;
            }
            const r = results[0];
            const pin = extractPincodeFromComponents(r.address_components);
            if (!pin) {
              setWarning("Detected your area, but no PIN was returned. Please enter one manually.");
              return;
            }
            setLocation({
              pincode: pin,
              formatted_address: r.formatted_address,
              city: extractFromComponents(r.address_components, "locality"),
              state: extractFromComponents(r.address_components, "administrative_area_level_1"),
            });
          },
        );
      },
      (err) => {
        setResolving(false);
        toast.error(err.message || "Location permission denied.");
      },
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Your Location
          </DialogTitle>
          <DialogDescription>
            Pick a delivery address to see prices and serviceability.
          </DialogDescription>
        </DialogHeader>

        {!hasKey && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Address search disabled</AlertTitle>
            <AlertDescription className="text-xs">
              Add <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> as a Workspace Build Secret to enable
              autocomplete. You can still enter a PIN manually below.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search a new address"
              className="pl-10 h-11 rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!hasKey}
            />
          </div>

          {hasKey && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-12 rounded-xl"
              onClick={useCurrentLocation}
              disabled={resolving}
            >
              <Locate className="h-4 w-4 text-primary" />
              <span className="text-left">
                <span className="block font-semibold text-sm">Use my current location</span>
                <span className="block text-xs text-muted-foreground font-normal">
                  Enable browser location for faster checkout
                </span>
              </span>
            </Button>
          )}

          {(loading || suggestions.length > 0) && (
            <ul className="border border-border rounded-xl divide-y divide-border max-h-64 overflow-auto">
              {loading && (
                <li className="px-3 py-3 text-sm text-muted-foreground">Searching…</li>
              )}
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onClick={() => pickPlace(s.place_id, s.description)}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex items-start gap-3"
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="min-w-0">
                      <span className="block font-medium text-sm truncate">{s.main_text}</span>
                      <span className="block text-xs text-muted-foreground line-clamp-1">{s.secondary_text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submitManual} className="flex gap-2 pt-1">
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="…or enter 6-digit PIN"
              className="h-11 rounded-xl font-mono"
              value={manualPin}
              onChange={(e) => setManualPin(e.target.value)}
            />
            <Button type="submit" className="h-11 rounded-xl">
              Apply
            </Button>
          </form>

          {manualPin.length === 6 && (
            <p
              className={cn(
                "text-xs flex items-center gap-1.5 font-medium",
                isPinServiceable(manualPin) ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {isPinServiceable(manualPin) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {isPinServiceable(manualPin) ? "Serviceable PIN" : "Not in our delivery network yet"}
            </p>
          )}

          {warning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}