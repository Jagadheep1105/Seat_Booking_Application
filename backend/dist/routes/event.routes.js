"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const event_service_js_1 = require("../services/event.service.js");
const router = (0, express_1.Router)();
const createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title is required'),
    category: zod_1.z.string().min(2, 'Category is required'),
    date: zod_1.z.string().min(2, 'Date is required'),
    time: zod_1.z.string().min(2, 'Time is required'),
    venueName: zod_1.z.string().min(2, 'Venue Name is required'),
    description: zod_1.z.string().min(10, 'Description is required'),
    imageUrl: zod_1.z.string().optional(),
    vipPrice: zod_1.z.number().min(1, 'VIP price must be greater than 0'),
    premiumPrice: zod_1.z.number().min(1, 'Premium price must be greater than 0'),
    regularPrice: zod_1.z.number().min(1, 'Regular price must be greater than 0')
});
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const search = req.query.search;
        const events = await event_service_js_1.EventService.getEvents(category, search);
        res.json(events);
    }
    catch (err) {
        console.error('[Get Events Error]:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});
router.post('/', async (req, res) => {
    try {
        const parsed = createEventSchema.parse(req.body);
        const result = await event_service_js_1.EventService.createEvent(parsed);
        res.status(201).json(result);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('[Create Event Error]:', err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const event = await event_service_js_1.EventService.getEventById(req.params.id);
        res.json(event);
    }
    catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('[Get Event Details Error]:', err);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
});
router.get('/:id/seats', async (req, res) => {
    try {
        const seats = await event_service_js_1.EventService.getEventSeats(req.params.id);
        res.json(seats);
    }
    catch (err) {
        console.error('[Get Event Seats Error]:', err);
        res.status(500).json({ error: 'Failed to fetch event seat map' });
    }
});
exports.default = router;
