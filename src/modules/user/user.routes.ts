import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "./user.schema";

const router = Router();

const userController = new UserController();

router.use(authenticate);

router.get("/me", userController.getProfile);
router.patch("/me", validateBody(updateProfileSchema), userController.updateProfile);
router.patch("/me/password", validateBody(changePasswordSchema), userController.changePassword);
router.delete("/me", validateBody(deleteAccountSchema), userController.deleteAccount);

export default router;