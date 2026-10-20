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
      getSessionCookieOptions(),
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

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  };

  forgotPassword = async (req: Request, res: Response) => {
    await this.service.forgotPassword(req.body);

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent.",
    });
  };

  resetPassword = async (req: Request, res: Response) => {
    await this.service.resetPassword(req.body);

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in again.",
    });
  };

  getSessions = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const sessions = await this.service.getSessions(
      req.auth.userId,
      req.auth.sessionId,
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  };

  revokeSession = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const sessionId = req.params.id;

    if (typeof sessionId !== "string") {
      throw new UnauthorizedError("Invalid session ID");
    }

    await this.service.revokeSession(req.auth.userId, sessionId);

    if (sessionId === req.auth.sessionId) {
      res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());
    }

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  };

  revokeOtherSessions = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = await this.service.revokeOtherSessions(
      req.auth.userId,
      req.auth.sessionId,
    );

    res.status(200).json({
      success: true,
      message: "Other sessions revoked successfully",
      data: {
        revokedCount: result.count,
      },
    });
  };
}
