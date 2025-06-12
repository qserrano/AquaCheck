import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ZodTypeAny } from 'zod';

type Schemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validate = (schemas: Schemas) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const validatedBody = await schemas.body.parseAsync(req.body);
        req.body = validatedBody;
      }
      if (schemas.params) await schemas.params.parseAsync(req.params);
      if (schemas.query) await schemas.query.parseAsync(req.query);
      next();
    } catch (error) {
      console.error('Error de validación:', error);
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };