import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChartLine, 
  Home, 
  Lightbulb, 
  BarChart3, 
  History, 
  Wallet,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/predictions", label: "AI Predictions", icon: Lightbulb },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/history", label: "Bet History", icon: History },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location === "";
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-600 neon-glow">
              <ChartLine className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SportsBet Pro</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-primary font-medium border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Bankroll Display */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-success text-success-foreground px-4 py-2 rounded-lg font-semibold">
                <Wallet className="h-4 w-4" />
                <span>${parseFloat(user.bankroll).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gold to-yellow-500">
                  <span className="text-sm font-semibold text-gold-foreground">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{user.username}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-xs"
                >
                  Logout
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Bankroll */}
                  {user && (
                    <div className="flex items-center justify-between p-4 bg-success text-success-foreground rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4" />
                        <span className="font-semibold">
                          ${parseFloat(user.bankroll).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {/* Mobile User Info */}
                  {user && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-3 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gold to-yellow-500">
                          <span className="font-semibold text-gold-foreground">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              logout();
                              setMobileMenuOpen(false);
                            }}
                            className="h-auto p-0 text-xs text-muted-foreground"
                          >
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
