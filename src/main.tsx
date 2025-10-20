import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@mantine/core/styles.css"; 
import "@mantine/dates/styles.css"; 
import "mantine-react-table/styles.css"; 
import { CartProvider } from "@/context/CartContext";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
