import type { z } from "zod";

import type {
  registerSchema,
  loginSchema,
} from "./auth.schema.js";

export type LoginMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;