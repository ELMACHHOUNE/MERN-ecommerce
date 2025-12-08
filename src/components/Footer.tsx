import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-primary/10 bg-white/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-bold text-primary font-display mb-4">
              {t("brand")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto md:mx-0">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-2 justify-center md:justify-start w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-primary hover:bg-primary/10"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-primary hover:bg-primary/10"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-primary hover:bg-primary/10"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4 text-foreground">
              {t("navbar.products")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground w-full">
              <li>
                <Link
                  to="/products"
                  className="hover:text-primary transition-colors block py-1"
                >
                  {t("button.viewAll")}
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="hover:text-primary transition-colors block py-1"
                >
                  {t("navbar.categories")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4 text-foreground">
              {t("cta.info")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground w-full">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors block py-1"
                >
                  {t("navbar.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors block py-1"
                >
                  {t("about.contact.title")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4 text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto md:mx-0">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>
            <div className="flex gap-2 justify-center md:justify-start w-full max-w-xs mx-auto md:mx-0">
              <Input
                placeholder="Enter your email"
                className="bg-white/50 border-primary/20 focus-visible:ring-primary"
              />
              <Button
                size="icon"
                className="bg-primary hover:bg-primary/90 shrink-0"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-primary/10 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {t("brand")}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
