import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import type { ZodType } from "zod";

// Validate request body
export function validateBody(schema: ZodType): RequestHandler {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Validate route parameters
export function validateParams(schema: ZodType): RequestHandler {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Validate query parameters
export function validateQuery(schema: ZodType): RequestHandler {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Express 5 exposes req.query as a getter.
      // Store the validated result in res.locals instead.
      res.locals.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}