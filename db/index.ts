import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "@/db/schema/index";

export const sqlite = openDatabaseSync("dex.db", {
  enableChangeListener: true,
});

export const db = drizzle(sqlite, {
  logger: true,
  schema: schema,
  casing: "snake_case",
});
