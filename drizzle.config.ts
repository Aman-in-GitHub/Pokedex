import type { Config } from "drizzle-kit";

export default {
  strict: true,
  verbose: true,
  driver: "expo",
  dialect: "sqlite",
  casing: "snake_case",
  out: "./db/migrations",
  schema: "./db/schema/index.ts",
} satisfies Config;
