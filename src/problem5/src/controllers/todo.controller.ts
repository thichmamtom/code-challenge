import { Request, Response, NextFunction } from 'express';
import { TodoService } from '../services/todo.service';
import { TodoFilter } from '../models/todo.model';
import {
  getValidatedBody,
  getValidatedQuery,
  getValidatedParams,
} from '../middleware/validation.middleware';
import {
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosQuery,
} from '../schemas/todo.schema';
import { logger } from '../utils/logger';

interface IdParams {
  id: string;
}

export class TodoController {
  private service: TodoService;

  constructor() {
    this.service = new TodoService();
  }

  /**
   * POST /todos
   */
  create = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const body = getValidatedBody<CreateTodoInput>(res);
      logger.info('Processing create todo request', { title: body.title });
      const todo = await this.service.create(body);
      logger.info('Create todo request completed', { id: todo.id });
      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      logger.error('Error processing create todo request', { error });
      next(error);
    }
  };

  /**
   * GET /todos
   */
  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const query = getValidatedQuery<ListTodosQuery>(res);
      logger.info('Processing find all todos request', { query });

      const filter: TodoFilter = {
        title: query.title,
        status: query.status,
        priority: query.priority,
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      };

      const result = await this.service.findAll(filter);
      logger.info('Find all todos request completed', { total: result.pagination.total });
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error('Error processing find all todos request', { error });
      next(error);
    }
  };

  /**
   * GET /todos/:id
   */
  findById = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidatedParams<IdParams>(res);
      logger.info('Processing find todo by ID request', { id });
      const todo = await this.service.findById(id);

      if (!todo) {
        logger.warn('Todo not found for given ID', { id });
        res.status(404).json({ success: false, error: 'Todo not found' });
        return;
      }

      logger.info('Find todo by ID completed successfully', { id });
      res.json({ success: true, data: todo });
    } catch (error) {
      logger.error('Error processing find todo by ID request', { error });
      next(error);
    }
  };

  /**
   * PUT /todos/:id
   */
  update = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidatedParams<IdParams>(res);
      const body = getValidatedBody<UpdateTodoInput>(res);
      logger.info('Processing update todo request', { id, updates: body });
      const todo = await this.service.update(id, body);

      if (!todo) {
        logger.warn('Todo not found for update', { id });
        res.status(404).json({ success: false, error: 'Todo not found' });
        return;
      }

      logger.info('Update todo completed successfully', { id });
      res.json({ success: true, data: todo });
    } catch (error) {
      logger.error('Error processing update todo request', { error });
      next(error);
    }
  };

  /**
   * DELETE /todos/:id
   */
  delete = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidatedParams<IdParams>(res);
      logger.info('Processing delete todo request', { id });
      const deleted = await this.service.delete(id);

      if (!deleted) {
        logger.warn('Todo not found for deletion', { id });
        res.status(404).json({ success: false, error: 'Todo not found' });
        return;
      }

      logger.info('Delete todo completed successfully', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error processing delete todo request', { error });
      next(error);
    }
  };
}
