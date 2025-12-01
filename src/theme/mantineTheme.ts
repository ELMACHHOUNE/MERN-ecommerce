import { createTheme } from "@mantine/core";

// Strong Cyan palette mapped to Mantine's 0-9 scale (exclude 950)
export const mantineTheme = createTheme({
  primaryColor: "brand",
  fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  headings: {
    fontFamily: "BucklaneScript, 'Segoe Script', 'Brush Script MT', cursive",
    fontWeight: "700",
  },
  colors: {
    brand: [
      "#eaf9fb", // 0
      "#d4f3f7", // 1
      "#aae7ee", // 2
      "#7fdce6", // 3
      "#55d0dd", // 4
      "#2ac4d5", // 5 (base mid)
      "#229daa", // 6
      "#197680", // 7
      "#114e55", // 8
      "#08272b", // 9 (deep)
    ],
  },
  defaultRadius: "md",
});

