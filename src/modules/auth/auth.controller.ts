import type { Request, Response } from "express";
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "../../common/utils/session.js";
import { AuthService } from "./auth.service.js";
import UnauthorizedError from "../../common/errors/unauthorized-error.js";

export class AuthController {
  private readonly service = new AuthService();

  register = async (req: Request, res: Response) => {
    const user = await this.service.register(req.body);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: user,
    });
  };

  login = async (req: Request, res: Response) => {
    const result = await this.service.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent")?.slice(0, 512),
    });

    res.cookie(
      SESSION_COOKIE_NAME,
      result.sessionToken,
      getSessionCookieOptions()
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        expiresAt: result.expiresAt,
      },
    });
  };

  logout = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    await this.service.logout(req.auth.sessionId);

    res.clearCookie(
      SESSION_COOKIE_NAME,
      getSessionCookieOptions()
    );

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  };
}