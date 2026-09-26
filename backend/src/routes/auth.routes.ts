import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../db/index.js';
import { generateToken } from '../middleware/auth.middleware.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const db = await getDb();

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [parsed.email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const hashedPass = await bcrypt.hash(parsed.password, 10);

    await db.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'user')`,
      [userId, parsed.name, parsed.email, hashedPass]
    );

    const token = generateToken({
      userId,
      email: parsed.email,
      name: parsed.name,
      role: 'user'
    });

    res.status(201).json({
      token,
      user: { id: userId, name: parsed.name, email: parsed.email, role: 'user' }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const db = await getDb();

    const result = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [parsed.email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(parsed.password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

export default router;
