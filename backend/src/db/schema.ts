import { pgTable, serial, varchar, integer, text, timestamp, primaryKey, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Better Auth (user, session, account, verification) ---
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

export const session = pgTable('session', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

export const account = pgTable('account', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope', { length: 255 }),
  idToken: text('id_token'),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

export const verification = pgTable('verification', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

// --- App (films, categories, reviews, friends, messages) ---
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
  user_id: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  film_id: integer('film_id').notNull().references(() => films.film_id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date()),
});

// Table friends
export const friends = pgTable('friends', {
  friend_id: serial('friend_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  friend_user_id: integer('friend_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('pending'),
  created_at: timestamp('created_at').defaultNow(),
});

// Table messages
export const messages = pgTable('messages', {
  message_id: serial('message_id').primaryKey(),
  sender_id: integer('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  receiver_id: integer('receiver_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  sent_at: timestamp('sent_at').defaultNow(),
});

// Relations Better Auth
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  reviews: many(reviews),
  friendsInitiated: many(friends, { relationName: 'friendsInitiated' }),
  friendsReceived: many(friends, { relationName: 'friendsReceived' }),
  messagesSent: many(messages, { relationName: 'messagesSent' }),
  messagesReceived: many(messages, { relationName: 'messagesReceived' }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// Relations app

export const filmsRelations = relations(films, ({ many }) => ({
  reviews: many(reviews),
  categories: many(filmsCategories),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, {
    fields: [reviews.user_id],
    references: [user.id],
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
  user: one(user, {
    fields: [friends.user_id],
    references: [user.id],
    relationName: 'friendsInitiated',
  }),
  friendUser: one(user, {
    fields: [friends.friend_user_id],
    references: [user.id],
    relationName: 'friendsReceived',
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(user, {
    fields: [messages.sender_id],
    references: [user.id],
    relationName: 'messagesSent',
  }),
  receiver: one(user, {
    fields: [messages.receiver_id],
    references: [user.id],
    relationName: 'messagesReceived',
  }),
}));