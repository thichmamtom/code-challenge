import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ValidatedData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

// Validates a specific part of the request and stores the parsed result
//  * on `res.locals.validated[source]` for type-safe access in controllers.
function validate(source: 'body' | 'query' | 'params') {
  return (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn(`Validation failed for request ${source}`, {
          path: req.originalUrl,
          method: req.method,
          source,
          errors,
        });

        res.status(400).json({
          success: false,
          error: `Validation failed (${source})`,
          details: errors,
        });
        return;
      }

      // The validated data is stored on `res.locals.validated` so the
      // controller can retrieve it via the `getValidated` helper functions
      if (!res.locals.validated) {
        res.locals.validated = {} as ValidatedData;
      }
      (res.locals.validated as ValidatedData)[source] = result.data;

      // Also set body so existing Express middleware chains still work (workaround)
      if (source === 'body') {
        req.body = result.data;
      }

      next();
    };
  };
}

export const validateBody = validate('body');
export const validateQuery = validate('query');
export const validateParams = validate('params');

export function getValidatedBody<T>(res: Response): T {
  return (res.locals.validated as ValidatedData)?.body as T;
}

export function getValidatedQuery<T>(res: Response): T {
  return (res.locals.validated as ValidatedData)?.query as T;
}

export function getValidatedParams<T>(res: Response): T {
  return (res.locals.validated as ValidatedData)?.params as T;
}
