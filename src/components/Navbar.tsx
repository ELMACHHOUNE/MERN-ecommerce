import { ShoppingCart, User, Menu as MenuIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductSearchBox } from "@/components/ProductSearchBox";
import { Menu, MenuItem } from "@/components/ui/navbar-menu";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:block fixed top-4 inset-x-0 max-w-5xl mx-auto z-50">
        <Menu setActive={setActive}>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              onClick={() => setActive(null)}
              className="text-foreground dark:text-foreground"
            >
              <MenuItem setActive={setActive} active={active} item="Home" />
            </Link>
            <Link
              to="/products"
              onClick={() => setActive(null)}
              className="text-foreground dark:text-foreground"
            >
              <MenuItem setActive={setActive} active={active} item="Products" />
            </Link>
            <Link
              to="/categories"
              onClick={() => setActive(null)}
              className="text-foreground dark:text-foreground"
            >
              <MenuItem
                setActive={setActive}
                active={active}
                item="Categories"
              />
            </Link>
            <Link
              to="/about"
              onClick={() => setActive(null)}
              className="text-foreground dark:text-foreground"
            >
              <MenuItem setActive={setActive} active={active} item="About" />
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="w-64">
              <ProductSearchBox />
            </div>

            <AnimatedThemeToggler />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    My Account {user?.role === "admin" && "(Admin)"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Orders</Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </Menu>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-primary">
              ShopHub
            </Link>

            <div className="flex items-center gap-2">
              <AnimatedThemeToggler />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      My Account {user?.role === "admin" && "(Admin)"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">Orders</Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="pb-4 space-y-2">
              <div className="mb-3">
                <ProductSearchBox />
              </div>
              <Link
                to="/"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
