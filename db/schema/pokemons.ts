import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const pokemons = sqliteTable("pokemons", {
  id: integer().primaryKey(),
  name: text({ length: 256 }).notNull(),
  description: text({ mode: "json" }).notNull(),
  generation: text().notNull(),
  cry: text().notNull(),
  legacyCry: text(),
  image: text().notNull(),
  shiny: text().notNull(),
  extraImages: text({ mode: "json" }),
  evolutions: text({ mode: "json" }).notNull(),
  types: text({ mode: "json" }).notNull(),
  height: integer().notNull(),
  weight: integer().notNull(),
  stats: text({ mode: "json" }).notNull(),
  color: text().notNull(),
  isUnlocked: integer({ mode: "boolean" }).notNull().default(false),
});

export default pokemons;
