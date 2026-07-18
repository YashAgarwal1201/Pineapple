import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const keyPath = path.resolve(process.cwd(), "certs/localhost+3-key.pem");
  const certPath = path.resolve(process.cwd(), "certs/localhost+3.pem");

  const hasLocalCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

  return {
    plugins: [react(), tailwindcss()],

    base: "/",

    assetsInclude: ["**/*.mov"],

    server:
      command === "serve"
        ? {
            host: true,
            port: 5373,

            https: hasLocalCerts
              ? {
                  key: fs.readFileSync(keyPath),
                  cert: fs.readFileSync(certPath),
                }
              : undefined,
          }
        : undefined,
  };
});
