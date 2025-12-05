import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const expensesRouter = Router();

expensesRouter.use(authMiddleware);

expensesRouter.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    query('search').optional().isString()
  ],
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '10', 10);
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = { userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    try {
      const [items, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          orderBy: { date: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.expense.count({ where })
      ]);

      res.json({
        data: items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

expensesRouter.post(
  '/',
  [
    body('amount').isFloat({ gt: 0 }),
    body('category').isString().isLength({ min: 1 }),
    body('description').optional().isString(),
    body('date').isISO8601()
  ],
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const { amount, category, description, date } = req.body;

    try {
      const expense = await prisma.expense.create({
        data: {
          userId,
          amount,
          category,
          description: description || '',
          date: new Date(date)
        }
      });
      res.status(201).json(expense);
    } catch (err) {
      next(err);
    }
  }
);

expensesRouter.put(
  '/:id',
  [
    param('id').isInt(),
    body('amount').optional().isFloat({ gt: 0 }),
    body('category').optional().isString().isLength({ min: 1 }),
    body('description').optional().isString(),
    body('date').optional().isISO8601()
  ],
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);

    try {
      const existing = await prisma.expense.findFirst({ where: { id, userId } });
      if (!existing) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      const { amount, category, description, date } = req.body;
      const expense = await prisma.expense.update({
        where: { id },
        data: {
          amount,
          category,
          description,
          date: date ? new Date(date) : undefined
        }
      });
      res.json(expense);
    } catch (err) {
      next(err);
    }
  }
);

expensesRouter.delete(
  '/:id',
  [param('id').isInt()],
  async (req: AuthRequest, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);

    try {
      const existing = await prisma.expense.findFirst({ where: { id, userId } });
      if (!existing) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      await prisma.expense.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);


