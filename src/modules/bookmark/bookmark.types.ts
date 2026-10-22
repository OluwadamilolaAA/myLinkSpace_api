import z from "zod";
import { createBookmarkSchema, listBookmarksSchema, updateBookmarkSchema } from "./bookmark.schema";

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
export type ListBookmarksInput = z.infer<typeof listBookmarksSchema>;