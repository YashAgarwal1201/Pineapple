// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   server: {
//     port: 5373, // Change this to the desired port
//   },
//   plugins: [react()],
//   base: "/Pineapple/",
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    // base: command === "serve" ? "/" : "/Pineapple/", // Set base dynamically
    base: "/",
    server: {
      port: 5373, // Change this to the desired port
    },
  };

  return config;
});
