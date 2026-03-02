import { eq, like, and, asc, desc, count, SQL } from 'drizzle-orm';
import { getDatabase } from '../db/database';
import { todos } from '../db/schema';
import {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoFilter,
  PaginatedResult,
  TodoStatus,
  TodoPriority,
} from '../models/todo.model';
import { v4 as uuidv4 } from 'uuid';

export class TodoRepository {
  // Create a new todo in the database.
  create(dto: CreateTodoDto): Todo {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.insert(todos)
      .values({
        id,
        title: dto.title,
        description: dto.description || '',
        status: dto.status || TodoStatus.PENDING,
        priority: dto.priority || TodoPriority.MEDIUM,
        dueDate: dto.due_date || null,
        completedAt: dto.status === TodoStatus.COMPLETED ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return this.findById(id)!;
  }

  // Find a single todo by ID.
  findById(id: string): Todo | null {
    const db = getDatabase();
    const row = db.select().from(todos).where(eq(todos.id, id)).get();

    if (!row) return null;
    return this.mapRow(row);
  }

  // List todos with filtering, sorting, and pagination.
  findAll(filter: TodoFilter): PaginatedResult<Todo> {
    const db = getDatabase();
    const conditions: SQL[] = [];

    // Build WHERE conditions
    if (filter.title) {
      conditions.push(like(todos.title, `%${filter.title}%`));
    }
    if (filter.status) {
      conditions.push(eq(todos.status, filter.status));
    }
    if (filter.priority) {
      conditions.push(eq(todos.priority, filter.priority));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [{ total }] = db
      .select({ total: count() })
      .from(todos)
      .where(whereClause)
      .all();

    // Sorting
    const sortBy = filter.sortBy || 'created_at';
    const sortOrder = filter.sortOrder || 'desc';
    const sortColumnMap: Record<string, any> = {
      title: todos.title,
      priority: todos.priority,
      due_date: todos.dueDate,
      created_at: todos.createdAt,
      updated_at: todos.updatedAt,
    };
    const sortColumn = sortColumnMap[sortBy] || todos.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Pagination
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 10));
    const offset = (page - 1) * limit;

    const rows = db
      .select()
      .from(todos)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset)
      .all();

    return {
      data: rows.map(this.mapRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update a todo by ID.
  update(id: string, dto: UpdateTodoDto): Todo | null {
    const db = getDatabase();

    const existing = this.findById(id);
    if (!existing) return null;

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.status !== undefined) {
      updates.status = dto.status;
      // Auto-set completedAt when marking as completed
      if (dto.status === TodoStatus.COMPLETED && existing.status !== TodoStatus.COMPLETED) {
        updates.completedAt = new Date().toISOString();
      } else if (dto.status !== TodoStatus.COMPLETED) {
        updates.completedAt = null;
      }
    }
    if (dto.priority !== undefined) updates.priority = dto.priority;
    if (dto.due_date !== undefined) updates.dueDate = dto.due_date;

    db.update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .run();

    return this.findById(id)!;
  }

  // Delete a todo by ID. Returns true if deleted, false if not found.
  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.delete(todos).where(eq(todos.id, id)).run();
    return result.changes > 0;
  }

  // Map a Drizzle row to a Todo object.
  private mapRow(row: typeof todos.$inferSelect): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      due_date: row.dueDate,
      completed_at: row.completedAt,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    };
  }
}
