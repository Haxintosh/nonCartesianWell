import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/nonCartesianWell/",
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        waveSim: "./src/waveSimulator/index.html",
        gravityAssist: "./src/gravityAssist/index.html",
        shapesGalore: "./src/shapesGalore/index.html",
      },
      // external: ["./src/js/external/js-colormap.js"],
    },
  },
});
