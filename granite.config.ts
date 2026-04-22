import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "prepayment-calculator",
  brand: {
    displayName: "중도금 선납 계산기",
    primaryColor: "#185FA5",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
