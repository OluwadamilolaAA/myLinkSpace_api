import type { Request, Response } from "express";

import { UserService } from "./user.service.js";

import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "../../common/utils/session.js";

import UnauthorizedError from "../../common/errors/unauthorized-error.js";

export class UserController {
  private readonly service = new UserService();

  getProfile = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await this.service.getProfile(req.auth.userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  };

  updateProfile = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await this.service.updateProfile(req.auth.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  };

  changePassword = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    await this.service.changePassword(req.auth.userId, req.body);

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  };

  deleteAccount = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    await this.service.deleteAccount(req.auth.userId, req.body);

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  };
}
