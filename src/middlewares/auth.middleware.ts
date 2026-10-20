import type { Request, Response, NextFunction } from "express";

import { AuthRepository } from "../modules/auth/auth.repository.js";

import {
  SESSION_COOKIE_NAME,
  hashSessionToken,
} from "../common/utils/session.js";

import UnauthorizedError from "../common/errors/unauthorized-error.js";

const repository = new AuthRepository();

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      throw new UnauthorizedError("Authentication required");
    }

    const tokenHash = hashSessionToken(token);

    const session = await repository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError("Invalid or expired session");
    }

    if (session.expiresAt <= new Date()) {
      await repository.deleteSession(session.id);

      throw new UnauthorizedError("Invalid or expired session");
    }

    req.auth = {
      userId: session.userId,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}
