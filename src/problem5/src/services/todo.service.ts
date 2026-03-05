import { TodoRepository } from '../repositories/todo.repository';
import { getRedis } from '../db/redis';
import { config } from '../config';
import {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoFilter,
  PaginatedResult,
} from '../models/todo.model';
import { logger } from '../utils/logger';

export class TodoService {
  private repository: TodoRepository;

  constructor() {
    this.repository = new TodoRepository();
  }

  /**
   * Create a new todo and invalidate the list cache.
   */
  async create(dto: CreateTodoDto): Promise<Todo> {
    logger.debug('Service: Creating a new todo in database', { title: dto.title });
    const todo = await this.repository.create(dto);
    logger.debug('Service: Todo created, invalidating caches', { id: todo.id });
    await this.invalidateListCache();
    return todo;
  }

  /**
   * Get a single todo by ID with caching.
   */
  async findById(id: string): Promise<Todo | null> {
    const cacheKey = `${config.cache.prefix}${id}`;
    const redis = getRedis();

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Service: Cache hit for findById', { id });
          return JSON.parse(cached);
        }
      } catch (error) { logger.warn('Service: Redis get error', { error }); }
    }

    logger.debug('Service: Cache miss for findById, querying database', { id });
    const todo = await this.repository.findById(id);

    if (todo && redis) {
      try {
        await redis.setex(cacheKey, config.cache.ttl, JSON.stringify(todo));
        logger.debug('Service: Set cache for findById', { id });
      } catch (error) { logger.warn('Service: Redis setex error', { error }); }
    }

    return todo;
  }

  /**
   * List todos with filtering and pagination, with caching.
   */
  async findAll(filter: TodoFilter): Promise<PaginatedResult<Todo>> {
    const cacheKey = `${config.cache.prefix}list:${JSON.stringify(filter)}`;
    const redis = getRedis();

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logger.debug('Service: Cache hit for findAll');
          return JSON.parse(cached);
        }
      } catch (error) { logger.warn('Service: Redis get error', { error }); }
    }

    logger.debug('Service: Cache miss for findAll, querying database', { filter });
    const result = await this.repository.findAll(filter);

    if (redis) {
      try {
        await redis.setex(cacheKey, config.cache.ttl, JSON.stringify(result));
        logger.debug('Service: Set cache for findAll');
      } catch (error) { logger.warn('Service: Redis setex error', { error }); }
    }

    return result;
  }

  /**
   * Update a todo. Invalidates both item and list caches.
   */
  async update(id: string, dto: UpdateTodoDto): Promise<Todo | null> {
    logger.debug('Service: Updating todo in database', { id });
    const todo = await this.repository.update(id, dto);

    if (todo) {
      logger.debug('Service: Todo updated, invalidating caches', { id });
      await this.invalidateItemCache(id);
      await this.invalidateListCache();
    }

    return todo;
  }

  /**
   * Delete a todo. Invalidates caches.
   */
  async delete(id: string): Promise<boolean> {
    logger.debug('Service: Deleting todo from database', { id });
    const deleted = await this.repository.delete(id);

    if (deleted) {
      logger.debug('Service: Todo deleted, invalidating caches', { id });
      await this.invalidateItemCache(id);
      await this.invalidateListCache();
    }

    return deleted;
  }

  private async invalidateItemCache(id: string): Promise<void> {
    const redis = getRedis();
    if (redis) {
      try { await redis.del(`${config.cache.prefix}${id}`); } catch {
        // Skip error
      }
    }
  }

  private async invalidateListCache(): Promise<void> {
    const redis = getRedis();
    if (!redis) return;

    try {
      const pattern = `${config.cache.prefix}list:*`;
      let cursor = '0';
      do {
        const [newCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = newCursor;
        if (keys.length > 0) await redis.del(...keys);
      } while (cursor !== '0');
    } catch { 
      // Skip error
    }
  }
}
