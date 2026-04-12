import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, Store, Package, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { useCart } from "../context/CartContext";
import { useShopAuth } from "../context/ShopAuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/shop/products", label: "Products", icon: Store },
  { to: "/shop/orders", label: "Orders", icon: Package },
];

export function EcommHeader() {
  const { itemCount } = useCart();
  const { user, signOut } = useShopAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const goCheckout = () => navigate("/shop/checkout");

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur-md shadow-card">
      <div className="container-custom flex h-14 sm:h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
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
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-display font-bold text-lg sm:text-xl text-gradient-primary truncate">
                Tinipo Shop
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block truncate">
                Curated for little ones
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ to, label }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  className={cn(loc.pathname.startsWith(to) && "bg-primary/10 text-primary")}
                >
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 max-w-[200px]">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">{user.phone}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/shop/sign-in">Account &amp; address</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/shop/sign-in">Sign in</Link>
            </Button>
          )}

          <Button
            variant="default"
            className="h-10 gap-2 rounded-xl px-3 sm:px-4"
            onClick={goCheckout}
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            {itemCount > 0 ? (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-primary-foreground/20 px-1.5 text-xs font-bold tabular-nums">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
            <span className="font-semibold text-sm whitespace-nowrap">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
