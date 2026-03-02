import { sqliteTable, text, index} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { TodoStatus, TodoPriority } from '../models/todo.model';

export const todos = sqliteTable(
  'todos',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status', { enum: [TodoStatus.PENDING, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED] })
      .notNull()
      .default(TodoStatus.PENDING),
    priority: text('priority', { enum: [TodoPriority.LOW, TodoPriority.MEDIUM, TodoPriority.HIGH] })
      .notNull()
      .default(TodoPriority.MEDIUM),
    dueDate: text('due_date'),
    completedAt: text('completed_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_todos_status').on(table.status),
    index('idx_todos_priority').on(table.priority),
    index('idx_todos_due_date').on(table.dueDate),
    index('idx_todos_created_at').on(table.createdAt),
    index('idx_todos_status_priority').on(table.status, table.priority),
  ]
);
