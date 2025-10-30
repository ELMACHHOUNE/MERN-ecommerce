import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";
import { BackgroundBoxes } from "./components/BackgroundBoxes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BackgroundBoxes>
      <App />
    </BackgroundBoxes>
  </StrictMode>
);
