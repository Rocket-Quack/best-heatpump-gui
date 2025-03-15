import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/best-heatpump-gui/"  // Wichtig für GitHub Pages!
});
