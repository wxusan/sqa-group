import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { config as loadDotenv } from "dotenv";

loadEnvConfig(process.cwd());
loadDotenv({ path: ".env.e2e.local", override: true, quiet: true });

// Browser tests perform real admin mutations. They must never inherit the
// regular local database by accident; point them to a dedicated disposable DB.
const e2eDatabaseUrl = process.env.DATABASE_URL_E2E;
if (e2eDatabaseUrl) process.env.DATABASE_URL = e2eDatabaseUrl;
const databaseUrl = process.env.DATABASE_URL ?? "";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm start",
        port: 3000,
        // Always launch a test server with the dedicated audit DB settings.
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          // Browser tests intentionally use the local adapter against a
          // disposable local database, never the production Blob store.
          MEDIA_STORAGE: "local",
        },
      },
});
