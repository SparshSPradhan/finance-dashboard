import { Router } from 'express';
import { asyncHandler } from '../common/asyncHandler';
import { validate } from '../../middlewares/validate.middleware';
import { loginController } from './auth.controller';
import { loginSchema } from './auth.schema';

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: JWT and public user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User inactive
 */
const authRouter = Router();

authRouter.post('/login', validate(loginSchema), asyncHandler(loginController));

export { authRouter };
