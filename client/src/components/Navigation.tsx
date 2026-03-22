import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, PlusCircle, Menu, FileText, Home, Briefcase, DollarSign } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function Avatar({ name, role }: { name?: string; role?: string }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold select-none">
      {initials}
    </div>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const isProvider = profile?.role === "contractor";
  const isHomeowner = profile?.role === "homeowner";
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.email ?? "Account";

  const navLinks = isHomeowner ? [
    { href: "/dashboard", label: "My Jobs", icon: LayoutDashboard },
    { href: "/create-request", label: "Post a Job", icon: PlusCircle },
    { href: "/invoices", label: "Invoices", icon: FileText },
  ] : isProvider ? [
    { href: "/dashboard", label: "Find Work", icon: Briefcase },
    { href: "/invoices", label: "Earnings", icon: DollarSign },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 font-display font-bold text-xl cursor-pointer" data-testid="link-logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span>DOMO</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <Button
              onClick={() => (window.location.href = "/api/login")}
              className="rounded-xl"
              data-testid="button-login"
            >
              Login / Sign Up
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none" data-testid="button-user-menu">
                  <Avatar name={displayName} role={profile?.role} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{displayName}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {profile?.role === "contractor" ? "Service Provider" : profile?.role ? "Property Owner" : "User"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer rounded-lg">Profile Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive cursor-pointer rounded-lg"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-6">
                <div className="flex items-center gap-2 font-display font-bold text-xl">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <span>DOMO</span>
                </div>

                {isAuthenticated && (
                  <div className="flex items-center gap-3 px-2">
                    <Avatar name={displayName} />
                    <div>
                      <div className="font-semibold text-sm">{displayName}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {profile?.role === "contractor" ? "Service Provider" : "Property Owner"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                          location === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-auto">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => logout()}
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-xl"
                      onClick={() => (window.location.href = "/api/login")}
                      data-testid="button-mobile-login"
                    >
                      Login / Sign Up
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
