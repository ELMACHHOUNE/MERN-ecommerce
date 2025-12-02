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
    // Use Blush Pop as brand scale
    brand: [
      "#fee6f3", // 0
      "#fdcee7", // 1
      "#fc9ccf", // 2
      "#fa6bb7", // 3
      "#f9399f", // 4
      "#f70887", // 5
      "#c6066c", // 6
      "#940551", // 7
      "#630336", // 8
      "#31021b", // 9
    ],
  },
  defaultRadius: "md",
});

