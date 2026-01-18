import { mysqlTable, varchar, int, text, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Table users
export const users = mysqlTable('users', {
  user_id: int('user_id').autoincrement().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  display_name: varchar('display_name', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Table films
export const films = mysqlTable('films', {
  film_id: int('film_id').autoincrement().primaryKey(),
  omdb_id: varchar('omdb_id', { length: 50 }),
  title: varchar('title', { length: 255 }).notNull(),
  year: int('year'),
  director: varchar('director', { length: 255 }),
  poster_url: text('poster_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Table categories
export const categories = mysqlTable('categories', {
  category_id: int('category_id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
});

// Table de liaison films_categories
export const filmsCategories = mysqlTable('films_categories', {
  film_id: int('film_id').notNull().references(() => films.film_id, { onDelete: 'cascade' }),
  category_id: int('category_id').notNull().references(() => categories.category_id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.film_id, table.category_id] }),
]);

// Table reviews
export const reviews = mysqlTable('reviews', {
  review_id: int('review_id').autoincrement().primaryKey(),
  user_id: int('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  film_id: int('film_id').notNull().references(() => films.film_id, { onDelete: 'cascade' }),
  rating: int('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Table friends
export const friends = mysqlTable('friends', {
  friend_id: int('friend_id').autoincrement().primaryKey(),
  user_id: int('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  friend_user_id: int('friend_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending'),
  created_at: timestamp('created_at').defaultNow(),
});

// Table messages
export const messages = mysqlTable('messages', {
  message_id: int('message_id').autoincrement().primaryKey(),
  sender_id: int('sender_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  receiver_id: int('receiver_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
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