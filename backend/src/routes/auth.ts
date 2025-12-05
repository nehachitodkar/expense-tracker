import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export const authRouter = Router();

authRouter.post(
  '/signup',
  [
    body('name').isString().isLength({ min: 1 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, email, passwordHash }
      });

      const token = generateToken(user.id, user.email);
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user.id, user.email);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
);

function generateToken(id: number, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ id, email }, secret, { expiresIn: '1h' });
}


