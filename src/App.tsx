import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Profile from "./pages/Profile";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import RequireAuth from "@/routes/RequireAuth";
import Admin from "./pages/Admin";
import RequireAdmin from "@/routes/RequireAdmin";
import { MantineProvider } from "@mantine/core";
import { mantineTheme } from "./theme/mantineTheme";
import Categories from "./pages/Categories";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Sync Mantine theme with Tailwind dark mode
    const updateColorScheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setColorScheme(isDark ? "dark" : "light");
    };

    updateColorScheme();

    const observer = new MutationObserver(updateColorScheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={colorScheme}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route
                        path="/profile"
                        element={
                          <RequireAuth>
                            <Profile />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <RequireAdmin>
                            <Admin />
                          </RequireAdmin>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default App;
