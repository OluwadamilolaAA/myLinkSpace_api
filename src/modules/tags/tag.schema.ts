import { z } from "zod";

const tagNameSchema = z
  .string()
  .trim()
  .min(1, "Tag name is required")
  .max(35, "Tag name cannot exceed 35 characters");

  export const tagParamsSchema = z.strictObject({
    name: tagNameSchema
  })

  export const renameTagSchema = z.strictObject({
    rename: tagNameSchema
  })
