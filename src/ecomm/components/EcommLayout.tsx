import { Link, Outlet } from "react-router-dom";
import { EcommHeader } from "./EcommHeader";
import { LocationModal } from "./LocationModal";

export function EcommLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 font-body">
      <EcommHeader />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <Outlet />
      </main>
      <LocationModal />
      <footer className="border-t border-border/60 bg-card/50 py-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="text-primary hover:underline font-medium">
          Back to Tinipo home
        </Link>
      </footer>
    </div>
  );
}
