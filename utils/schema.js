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
    has_episodes: boolean("has_episodes").notNull().default(false), // New field
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
    audio_url: varchar("audio_url", { length: 255 }).default(null), // Added with default NULL
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


export const STORY_CONTENT = mysqlTable("story_content", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  episode_id: int("episode_id"),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/* ---------------------------------------------------------- */

export const CHAT_MESSAGES = mysqlTable("chat_messages", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  episode_id: int("episode_id").notNull().references(() => EPISODES.id),
  slide_id: int("slide_id").notNull().references(() => SLIDES.id), // NEW FIELD
  character_id: int("character_id").notNull().references(() => CHARACTERS.id),
  message: text("message").notNull(),
  sequence: int("sequence").notNull(),
  has_puzzle: boolean("has_puzzle").default(false), // New field
  created_at: timestamp("created_at").defaultNow(),
});

export const SLIDES = mysqlTable("slides", {
  id: int("id").primaryKey().autoincrement(),
  story_id: int("story_id").notNull().references(() => STORIES.id),
  episode_id: int("episode_id").references(() => EPISODES.id), // Optional for slide-based episodes
  slide_type: mysqlEnum("slide_type", ["image", "chat", "conversation", "quiz", "pedometer", "location"]).notNull(),
  position: int("position").notNull(), // Order of the slide
  is_locked: boolean("is_locked").notNull().default(false), // Determines if a slide is gated by a quiz
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const SLIDE_CONTENT = mysqlTable("slide_content", {
  id: int("id").primaryKey().autoincrement(),
  slide_id: int("slide_id").notNull().references(() => SLIDES.id),
  media_type: mysqlEnum("media_type", ["image", "video"]).notNull(), // For slides with images/videos
  media_url: varchar("media_url", { length: 255 }),
  audio_url: varchar("audio_url", { length: 255 }), // New field for audio URLs
  description: text("description"),
  chat_story_id: int("chat_story_id").references(() => CHAT_MESSAGES.id), // For slides showing chat messages
  quiz_id: int("quiz_id").references(() => QUIZZES.id), // For slides gated by a quiz
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const QUIZZES = mysqlTable("quizzes", {
  id: int("id").primaryKey().autoincrement(),
  slide_id: int("slide_id").notNull().references(() => SLIDES.id),
  question: text("question").notNull(),
  answer_type: mysqlEnum("answer_type", ["text", "multiple_choice"]).notNull(), // Determines input type
  correct_answer: text("correct_answer").notNull(), 
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const QUIZ_OPTIONS = mysqlTable("quiz_options", {
  id: int("id").primaryKey().autoincrement(),
  quiz_id: int("quiz_id").notNull().references(() => QUIZZES.id),
  option_text: text("option_text").notNull(),
  is_correct: boolean("is_correct").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const ADS = mysqlTable("ads", {
  id: int("id").primaryKey().autoincrement(),
  media_type: mysqlEnum("media_type", ["image", "video"]).notNull(), // Type of ad
  media_url: varchar("media_url", { length: 255 }).notNull(), // URL of the ad
  duration: int("duration").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const EPISODE_DETAILS = mysqlTable("episode_details", {
  id: int("id").primaryKey().autoincrement(),
  episode_id: int("episode_id").notNull().references(() => EPISODES.id),
  media_type: varchar("media_type", { length: 50 }).notNull(), // "image" or "video"
  media_url: varchar("media_url", { length: 255 }).notNull(), // URL for the image or video
  description: text("description"), // Details about the scene
  order: int("order").notNull().default(1), // Order for display
  position: mysqlEnum('position', ['before', 'after']).notNull().default("before"),
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

export const PEDOMETER_TASKS = mysqlTable("pedometer_tasks", {
  id: int("id").primaryKey().autoincrement(),
  slide_id: int("slide_id").notNull().references(() => SLIDES.id), // Linked to a pedometer slide
  required_steps: int("required_steps").notNull(), // Number of steps needed to proceed
  description: text("description").notNull(), // field for additional details
  created_at: timestamp("created_at").defaultNow(),
});

export const LOCATION_TASKS = mysqlTable("location_tasks", {
  id: int("id").primaryKey().autoincrement(),
  slide_id: int("slide_id").notNull().references(() => SLIDES.id),
  latitude: decimal("latitude", 10, 8).notNull(),
  longitude: decimal("longitude", 11, 8).notNull(),
  radius: int("radius").notNull(), // in meters
  description: text("description").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// export const EPISODE_BRANCHES = mysqlTable("episode_branches", {
//   id: int("id").primaryKey().autoincrement(),
//   current_episode_id: int("current_episode_id").notNull().references(() => EPISODES.id),
//   choice_text: text("choice_text").notNull(), // What the user chooses
//   next_episode_id: int("next_episode_id").notNull().references(() => EPISODES.id),
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const CHAT_PUZZLES = mysqlTable("chat_puzzles", {
//   id: int("id").primaryKey().autoincrement(),
//   chat_message_id: int("chat_message_id").notNull().references(() => CHAT_MESSAGES.id),
//   question: text("question").notNull(),
//   correct_answer: text("correct_answer").notNull(),
//   options: text("options"), // JSON array for multiple-choice questions, if applicable
//   hint: text("hint"), // Optional hint for the user
//   created_at: timestamp("created_at").defaultNow(),
// });

// export const USER_PROGRESS = mysqlTable("user_progress", {
//   id: int("id").primaryKey().autoincrement(),
//   user_id: int("user_id").notNull().references(() => USERS.id),
//   story_id: int("story_id").notNull().references(() => STORIES.id),
//   chat_message_id: int("chat_message_id").notNull(),
//   is_completed: boolean("is_completed").default(false),
//   completed_at: timestamp("completed_at"),
// });
