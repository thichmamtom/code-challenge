import { eq, like, and, asc, desc, count, SQL } from 'drizzle-orm';
import { db } from '../db/database';
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
  async create(dto: CreateTodoDto): Promise<Todo> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(todos)
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
      });

    return (await this.findById(id))!;
  }

  // Find a single todo by ID.
  async findById(id: string): Promise<Todo | null> {
    const rows = await db.select().from(todos).where(eq(todos.id, id));
    const row = rows[0];

    if (!row) return null;
    return this.mapRow(row);
  }

  // List todos with filtering, sorting, and pagination.
  async findAll(filter: TodoFilter): Promise<PaginatedResult<Todo>> {
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
    const [{ total }] = await db
      .select({ total: count() })
      .from(todos)
      .where(whereClause);

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

    const rows = await db
      .select()
      .from(todos)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

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
  async update(id: string, dto: UpdateTodoDto): Promise<Todo | null> {
    const existing = await this.findById(id);
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

    await db.update(todos)
      .set(updates)
      .where(eq(todos.id, id));

    return (await this.findById(id))!;
  }

  // Delete a todo by ID. Returns true if deleted, false if not found.
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(todos).where(eq(todos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Map a Drizzle row to a Todo object.
  private mapRow(row: typeof todos.$inferSelect): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TodoStatus,
      priority: row.priority as TodoPriority,
      due_date: row.dueDate,
      completed_at: row.completedAt,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    };
  }
}
