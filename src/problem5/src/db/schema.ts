import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { TodoStatus, TodoPriority } from '../models/todo.model';

export const todos = pgTable(
  'todos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull().default(''),
    status: varchar('status', { length: 20, enum: [TodoStatus.PENDING, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED] })
      .notNull()
      .default(TodoStatus.PENDING),
    priority: varchar('priority', { length: 10, enum: [TodoPriority.LOW, TodoPriority.MEDIUM, TodoPriority.HIGH] })
      .notNull()
      .default(TodoPriority.MEDIUM),
    dueDate: timestamp('due_date', { mode: 'string' }),
    completedAt: timestamp('completed_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_todos_status').on(table.status),
    index('idx_todos_priority').on(table.priority),
    index('idx_todos_due_date').on(table.dueDate),
    index('idx_todos_created_at').on(table.createdAt),
    index('idx_todos_status_priority').on(table.status, table.priority),
  ]
);
