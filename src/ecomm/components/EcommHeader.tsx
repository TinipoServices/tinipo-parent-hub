import { Link, useLocation as useRouterLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Menu, Store, Package, LogIn, LogOut, User, MapPin, Search, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import { useCart } from "../context/CartContext";
import { useShopAuth } from "../context/ShopAuthContext";
import { useLocation as useShopLocation } from "../context/LocationContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const nav = [
  { to: "/shop/products", label: "Products", icon: Store },
  { to: "/shop/orders", label: "Orders", icon: Package },
];

export function EcommHeader() {
  const { itemCount } = useCart();
  const { user, signOut } = useShopAuth();
  const { location, openModal } = useShopLocation();
  const navigate = useNavigate();
  const loc = useRouterLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchInput(searchParams.get("q") ?? "");
  }, [searchParams]);

  const goCheckout = () => navigate("/shop/checkout");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const q = searchInput.trim();
    if (q) next.set("q", q);
    else next.delete("q");
    if (loc.pathname.startsWith("/shop/products")) {
      setSearchParams(next);
    } else {
      navigate(`/shop/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur-md shadow-card">
      <div className="container-custom flex h-14 sm:h-16 items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-2rem,320px)]">
              <SheetHeader>
                <SheetTitle className="text-left">Shop menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {nav.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      loc.pathname.startsWith(to)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                ))}
                <Link
                  to="/shop/sign-in"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground/80 hover:bg-muted"
                >
                  <LogIn className="h-5 w-5 shrink-0" />
                  {user ? "Account" : "Sign in"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/shop/products" className="flex items-center gap-2 min-w-0 group">
            <img src={logo} alt="" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
            <span className="font-display font-bold text-lg sm:text-xl text-gradient-primary truncate hidden sm:inline">
              Tinipo
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={openModal}
          className={cn(
            "hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors max-w-[260px] text-left shrink-0",
            location?.serviceable === false
              ? "border-amber-400/60 bg-amber-50 hover:bg-amber-100 text-amber-900"
              : "border-border bg-card hover:bg-muted",
          )}
          aria-label="Change delivery location"
        >
          {location?.serviceable === false ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          ) : (
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
          )}
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Deliver to
            </p>
            <p className="text-xs font-semibold truncate">
              {location ? `${location.city || location.pincode}` : "Select location"}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>

        <form onSubmit={submitSearch} className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder='Search "diapers"…'
            className="pl-10 h-10 rounded-xl bg-muted/40 border-border/60"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search products"
          />
        </form>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={openModal}
            className="sm:hidden rounded-lg p-2 hover:bg-muted"
            aria-label="Change location"
          >
            <MapPin className={cn("h-5 w-5", location?.serviceable === false ? "text-amber-600" : "text-primary")} />
          </button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:inline-flex gap-2 max-w-[180px]">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">{user.phone}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/shop/sign-in">Account &amp; addresses</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop/orders">Order history</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="hidden md:inline-flex gap-1.5" asChild>
              <Link to="/shop/sign-in">Sign in</Link>
            </Button>
          )}

          <Button
            variant="default"
            className="h-10 gap-2 rounded-xl px-2.5 sm:px-4"
            onClick={goCheckout}
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            {itemCount > 0 ? (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-primary-foreground/20 px-1.5 text-xs font-bold tabular-nums">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
            <span className="font-semibold text-sm whitespace-nowrap hidden sm:inline">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
