import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <Navbar />
      <main className="flex-1 w-full max-w-full mx-auto pt-20">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};
