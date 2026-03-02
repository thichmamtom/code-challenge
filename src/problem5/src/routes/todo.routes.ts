import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.middleware';
import {
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
  idParamSchema,
} from '../schemas/todo.schema';

const router = Router();
const controller = new TodoController();

// POST /todos — Create a todo
router.post(
  '/',
  validateBody(createTodoSchema),
  controller.create
);

// GET /todos — List todos with filters
router.get(
  '/',
  validateQuery(listTodosQuerySchema),
  controller.findAll
);

// GET /todos/:id — Get todo details
router.get(
  '/:id',
  validateParams(idParamSchema),
  controller.findById
);

// PUT /todos/:id — Update a todo
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateTodoSchema),
  controller.update
);

// DELETE /todos/:id — Delete a todo
router.delete(
  '/:id',
  validateParams(idParamSchema),
  controller.delete
);

export default router;
