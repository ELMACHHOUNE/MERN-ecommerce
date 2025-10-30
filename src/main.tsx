import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";
import { BackgroundBoxes } from "./components/BackgroundBoxes";

// Theme initialization
const initTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Initialize theme before render
initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BackgroundBoxes>
      <App />
    </BackgroundBoxes>
  </StrictMode>
);
