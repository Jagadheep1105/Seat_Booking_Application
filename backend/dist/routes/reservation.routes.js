"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const reservation_service_js_1 = require("../services/reservation.service.js");
const router = (0, express_1.Router)();
const reserveSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1, 'Event ID is required'),
    seatIds: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one seat')
});
router.post('/', auth_middleware_js_1.requireAuth, async (req, res) => {
    try {
        const parsed = reserveSchema.parse(req.body);
        const userId = req.user.userId;
        const result = await reservation_service_js_1.ReservationService.reserveSeats(userId, parsed.eventId, parsed.seatIds);
        res.status(201).json(result);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('[Reserve Seats Error]:', err);
        res.status(500).json({ error: 'Failed to complete seat reservation' });
    }
});
router.delete('/:id', auth_middleware_js_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        await reservation_service_js_1.ReservationService.releaseReservation(userId, req.params.id);
        res.json({ message: 'Reservation released successfully' });
    }
    catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('[Release Reservation Error]:', err);
        res.status(500).json({ error: 'Failed to release reservation' });
    }
});
exports.default = router;
