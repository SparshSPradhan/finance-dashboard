import { Router } from 'express';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../common/asyncHandler';
import { createUserController, listUsersController, updateUserController } from './user.controller';
import { createUserSchema, updateUserSchema } from './user.schema';

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     description: ADMIN only
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users (password never returned)
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not ADMIN
 *   post:
 *     tags: [Users]
 *     summary: Create a user
 *     description: ADMIN only
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already exists
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user name, role, or active status
 *     description: ADMIN only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user
 *       404:
 *         description: User not found
 */
const userRouter = Router();

userRouter.get('/', authorize('ADMIN'), asyncHandler(listUsersController));
userRouter.post('/', authorize('ADMIN'), validate(createUserSchema), asyncHandler(createUserController));
userRouter.patch('/:id', authorize('ADMIN'), validate(updateUserSchema), asyncHandler(updateUserController));

export { userRouter };
