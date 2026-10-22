import { z } from "zod";

const urlSchema = z
  .url()
  .max(2048)
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "URL must use HTTP or HTTPS");

const tagsSchema = z
  .array(z.string().trim().min(1).max(35))
  .max(8, "A bookmark can have at most 8 tags")
  .transform((tags) => {
    const seen = new Set<string>();

    return tags.filter((tag) => {
      const key = tag.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  });

export const createBookmarkSchema = z.strictObject({
  title: z.string().trim().min(1).max(80),
  url: urlSchema,
  description: z.string().trim().max(2000).default(""),
  category: z.string().trim().min(1).max(35),
  tags: tagsSchema.default([]),
});

export const updateBookmarkSchema = createBookmarkSchema
  .safeExtend({})
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export const bookmarkParamsSchema = z.strictObject({
  id: z.uuid(),
});

export const listBookmarksSchema = z.strictObject({
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().min(1).max(35).optional(),
  tag: z.string().trim().min(1).max(35).optional(),

  archived: z.enum(["true", "false"]).default("false"),

  sort: z.enum(["newest", "title"]).default("newest"),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});
