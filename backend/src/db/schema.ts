import { pgTable, serial, varchar, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table users
export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  display_name: varchar('display_name', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

// Table films
export const films = pgTable('films', {
  film_id: serial('film_id').primaryKey(),
  omdb_id: varchar('omdb_id', { length: 50 }),
  title: varchar('title', { length: 255 }).notNull(),
  year: integer('year'),
  director: varchar('director', { length: 255 }),
  poster_url: text('poster_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

// Table categories
export const categories = pgTable('categories', {
  category_id: serial('category_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
});

// Table de liaison films_categories
export const filmsCategories = pgTable('films_categories', {
  film_id: integer('film_id').notNull().references(() => films.film_id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => categories.category_id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.film_id, table.category_id] }),
]);

// Table reviews
export const reviews = pgTable('reviews', {
  review_id: serial('review_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  film_id: integer('film_id').notNull().references(() => films.film_id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

// Table friends
export const friends = pgTable('friends', {
  friend_id: serial('friend_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  friend_user_id: integer('friend_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending'),
  created_at: timestamp('created_at').defaultNow(),
});

// Table messages
export const messages = pgTable('messages', {
  message_id: serial('message_id').primaryKey(),
  sender_id: integer('sender_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  receiver_id: integer('receiver_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  sent_at: timestamp('sent_at').defaultNow(),
});

// Relations pour faciliter les jointures
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  friendsInitiated: many(friends, { relationName: 'friendsInitiated' }),
  friendsReceived: many(friends, { relationName: 'friendsReceived' }),
  messagesSent: many(messages, { relationName: 'messagesSent' }),
  messagesReceived: many(messages, { relationName: 'messagesReceived' }),
}));

export const filmsRelations = relations(films, ({ many }) => ({
  reviews: many(reviews),
  categories: many(filmsCategories),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.user_id],
  }),
  film: one(films, {
    fields: [reviews.film_id],
    references: [films.film_id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  films: many(filmsCategories),
}));

export const filmsCategoriesRelations = relations(filmsCategories, ({ one }) => ({
  film: one(films, {
    fields: [filmsCategories.film_id],
    references: [films.film_id],
  }),
  category: one(categories, {
    fields: [filmsCategories.category_id],
    references: [categories.category_id],
  }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.user_id],
    references: [users.user_id],
    relationName: 'friendsInitiated',
  }),
  friendUser: one(users, {
    fields: [friends.friend_user_id],
    references: [users.user_id],
    relationName: 'friendsReceived',
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.user_id],
    relationName: 'messagesSent',
  }),
  receiver: one(users, {
    fields: [messages.receiver_id],
    references: [users.user_id],
    relationName: 'messagesReceived',
  }),
}));