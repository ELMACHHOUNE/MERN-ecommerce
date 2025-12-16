import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SocialSidebar } from "@/components/SocialSidebar";
import React from "react";
import { useLocation } from "react-router-dom";


interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isFullScreenPage =
    location.pathname === "/" || location.pathname === "/auth";

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <Navbar />
      <SocialSidebar />
      <main
        className={`flex-1 w-full max-w-full mx-auto ${
          isFullScreenPage ? "" : "pt-20"
        }`}
      >
        {children}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};
