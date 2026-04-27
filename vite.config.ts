import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    cloudflare(),
    tanstackStart(),
    react(),
    {
      name: 'fix-tanstack-optimize-deps',
      config(config) {
        const exclude = [
          '@tanstack/start-server-core',
          '@tanstack/start-client-core'
        ];
        if (!config.optimizeDeps) config.optimizeDeps = {};
        if (!config.optimizeDeps.exclude) config.optimizeDeps.exclude = [];
        config.optimizeDeps.exclude.push(...exclude);

        // Ensure for Vite 6 environments
        if (!config.environments) config.environments = {};
        for (const envName in config.environments) {
          const env = config.environments[envName];
          if (!env.optimizeDeps) env.optimizeDeps = {};
          if (!env.optimizeDeps.exclude) env.optimizeDeps.exclude = [];
          env.optimizeDeps.exclude.push(...exclude);
        }
      },
      configResolved(config) {
        const exclude = [
          '@tanstack/start-server-core',
          '@tanstack/start-client-core'
        ];
        // After resolution, inject into actual environment configs mapping if available
        if (config.environments) {
          for (const envName in config.environments) {
            const env = config.environments[envName];
            if (!env.optimizeDeps) env.optimizeDeps = {};
            if (!env.optimizeDeps.exclude) env.optimizeDeps.exclude = [];
            env.optimizeDeps.exclude.push(...exclude);
          }
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core"
    ]
  }
});
