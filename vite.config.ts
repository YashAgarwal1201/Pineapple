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

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const config = {
    plugins: [react(), tailwindcss()],
    base: "/",
    server: {
      port: 5373, // Change this to the desired port
    },
    assetsInclude: ["**/*.mov"],
  };

  return config;
});
