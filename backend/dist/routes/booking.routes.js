"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const booking_service_js_1 = require("../services/booking.service.js");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_js_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const bookings = await booking_service_js_1.BookingService.getUserBookings(userId);
        res.json(bookings);
    }
    catch (err) {
        console.error('[Get Bookings Error]:', err);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
});
router.get('/:id', auth_middleware_js_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const booking = await booking_service_js_1.BookingService.getBookingById(userId, req.params.id);
        res.json(booking);
    }
    catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('[Get Booking Details Error]:', err);
        res.status(500).json({ error: 'Failed to fetch booking details' });
    }
});
router.post('/:id/cancel', auth_middleware_js_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await booking_service_js_1.BookingService.cancelBooking(userId, req.params.id);
        res.json(result);
    }
    catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('[Cancel Booking Error]:', err);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});
exports.default = router;
