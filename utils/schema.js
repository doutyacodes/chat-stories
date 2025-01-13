import {
  boolean,
  date,
  datetime,
  decimal,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

// UserDetails Table
export const USERS = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", {lenght: 255}).notNull(),
  // name: varchar("name", { length: 255 }).notNull(),
  // username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  // mobile: varchar("mobile", { length: 15 }).notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  // is_active: boolean("is_active").default(true),
});
