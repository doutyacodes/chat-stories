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

export const CAROUSEL_STORIES = mysqlTable("carousel_stories", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  position: int("position").notNull().default(1),  // Order of appearance in the carousel
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),  // Optional end date
  is_visible: boolean("is_visible").notNull().default(true),  // Show or hide story (default visible)
  created_at: timestamp("created_at").defaultNow(),
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

export const STORY_VIEWS = mysqlTable("story_views", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  user_id: int("user_id", { mode: 'nullable' }).references(() => USERS.id), // Correctly defining as nullable
  session_id: varchar("session_id", { length: 255 }),  // Unique session ID for non-logged-in users
  viewed_at: timestamp("viewed_at").defaultNow(),
  last_viewed_at: timestamp("last_viewed_at").defaultNow(),
});

export const STORY_LIKES = mysqlTable("story_likes", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  user_id: int("user_id").notNull().references(() => USERS.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const STORY_SUBSCRIPTIONS = mysqlTable("story_subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  subscriber_id: int("subscriber_id").notNull().references(() => USERS.id), // User subscribing
  author_id: int("author_id").notNull().references(() => USERS.id), // Author being subscribed to
  created_at: timestamp("created_at").defaultNow(),
});

export const STORY_SAVED = mysqlTable("story_saved", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id), // Story saved
  user_id: int("user_id").notNull().references(() => USERS.id), // User saving the story
  created_at: timestamp("created_at").defaultNow(),
});

export const USER_LAST_READ = mysqlTable("user_last_read", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => USERS.id),
  user_id: int("user_id", { mode: 'nullable' }).references(() => USERS.id), // Correctly defining as nullable
  session_id: varchar("session_id", { length: 255 }),  // Unique session ID for non-logged-in users
  story_id: int("story_id").notNull().references(() => STORIES.id),
  last_read_at: timestamp("last_read_at").defaultNow(), // Timestamp for sorting
});
