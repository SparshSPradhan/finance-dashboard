import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authRouter } from '../modules/auth/auth.route';
import { dashboardRouter } from '../modules/dashboard/dashboard.route';
import { recordRouter } from '../modules/records/record.route';
import { userRouter } from '../modules/users/user.route';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/users', authenticate, userRouter);
router.use('/records', authenticate, recordRouter);
router.use('/dashboard', authenticate, dashboardRouter);

export { router };
