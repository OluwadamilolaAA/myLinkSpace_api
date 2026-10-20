import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schema';
import { authenticate } from '../../middlewares/auth.middleware';
import { forgotPasswordLimiter, loginLimiter, registerLimiter, resetPasswordLimiter } from '../../middlewares/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post("/forgot-password", forgotPasswordLimiter,validateBody(forgotPasswordSchema),authController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

export default router;