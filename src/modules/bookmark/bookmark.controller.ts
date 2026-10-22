import type { Request, Response } from "express";
import { BookmarkService } from "./bookmark.service.js";

import UnauthorizedError from "../../common/errors/unauthorized-error.js";

import { listBookmarksSchema } from "./bookmark.schema.js";

export class BookmarkController {
  private readonly service = new BookmarkService();

  private getUserId(req: Request): string {
    if (!req.auth) {
      throw new UnauthorizedError("Authentication required");
    }

    return req.auth.userId;
  }

  create = async (req: Request, res: Response) => {
    const bookmark = await this.service.create(this.getUserId(req), req.body);

    res.status(201).json({
      success: true,
      message: "Bookmark created successfully",
      data: bookmark,
    });
  };

  list = async (req: Request, res: Response) => {
    const filters = listBookmarksSchema.parse(req.query);

    const result = await this.service.list(this.getUserId(req), filters);

    res.status(200).json({
      success: true,
      data: result.bookmarks,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  };

  getById = async (req: Request, res: Response) => {
    const bookmark = await this.service.getById(
      this.getUserId(req),
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: bookmark,
    });
  };

  update = async (req: Request, res: Response) => {
    const bookmark = await this.service.update(
      this.getUserId(req),
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Bookmark updated successfully",
      data: bookmark,
    });
  };

  delete = async (req: Request, res: Response) => {
    await this.service.delete(this.getUserId(req), req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Bookmark deleted successfully",
    });
  };

  archive = async (req: Request, res: Response) => {
    const bookmark = await this.service.archive(
      this.getUserId(req),
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Bookmark archived successfully",
      data: bookmark,
    });
  };

  restore = async (req: Request, res: Response) => {
    const bookmark = await this.service.restore(
      this.getUserId(req),
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Bookmark restored successfully",
      data: bookmark,
    });
  };

  restoreAll = async (req: Request, res: Response) => {
    const result = await this.service.restoreAll(this.getUserId(req));

    res.status(200).json({
      success: true,
      message: "Bookmarks restored successfully",
      data: result,
    });
  };
}
