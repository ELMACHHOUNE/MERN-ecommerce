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
import RequireAuth from "@/routes/RequireAuth";
import Admin from "./pages/Admin";
import RequireAdmin from "@/routes/RequireAdmin";
import { MantineProvider } from "@mantine/core";
import { mantineTheme } from "./theme/mantineTheme";
import Categories from "./pages/Categories";
// removed dark/light sync imports
import { AppLayout } from "@/components/layout/AppLayout";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => {
  return (
    <MantineProvider theme={mantineTheme}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/about" element={<About />} />
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
                </AppLayout>
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
