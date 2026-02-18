import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  LayoutDashboard, 
  LogOut, 
  PlusCircle, 
  User, 
  Menu,
  FileText,
  Search
} from "lucide-react";
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

export function Navigation() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const isProvider = profile?.role === "contractor";
  const isHomeowner = profile?.role === "homeowner";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: isAuthenticated },
    { href: "/create-request", label: "Post Request", icon: PlusCircle, show: isHomeowner },
    { href: "/find-leads", label: "Find Leads", icon: Search, show: isProvider },
    { href: "/invoices", label: "Invoices", icon: FileText, show: isAuthenticated },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-primary cursor-pointer" data-testid="link-logo">
            <Building2 className="w-6 h-6" />
            <span>Domo</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            link.show && (
              <Link key={link.href} href={link.href}>
                <span 
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === link.href ? "text-primary" : "text-muted-foreground"}`}
                >
                  {link.label}
                </span>
              </Link>
            )
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <Button onClick={() => window.location.href = "/api/login"} variant="default" data-testid="button-login">
              Login / Sign Up
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.firstName || "My Account"}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {profile?.role === "contractor" ? "Service Provider" : profile?.role || "User"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer" data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-6">
                <Link href="/">
                  <div className="flex items-center gap-2 font-display font-bold text-xl text-primary" onClick={() => setIsOpen(false)}>
                    <Building2 className="w-6 h-6" />
                    <span>Domo</span>
                  </div>
                </Link>
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    link.show && (
                      <Link key={link.href} href={link.href}>
                        <div 
                          className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <link.icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </div>
                      </Link>
                    )
                  ))}
                  {isAuthenticated && (
                    <Link href="/profile">
                      <div 
                        className="flex items-center gap-3 px-4 py-2 rounded-md text-muted-foreground hover:bg-muted cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </div>
                    </Link>
                  )}
                  {isAuthenticated ? (
                    <Button variant="destructive" className="w-full mt-4" onClick={() => logout()} data-testid="button-mobile-logout">
                      Logout
                    </Button>
                  ) : (
                    <Button className="w-full mt-4" onClick={() => window.location.href = "/api/login"} data-testid="button-mobile-login">
                      Login
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
