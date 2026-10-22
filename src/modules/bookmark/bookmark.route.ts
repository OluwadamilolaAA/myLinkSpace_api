import { Router } from "express";

import { BookmarkController } from "./bookmark.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

import { validateBody } from "../../middlewares/validate.middleware.js";

import {
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkParamsSchema,
} from "./bookmark.schema.js";

const router = Router();

const controller = new BookmarkController();

const validateBookmarkId = (
  req: import("express").Request,
  _res: import("express").Response,
  next: import("express").NextFunction,
) => {
  const result = bookmarkParamsSchema.safeParse(req.params);

  if (!result.success) {
    return next(result.error);
  }

  next();
};

// All bookmark routes require authentication
router.use(authenticate);

router.get("/", controller.list);

router.post("/", validateBody(createBookmarkSchema), controller.create);

router.patch("/restore-all", controller.restoreAll);

router.get("/:id", validateBookmarkId, controller.getById);

router.patch(
  "/:id",
  validateBookmarkId,
  validateBody(updateBookmarkSchema),
  controller.update,
);

router.delete("/:id", validateBookmarkId, controller.delete);

router.patch("/:id/archive", validateBookmarkId, controller.archive);

router.patch("/:id/restore", validateBookmarkId, controller.restore);

export default router;

