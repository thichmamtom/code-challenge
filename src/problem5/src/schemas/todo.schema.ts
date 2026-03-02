import { z } from 'zod';
import { TodoStatus, TodoPriority } from '../models/todo.model';

// --- Param Schemas ---

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
});

// --- Body Schemas ---

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or fewer'),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer').optional().default(''),
  status: z.nativeEnum(TodoStatus).optional().default(TodoStatus.PENDING),
  priority: z.nativeEnum(TodoPriority).optional().default(TodoPriority.MEDIUM),
  due_date: z.string().datetime({ message: 'Due date must be a valid ISO 8601 datetime' }).nullable().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TodoStatus).optional(),
  priority: z.nativeEnum(TodoPriority).optional(),
  due_date: z.string().datetime().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// --- Query Schemas ---

export const listTodosQuerySchema = z.object({
  title: z.string().optional(),
  status: z.nativeEnum(TodoStatus).optional(),
  priority: z.nativeEnum(TodoPriority).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a positive integer').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').optional(),
  sortBy: z.enum(['title', 'priority', 'due_date', 'created_at', 'updated_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).passthrough();

// --- Inferred Types ---

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
