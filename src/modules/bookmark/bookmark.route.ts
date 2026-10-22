import { Router } from "express";

import { BookmarkController } from "./bookmark.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware.js";

import {
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkParamsSchema,
  listBookmarksSchema,
} from "./bookmark.schema.js";

const router = Router();
const controller = new BookmarkController();

// Protect all bookmark endpoints
router.use(authenticate);

// List bookmarks with validated query parameters
router.get("/", validateQuery(listBookmarksSchema), controller.list);

// Create a bookmark
router.post("/", validateBody(createBookmarkSchema), controller.create);

// Restore all archived bookmarks
router.patch("/restore-all", controller.restoreAll);

// Get a bookmark by ID
router.get("/:id", validateParams(bookmarkParamsSchema), controller.getById);

// Update a bookmark
router.patch(
  "/:id",
  validateParams(bookmarkParamsSchema),
  validateBody(updateBookmarkSchema),
  controller.update,
);

// Delete a bookmark
router.delete("/:id", validateParams(bookmarkParamsSchema), controller.delete);

// Archive a bookmark
router.patch(
  "/:id/archive",
  validateParams(bookmarkParamsSchema),
  controller.archive,
);

// Restore an archived bookmark
router.patch(
  "/:id/restore",
  validateParams(bookmarkParamsSchema),
  controller.restore,
);

export default router;
