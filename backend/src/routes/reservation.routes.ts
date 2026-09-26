import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { ReservationService } from '../services/reservation.service.js';

const router = Router();

const reserveSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  seatIds: z.array(z.string()).min(1, 'Select at least one seat')
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = reserveSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = await ReservationService.reserveSeats(
      userId,
      parsed.eventId,
      parsed.seatIds
    );

    res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[Reserve Seats Error]:', err);
    res.status(500).json({ error: 'Failed to complete seat reservation' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await ReservationService.releaseReservation(userId, req.params.id);
    res.json({ message: 'Reservation released successfully' });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[Release Reservation Error]:', err);
    res.status(500).json({ error: 'Failed to release reservation' });
  }
});

export default router;
