import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { EventService } from '../services/event.service.js';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(2, 'Category is required'),
  date: z.string().min(2, 'Date is required'),
  time: z.string().min(2, 'Time is required'),
  venueName: z.string().min(2, 'Venue Name is required'),
  description: z.string().min(10, 'Description is required'),
  imageUrl: z.string().optional(),
  vipPrice: z.number().min(1, 'VIP price must be greater than 0'),
  premiumPrice: z.number().min(1, 'Premium price must be greater than 0'),
  regularPrice: z.number().min(1, 'Regular price must be greater than 0')
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const events = await EventService.getEvents(category, search);
    res.json(events);
  } catch (err: any) {
    console.error('[Get Events Error]:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createEventSchema.parse(req.body);
    const result = await EventService.createEvent(parsed);
    res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[Create Event Error]:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await EventService.getEventById(req.params.id);
    res.json(event);
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('[Get Event Details Error]:', err);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

router.get('/:id/seats', async (req: Request, res: Response) => {
  try {
    const seats = await EventService.getEventSeats(req.params.id);
    res.json(seats);
  } catch (err: any) {
    console.error('[Get Event Seats Error]:', err);
    res.status(500).json({ error: 'Failed to fetch event seat map' });
  }
});

export default router;
