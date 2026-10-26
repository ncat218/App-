import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const appStates = sqliteTable('app_states', { owner: text('owner').primaryKey(), payload: text('payload').notNull(), revision: integer('revision').notNull().default(0) });
