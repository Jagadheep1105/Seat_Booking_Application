"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const index_js_1 = require("../db/index.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.parse(req.body);
        const db = await (0, index_js_1.getDb)();
        // Check if user exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [parsed.email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const hashedPass = await bcryptjs_1.default.hash(parsed.password, 10);
        await db.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'user')`, [userId, parsed.name, parsed.email, hashedPass]);
        const token = (0, auth_middleware_js_1.generateToken)({
            userId,
            email: parsed.email,
            name: parsed.name,
            role: 'user'
        });
        res.status(201).json({
            token,
            user: { id: userId, name: parsed.name, email: parsed.email, role: 'user' }
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('[Auth Register Error]:', err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const parsed = loginSchema.parse(req.body);
        const db = await (0, index_js_1.getDb)();
        const result = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [parsed.email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        const match = await bcryptjs_1.default.compare(parsed.password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = (0, auth_middleware_js_1.generateToken)({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('[Auth Login Error]:', err);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
});
exports.default = router;
