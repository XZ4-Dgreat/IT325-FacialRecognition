import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/IT325-FacialRecognition/", // CRITICAL for GitHub Pages
});
