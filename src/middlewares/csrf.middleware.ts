import type {Request, Response, NextFunction,} from "express";
import ForbiddenError from "../common/errors/forbidden-error";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

export function verifyRequestOrigin(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) {
    return next(
      new ForbiddenError("Request origin not allowed")
    );
  }

  next();
}