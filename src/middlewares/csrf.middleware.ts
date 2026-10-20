import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { ForiddenError } from "../common/errors";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

export function verifyRequestOrigin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  const allowedOrigin = process.env.CLIENT_ORIGIN;

  if (!allowedOrigin || origin !== allowedOrigin) {
    return next(
      new ForiddenError("Request origin not allowed")
    );
  }

  next();
}