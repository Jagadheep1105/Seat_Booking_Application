import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { BookingService } from '../services/booking.service.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const bookings = await BookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (err: any) {
    console.error('[Get Bookings Error]:', err);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const booking = await BookingService.getBookingById(userId, req.params.id);
    res.json(booking);
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[Get Booking Details Error]:', err);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

router.post('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await BookingService.cancelBooking(userId, req.params.id);
    res.json(result);
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[Cancel Booking Error]:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
