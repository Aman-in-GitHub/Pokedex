import type { Config } from "drizzle-kit";

export default {
  strict: true,
  driver: "expo",
  dialect: "sqlite",
  casing: "snake_case",
  out: "./db/migrations",
  schema: "./db/schema/index.ts",
  verbose: process.env.EXPO_PUBLIC_DB_LOGS === "true",
} satisfies Config;
