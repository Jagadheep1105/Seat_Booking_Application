import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { CheckoutService } from '../services/checkout.service.js';

const router = Router();

const checkoutSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required')
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = checkoutSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = await CheckoutService.processCheckout(userId, parsed.reservationId);
    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[Checkout Error]:', err);
    res.status(500).json({ error: 'Failed to complete checkout' });
  }
});

export default router;
