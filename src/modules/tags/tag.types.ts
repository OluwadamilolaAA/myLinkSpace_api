import { z } from "zod";
import { renameTagSchema, tagParamsSchema } from "./tag.schema";

export type TagParams = z.infer<typeof tagParamsSchema>

export type RenameTagInput = z.infer<typeof renameTagSchema>

export type TagSummary = {
  name: string;
  activeCount: number;
  archivedCount: number;
  totalCount: number;
};