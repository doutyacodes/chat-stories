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
  email: varchar("email", {lenght: 255}).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const CATEGORIES = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  image_url: varchar("image_url", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const STORIES = mysqlTable("stories", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  synopsis: text("synopsis"),
  user_id: int("user_id").notNull().references(() => USERS.id), // New field referencing USERS
  category_id: int("category_id").notNull().references(() => CATEGORIES.id),
  cover_img: varchar("cover_img", { length: 255 }),
  story_type: varchar("story_type", { length: 50 }).notNull(),
  is_published: boolean("is_published").notNull().default(false), // New field for visibility
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const EPISODES = mysqlTable("episodes", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  name: varchar("name", { length: 255 }).notNull(),
  synopsis: text("synopsis"),
  episode_number: int("episode_number").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const CHARACTERS = mysqlTable("characters", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  name: varchar("name", { length: 255 }).notNull(),
  image_url: varchar("image_url", { length: 255 }),
  description: text("description"),
  is_sender: boolean("is_sender").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const CHAT_MESSAGES = mysqlTable("chat_messages", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  episode_id: int("episode_id"),
  character_id: int("character_id").notNull().references(() => CHARACTERS.id),
  message: text("message").notNull(),
  sequence: int("sequence").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const STORY_CONTENT = mysqlTable("story_content", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  episode_id: int("episode_id"),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});