import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.schema';
import { authenticate } from '../../middlewares/auth.middleware';
import { loginLimiter, registerLimiter } from '../../middlewares/rate-limit.middleware';

const router = Router();
const authController = new AuthController();



router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);

export default router;