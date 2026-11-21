import localFont from "next/font/local";

// Tipografías del mockup (archivos locales, licencia OFL en ./fuentes/LICENSE-OFL.txt).
export const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fuentes/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fuentes/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fuentes/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

export const jost = localFont({
  variable: "--font-jost",
  display: "swap",
  src: [
    { path: "./fuentes/jost-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fuentes/jost-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fuentes/jost-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});
