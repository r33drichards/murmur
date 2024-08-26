import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { string } from 'zod'

export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(), // GitHub Id
  title: text('title').notNull(),
  completed: integer('completed').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull(), // GitHub Id
  fileName: text('name').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})