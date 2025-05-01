import type { Config } from "drizzle-kit";

export default {
  strict: true,
  driver: "expo",
  dialect: "sqlite",
  casing: "snake_case",
  out: "./db/migrations",
  schema: "./db/schema/index.ts",
  verbose: process.env.NODE_ENV === "development",
} satisfies Config;
