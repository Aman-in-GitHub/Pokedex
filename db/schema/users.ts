import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text({ length: 256 }).notNull(),
  isMale: integer({ mode: "boolean" }).notNull(),
});

export default users;
