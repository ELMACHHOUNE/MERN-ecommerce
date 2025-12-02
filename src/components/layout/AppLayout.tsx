import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen py-20 flex flex-col  text-foreground">
      <Navbar />
      <main className="flex-1 w-full bg-muted-foreground/40 max-w-full m-4 mx-auto  py-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};
