import { z } from "zod";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "./user.schema";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;