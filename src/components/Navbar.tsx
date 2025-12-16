import {
  ShoppingCart,
  User,
  Menu as MenuIcon,
  LogOut,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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
// Theme toggler removed for fixed color scheme
import i18n from "i18next";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:block fixed top-2 inset-x-0 max-w-5xl mx-auto z-50">
        <Menu setActive={setActive}>
          <div className="flex items-center gap-4">
            {/* Brand logo */}
            <Link
              to="/"
              onClick={() => setActive(null)}
              className="flex items-center gap-2"
            >
              <img
                src="/flour.webp"
                alt="Keni Sweet Flowers Logo"
                className="h-8 w-8 rounded-full object-contain"
                width="32"
                height="32"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </Link>
            <Link
              to="/"
              onClick={() => setActive(null)}
              className="text-foreground"
              aria-label={t("navbar.home")}
            >
              <MenuItem
                setActive={setActive}
                active={active}
                item={t("navbar.home")}
              />
            </Link>
            <Link
              to="/products"
              onClick={() => setActive(null)}
              className="text-foreground"
              aria-label={t("navbar.products")}
            >
              <MenuItem
                setActive={setActive}
                active={active}
                item={t("navbar.products")}
              />
            </Link>
            <Link
              to="/categories"
              onClick={() => setActive(null)}
              className="text-foreground"
              aria-label={t("navbar.categories")}
            >
              <MenuItem
                setActive={setActive}
                active={active}
                item={t("navbar.categories")}
              />
            </Link>
            <Link
              to="/about"
              onClick={() => setActive(null)}
              className="text-foreground"
              aria-label={t("navbar.about")}
            >
              <MenuItem
                setActive={setActive}
                active={active}
                item={t("navbar.about")}
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="w-64">
              <ProductSearchBox />
            </div>

            {/* Theme toggler removed */}

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Language"
                  aria-label="Select Language"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card/95 backdrop-blur border shadow-md"
              >
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => i18n.changeLanguage("fr")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage("ar")}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User Account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card/95 backdrop-blur border shadow-md"
                >
                  <DropdownMenuLabel>
                    {t("navbar.account")}{" "}
                    {user?.role === "admin" && t("navbar.admin")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t("navbar.profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">{t("navbar.orders")}</Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">{t("navbar.adminDashboard")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("navbar.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" aria-label="Login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/wishlist" aria-label="Wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blush-pop-500 text-white text-xs flex items-center justify-center font-medium">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/cart" aria-label="Shopping Cart">
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
            <Link to="/" className="flex items-center">
              <img
                src="/flour.webp"
                alt="logo"
                className="h-8 w-8 rounded-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* Language Toggle (mobile) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Language"
                    aria-label="Select Language"
                  >
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card/95 backdrop-blur border shadow-md"
                >
                  <DropdownMenuLabel>Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("fr")}>
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage("ar")}>
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="User Account"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card/95 backdrop-blur border shadow-md"
                  >
                    <DropdownMenuLabel>
                      {t("navbar.account")}{" "}
                      {user?.role === "admin" && t("navbar.admin")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t("navbar.profile")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">{t("navbar.orders")}</Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">{t("navbar.adminDashboard")}</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("navbar.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" aria-label="Login">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              <Link to="/wishlist" aria-label="Wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blush-pop-500 text-white text-xs flex items-center justify-center font-medium">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/cart" aria-label="Shopping Cart">
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
                aria-label="Toggle Mobile Menu"
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
                {t("navbar.home")}
              </Link>
              <Link
                to="/products"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("navbar.products")}
              </Link>
              <Link
                to="/categories"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("navbar.categories")}
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 hover:bg-accent/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("navbar.about")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
