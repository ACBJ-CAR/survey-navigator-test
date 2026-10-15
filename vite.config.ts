import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/survey-navigator-test/',
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost" } },
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});
