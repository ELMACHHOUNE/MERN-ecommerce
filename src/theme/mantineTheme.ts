import { createTheme } from "@mantine/core";

// Map provided palette to Mantine theme
// Primary brand -> #008A97 (teal)
export const mantineTheme = createTheme({
  primaryColor: "brand",
  colors: {
    brand: [
      "#E0F2F4", // 0 - very light tint (approximate)
      "#C6EAED", // 1
      "#ACE1E6", // 2
      "#93D8DF", // 3
      "#79CFD8", // 4
      "#5FC6D1", // 5
      "#46BDC9", // 6
      "#2CB4C2", // 7
      "#12ABBB", // 8
      "#008A97", // 9 - base brand
    ],
  },
  defaultRadius: "md",
});

