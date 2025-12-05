import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

analyticsRouter.get(
  '/monthly',
  [query('year').optional().isInt(), query('month').optional().isInt({ min: 1, max: 12 })],
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const now = new Date();
    const year = parseInt((req.query.year as string) || `${now.getFullYear()}`, 10);
    const month = parseInt((req.query.month as string) || `${now.getMonth() + 1}`, 10);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    try {
      const total = await prisma.expense.aggregate({
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true }
      });

      const byCategory = await prisma.expense.groupBy({
        by: ['category'],
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true }
      });

      const trend = await prisma.expense.groupBy({
        by: ['date'],
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
        orderBy: { date: 'asc' }
      });

      res.json({
        totalThisMonth: total._sum.amount || 0,
        byCategory,
        trend
      });
    } catch (err) {
      next(err);
    }
  }
);

analyticsRouter.get('/category', async (req: AuthRequest, res, next) => {
  const userId = req.user!.id;

  try {
    const byCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    res.json({ byCategory });
  } catch (err) {
    next(err);
  }
});


