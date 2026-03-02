export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string | null;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string | null;
}

export interface TodoFilter {
  title?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'priority' | 'due_date' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
